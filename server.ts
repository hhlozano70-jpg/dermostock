import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load local environment variables (.env or .env.local)
dotenv.config();
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Allow large payloads for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists for local fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ----------------------------------------------------
// FIREBASE FIRESTORE INITIALIZATION
// ----------------------------------------------------
let firestoreDb: admin.firestore.Firestore | null = null;
let isFirestoreAvailable = false;

function initFirebase() {
  if (firestoreDb) return firestoreDb;

  try {
    // 1. Full JSON string in FIREBASE_SERVICE_ACCOUNT (common in Render environment variables)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // Handle base64 encoded string if provided
      if (raw.startsWith('ey') && !raw.startsWith('{')) {
        raw = Buffer.from(raw, 'base64').toString('utf-8');
      }
      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firestoreDb = admin.firestore();
      isFirestoreAvailable = true;
      console.log('✅ Connected to Firebase Firestore using FIREBASE_SERVICE_ACCOUNT env variable');
      return firestoreDb;
    }

    // 2. Individual environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      firestoreDb = admin.firestore();
      isFirestoreAvailable = true;
      console.log('✅ Connected to Firebase Firestore using individual env variables');
      return firestoreDb;
    }

    // 3. Service account JSON file on disk (Render Secret Files or local file)
    const possibleFilePaths = [
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      path.resolve(__dirname, 'firebase-service-account.json'),
      '/etc/secrets/firebase-service-account.json', // Standard Render Secret File path
    ].filter(Boolean) as string[];

    for (const filePath of possibleFilePaths) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const serviceAccount = JSON.parse(fileContent);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        firestoreDb = admin.firestore();
        isFirestoreAvailable = true;
        console.log(`✅ Connected to Firebase Firestore using credentials file: ${filePath}`);
        return firestoreDb;
      }
    }

    // 4. Application Default Credentials (GCP environment)
    if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT) {
      admin.initializeApp();
      firestoreDb = admin.firestore();
      isFirestoreAvailable = true;
      console.log('✅ Connected to Firebase Firestore via Application Default Credentials');
      return firestoreDb;
    }
  } catch (err) {
    console.error('⚠️ Could not initialize Firebase Admin:', err);
  }

  console.log('ℹ️ Firebase credentials not found. Operating in local mode (data/store.json)');
  return null;
}

// Helper: read local JSON store
function readLocalStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local store.json:', err);
  }
  return null;
}

// Helper: write local JSON store
function writeLocalStore(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing local store.json:', err);
    return false;
  }
}

// Helper: Read from Firestore
async function readFirestoreStore() {
  if (!firestoreDb) return null;
  try {
    const productsSnapshot = await firestoreDb.collection('dermostock_products').get();
    const movementsSnapshot = await firestoreDb.collection('dermostock_movements').get();
    const ordersSnapshot = await firestoreDb.collection('dermostock_orders').get();
    const configDoc = await firestoreDb.collection('dermostock_config').doc('settings').get();

    const products = productsSnapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    const movements = movementsSnapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    const orders = ordersSnapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    const config = configDoc.exists ? configDoc.data() : null;

    if (products.length === 0) {
      return null;
    }

    return {
      products,
      movements,
      orders,
      priceTier: config?.priceTier || 'comercial',
      settings: config?.settings || null,
      lastUpdated: config?.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error reading from Firestore:', err);
    return null;
  }
}

// Helper: Save to Firestore
async function writeFirestoreStore(data: {
  products: any[];
  movements?: any[];
  orders?: any[];
  priceTier?: string;
  settings?: any;
  lastUpdated?: string;
}) {
  if (!firestoreDb) return false;
  try {
    const { products = [], movements = [], orders = [], priceTier = 'comercial', settings = null, lastUpdated = new Date().toISOString() } = data;

    const existingProductsSnapshot = await firestoreDb.collection('dermostock_products').select().get();
    const currentProductIds = new Set(products.map((p) => p.id));

    let batch = firestoreDb.batch();
    let opCount = 0;

    const commitBatchIfNeeded = async () => {
      if (opCount >= 400) {
        await batch.commit();
        batch = firestoreDb!.batch();
        opCount = 0;
      }
    };

    // Upsert products
    for (const prod of products) {
      const docRef = firestoreDb.collection('dermostock_products').doc(prod.id);
      batch.set(docRef, prod);
      opCount++;
      await commitBatchIfNeeded();
    }

    // Delete products removed in frontend
    for (const doc of existingProductsSnapshot.docs) {
      if (!currentProductIds.has(doc.id)) {
        batch.delete(doc.ref);
        opCount++;
        await commitBatchIfNeeded();
      }
    }

    // Upsert movements
    for (const mov of movements) {
      const movId = mov.id || `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const docRef = firestoreDb.collection('dermostock_movements').doc(movId);
      batch.set(docRef, { ...mov, id: movId });
      opCount++;
      await commitBatchIfNeeded();
    }

    // Upsert orders
    for (const ord of orders) {
      const ordId = ord.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const docRef = firestoreDb.collection('dermostock_orders').doc(ordId);
      batch.set(docRef, { ...ord, id: ordId });
      opCount++;
      await commitBatchIfNeeded();
    }

    // Upsert settings
    const configRef = firestoreDb.collection('dermostock_config').doc('settings');
    batch.set(configRef, { priceTier, settings, lastUpdated }, { merge: true });
    opCount++;

    if (opCount > 0) {
      await batch.commit();
    }

    return true;
  } catch (err) {
    console.error('Error writing to Firestore:', err);
    return false;
  }
}

// Auto-seed Firestore from local store.json if Firestore collection is brand new
async function seedFirestoreIfEmpty() {
  if (!firestoreDb) return;
  try {
    const snapshot = await firestoreDb.collection('dermostock_products').limit(1).get();
    if (snapshot.empty) {
      const localStore = readLocalStore();
      if (localStore && Array.isArray(localStore.products) && localStore.products.length > 0) {
        console.log(`🌱 Seeding Firestore with ${localStore.products.length} products from store.json...`);
        await writeFirestoreStore(localStore);
        console.log('✅ Firestore initial seed completed successfully!');
      }
    }
  } catch (err) {
    console.error('Error during Firestore auto-seed check:', err);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    storage: isFirestoreAvailable ? 'firestore' : 'local-json',
    time: new Date().toISOString(),
  });
});

// GET full synchronized state
app.get('/api/data', async (_req, res) => {
  // 1. Try Firestore if available
  if (isFirestoreAvailable) {
    const firestoreData = await readFirestoreStore();
    if (firestoreData && Array.isArray(firestoreData.products) && firestoreData.products.length > 0) {
      return res.json(firestoreData);
    }
  }

  // 2. Fallback to local store.json
  const localStore = readLocalStore();
  if (localStore && Array.isArray(localStore.products) && localStore.products.length > 0) {
    return res.json(localStore);
  }

  // 3. Empty state
  return res.json({ products: null, movements: null, orders: null, priceTier: null });
});

// POST full synchronized state (called by client on changes)
app.post('/api/data', async (req, res) => {
  const { products, movements, orders, priceTier, settings } = req.body;
  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'Invalid payload: products array required' });
  }

  const payload = {
    products,
    movements: movements || [],
    orders: orders || [],
    priceTier: priceTier || 'comercial',
    settings: settings || null,
    lastUpdated: new Date().toISOString(),
  };

  // Always keep local store as backup
  writeLocalStore(payload);

  // If Firestore is available, save to Firestore
  if (isFirestoreAvailable) {
    const success = await writeFirestoreStore(payload);
    if (!success) {
      return res.status(500).json({ error: 'Failed to write to Firestore' });
    }
  }

  return res.json({ success: true, lastUpdated: payload.lastUpdated, storage: isFirestoreAvailable ? 'firestore' : 'local-json' });
});

// ----------------------------------------------------
// SERVER BOOTSTRAP
// ----------------------------------------------------
async function startServer() {
  // Initialize Firestore if credentials are provided
  initFirebase();
  if (isFirestoreAvailable) {
    await seedFirestoreIfEmpty();
  }

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DermoStock server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
    console.log(`Persistence mode: ${isFirestoreAvailable ? '🔥 Firebase Firestore' : '📁 Local store.json'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
