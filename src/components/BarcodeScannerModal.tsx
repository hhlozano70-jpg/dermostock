import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Scan, 
  Camera, 
  ShoppingBag, 
  PackagePlus, 
  Search, 
  Check, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Plus, 
  Keyboard,
  Barcode,
  Zap,
  Save,
  FileEdit,
  RefreshCw
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useInventory } from '../context/InventoryContext';
import { Product, Brand, Category } from '../types/inventory';
import { playScanBeep } from '../utils/sound';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'store' | 'inventory' | 'lookup';
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'store',
}) => {
  const { 
    products, 
    addToCart, 
    addStockMovement, 
    addProduct,
    openProductModal, 
    setSelectedProductForQuickView 
  } = useInventory();

  const [mode, setMode] = useState<'store' | 'inventory' | 'lookup'>(initialMode);
  const [manualCode, setManualCode] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  // Scanner status
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAddToCart, setAutoAddToCart] = useState(false);
  const [autoAddStock, setAutoAddStock] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Quick Inline Add Form for unregistered barcodes
  const [showQuickAddForm, setShowQuickAddForm] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickBrand, setQuickBrand] = useState<Brand>('Nivea');
  const [quickCategory, setQuickCategory] = useState<Category>('Cuidado Corporal');
  const [quickPrice, setQuickPrice] = useState<number>(120);
  const [quickStock, setQuickStock] = useState<number>(5);

  // Inventory reception mode state
  const [stockAddQty, setStockAddQty] = useState<number>(1);
  const [stockAddSuccessMsg, setStockAddSuccessMsg] = useState<string | null>(null);
  const [cartAddSuccessMsg, setCartAddSuccessMsg] = useState<string | null>(null);

  // History of recent scans
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; product?: Product; timestamp: Date }>>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  
  // Rate limiter / Debounce refs to prevent frame overload on mobile
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedTextRef = useRef<string>('');
  const isHandlingScanRef = useRef<boolean>(false);

  // Sync mode with prop
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMatchedProduct(null);
      setNotFoundCode(null);
      setShowQuickAddForm(false);
      setStockAddSuccessMsg(null);
      setCartAddSuccessMsg(null);
      lastScannedTextRef.current = '';
      lastScannedTimeRef.current = 0;
    }
  }, [isOpen, initialMode]);

  // Product finder helper
  const findProductByCode = useCallback((rawCode: string): Product | null => {
    const clean = rawCode.trim().toLowerCase();
    if (!clean) return null;

    return products.find((p) => {
      const matchBarcode = p.barcode && p.barcode.toLowerCase() === clean;
      const matchSku = p.sku && p.sku.toLowerCase() === clean;
      const matchId = p.id && p.id.toLowerCase() === clean;
      const matchNumeric = clean.length >= 4 && (p.sku.toLowerCase().includes(clean) || clean.includes(p.sku.toLowerCase()));
      return matchBarcode || matchSku || matchId || matchNumeric;
    }) || null;
  }, [products]);

  // State refs for stable access inside camera callback without triggering camera re-renders
  const productsRef = useRef(products);
  productsRef.current = products;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const autoAddToCartRef = useRef(autoAddToCart);
  autoAddToCartRef.current = autoAddToCart;

  const autoAddStockRef = useRef(autoAddStock);
  autoAddStockRef.current = autoAddStock;

  // Handle a successfully detected barcode (strictly throttled)
  const handleCodeDetected = useCallback((rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) return;

    const now = Date.now();
    // 2.5 second cooldown if scanning the exact same code repeatedly
    if (trimmed === lastScannedTextRef.current && now - lastScannedTimeRef.current < 2500) {
      return;
    }
    // 800ms cooldown between different codes
    if (now - lastScannedTimeRef.current < 800) {
      return;
    }

    if (isHandlingScanRef.current) return;
    isHandlingScanRef.current = true;

    lastScannedTextRef.current = trimmed;
    lastScannedTimeRef.current = now;
    setLastScannedCode(trimmed);

    // Look up in current products
    const prod = findProductByCode(trimmed);

    if (prod) {
      if (soundEnabledRef.current) playScanBeep('success');
      setMatchedProduct(prod);
      setNotFoundCode(null);
      setShowQuickAddForm(false);

      // Add to history
      setScanHistory((prev) => [
        { code: trimmed, product: prod, timestamp: new Date() },
        ...prev.slice(0, 7),
      ]);

      // Handle Store auto-add
      if (modeRef.current === 'store' && autoAddToCartRef.current) {
        addToCart(prod, 1);
        setCartAddSuccessMsg(`¡${prod.name} agregado al carrito!`);
        setTimeout(() => setCartAddSuccessMsg(null), 2500);
      }

      // Handle Almacén auto-add
      if (modeRef.current === 'inventory' && autoAddStockRef.current) {
        addStockMovement(
          prod.id,
          'entrada',
          1,
          `Entrada rápida por escáner (${prod.sku})`,
          'SCAN-AUTO'
        );
        setStockAddSuccessMsg(`+1 pieza sumada a ${prod.name} (Stock: ${prod.stock + 1})`);
        setTimeout(() => setStockAddSuccessMsg(null), 2500);
      }
    } else {
      if (soundEnabledRef.current) playScanBeep('error');
      setMatchedProduct(null);
      setNotFoundCode(trimmed);
      // Pre-fill quick add form
      setQuickName('');
      setQuickPrice(120);
      setQuickStock(5);
      
      setScanHistory((prev) => [
        { code: trimmed, timestamp: new Date() },
        ...prev.slice(0, 7),
      ]);
    }

    setTimeout(() => {
      isHandlingScanRef.current = false;
    }, 400);
  }, [findProductByCode, addToCart, addStockMovement]);

  // Keep a stable ref to handleCodeDetected so camera effect never restarts
  const handleCodeDetectedRef = useRef(handleCodeDetected);
  handleCodeDetectedRef.current = handleCodeDetected;

  // Gracefully stop the camera before closing modal or switching screens
  const safeStopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Camera stop warning:', e);
      }
    }
    setIsScanning(false);
  };

  const handleModalClose = async () => {
    await safeStopCamera();
    onClose();
  };

  // Switch to Full Edit Modal cleanly
  const handleGoToFullAddModal = async (codeToPreFill: string) => {
    await safeStopCamera();
    onClose();
    openProductModal({ barcode: codeToPreFill });
  };

  // Hardware barcode scanner (Keyboard wedge) listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          handleCodeDetectedRef.current(barcodeBufferRef.current);
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        if (diff > 80 && barcodeBufferRef.current.length > 0) {
          barcodeBufferRef.current = '';
        }
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Camera start/stop lifecycle (STABLE: only triggers on isOpen or camera change)
  useEffect(() => {
    let isCancelled = false;

    if (!isOpen) {
      safeStopCamera();
      return;
    }

    const startCameraScanner = async () => {
      try {
        setScannerError(null);

        // Discover camera devices
        const devices = await Html5Qrcode.getCameras();
        if (isCancelled) return;

        let activeDeviceId = selectedCameraId;

        if (devices && devices.length > 0) {
          setAvailableCameras(devices.map(d => ({ id: d.id, label: d.label || `Cámara ${d.id.slice(0, 5)}` })));
          
          if (!activeDeviceId) {
            // Prefer environment / back camera
            const backCam = devices.find(d => 
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('trasera') || 
              d.label.toLowerCase().includes('environment') ||
              d.label.toLowerCase().includes('posterior')
            ) || devices[0];
            activeDeviceId = backCam.id;
            setSelectedCameraId(activeDeviceId);
          }
        }

        const scannerId = "dermostock-camera-viewport";
        const viewportElement = document.getElementById(scannerId);
        if (!viewportElement || isCancelled) return;

        // Clean previous instance if any
        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
          } catch {}
        }

        const qrInstance = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = qrInstance;

        const config = {
          fps: 10, // 10 fps is optimal for mobile devices without overheating
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.333,
        };

        const cameraConfig = activeDeviceId 
          ? { deviceId: { exact: activeDeviceId } } 
          : { facingMode: "environment" };

        await qrInstance.start(
          cameraConfig,
          config,
          (decodedText) => {
            handleCodeDetectedRef.current(decodedText);
          },
          () => {} // Frame pass
        );

        if (!isCancelled) {
          setIsScanning(true);
        }
      } catch (err: any) {
        console.warn('Camera scanner initialization error:', err);
        if (!isCancelled) {
          setScannerError(
            err?.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Habilita el acceso en tu navegador o ingresa el código abajo.'
              : 'La cámara no está disponible o está ocupada por otra app. Puedes ingresar el código abajo o usar pistola USB.'
          );
          setIsScanning(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startCameraScanner();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          html5QrCodeRef.current?.clear();
          setIsScanning(false);
        });
      }
    };
  }, [isOpen, selectedCameraId]);

  // Manual submission handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeDetected(manualCode.trim());
      setManualCode('');
    }
  };

  // Add stock confirmation in reception mode
  const handleAddStockConfirm = () => {
    if (!matchedProduct || stockAddQty <= 0) return;
    const ok = addStockMovement(
      matchedProduct.id,
      'entrada',
      stockAddQty,
      `Entrada por escáner de código de barras (${matchedProduct.sku})`,
      'SCAN-IN'
    );
    if (ok) {
      if (soundEnabled) playScanBeep('success');
      setStockAddSuccessMsg(`+${stockAddQty} piezas agregadas a ${matchedProduct.name}`);
      setTimeout(() => setStockAddSuccessMsg(null), 3000);
      const updated = products.find(p => p.id === matchedProduct.id);
      if (updated) {
        setMatchedProduct({ ...updated, stock: updated.stock + stockAddQty });
      }
    }
  };

  // Add to cart confirmation in store mode
  const handleAddToCartConfirm = () => {
    if (!matchedProduct) return;
    addToCart(matchedProduct, 1);
    if (soundEnabled) playScanBeep('success');
    setCartAddSuccessMsg(`¡${matchedProduct.name} agregado al carrito!`);
    setTimeout(() => setCartAddSuccessMsg(null), 2500);
  };

  // Handle Quick Inline Product Creation
  const handleSaveQuickProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notFoundCode || !quickName.trim()) return;

    const code = notFoundCode.trim();
    const cPrice = Number(quickPrice) || 100;
    const wPrice = Number((cPrice * 0.6).toFixed(2));
    const pPrice = Number((cPrice * 0.4).toFixed(2));
    const initialQty = Math.max(0, Number(quickStock) || 0);

    const newProd = {
      sku: `SKU-${code.slice(-6) || Date.now().toString().slice(-4)}`,
      barcode: code,
      name: quickName.trim(),
      presentation: 'Presentación Estándar',
      brand: quickBrand,
      category: quickCategory,
      commercialPrice: cPrice,
      wholesalePrice: wPrice,
      promoPrice: pPrice,
      stock: initialQty,
      minStockAlert: 2,
      packagingType: 'bottle' as const,
      volume: 'Estándar',
      description: 'Producto registrado rápidamente mediante lector de código de barras.',
    };

    addProduct(newProd);

    // Play chime
    if (soundEnabled) playScanBeep('success');

    // Create a local object with ID to show as matched immediately
    const tempMatched: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };

    setMatchedProduct(tempMatched);
    setNotFoundCode(null);
    setShowQuickAddForm(false);
    setStockAddSuccessMsg(`¡"${newProd.name}" dado de alta con éxito en el catálogo!`);
    setTimeout(() => setStockAddSuccessMsg(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Lector de Código de Barras / QR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Cámara & Pistola
                </span>
              </h2>
              <p className="text-xs text-slate-400">Escanea productos para vender, ingresar stock o darlos de alta</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar pitido' : 'Activar sonido pitido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleModalClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('store')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'store'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Venta (Carrito)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Almacén (Sumar Stock)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('lookup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'lookup'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar</span>
            </button>
          </div>

          {/* Quick mode toggles */}
          {mode === 'store' && (
            <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer font-medium select-none shrink-0 bg-white px-2 py-1 rounded-md border border-slate-200">
              <input
                type="checkbox"
                checked={autoAddToCart}
                onChange={(e) => setAutoAddToCart(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Auto-agregar al carrito</span>
            </label>
          )}

          {mode === 'inventory' && (
            <label className="flex items-center gap-1.5 text-[11px] text-emerald-800 cursor-pointer font-medium select-none shrink-0 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              <input
                type="checkbox"
                checked={autoAddStock}
                onChange={(e) => setAutoAddStock(e.target.checked)}
                className="rounded border-emerald-300 text-emerald-600"
              />
              <span>Auto-sumar +1 pieza al escanear</span>
            </label>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Camera Viewport & Overlay */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[190px]">
            {/* html5-qrcode video viewport container */}
            <div 
              id="dermostock-camera-viewport" 
              className="w-full max-h-[250px] overflow-hidden flex items-center justify-center"
            />

            {/* Visual Viewfinder Aim Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative w-64 h-32 border-2 border-emerald-400/80 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[11px] text-white/90 font-medium mt-2 bg-black/60 px-3 py-0.5 rounded-full backdrop-blur-xs">
                  Apunta la cámara al código de barras
                </span>
              </div>
            )}

            {/* Error or Fallback message if camera is unavailable */}
            {scannerError && (
              <div className="p-6 text-center text-slate-300 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-amber-400 stroke-1" />
                <p className="text-xs max-w-sm text-slate-300">{scannerError}</p>
                <p className="text-[11px] text-slate-400">
                  Puedes ingresar el código manual abajo o conectar una pistola USB.
                </p>
              </div>
            )}

            {/* Camera Switcher (if multiple cameras available) */}
            {availableCameras.length > 1 && isScanning && (
              <div className="absolute top-2 right-2 z-10">
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="text-[11px] bg-slate-900/90 text-white border border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Manual Input / Barcode Gun Helper */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ingresar código de barras o SKU manualmente..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Buscar
            </button>
          </form>

          {/* Success Banners */}
          {cartAddSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{cartAddSuccessMsg}</span>
              </div>
              <span className="text-[11px] text-emerald-700">En carrito</span>
            </div>
          )}

          {stockAddSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{stockAddSuccessMsg}</span>
            </div>
          )}

          {/* Scanned Product Card (FOUND) */}
          {matchedProduct && (
            <div className="p-4 bg-slate-50 border-2 border-blue-500/50 rounded-2xl space-y-3 shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {matchedProduct.imageUrl ? (
                    <img 
                      src={matchedProduct.imageUrl} 
                      alt={matchedProduct.name} 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">
                      {matchedProduct.brand.slice(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                      {matchedProduct.brand}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      SKU: {matchedProduct.sku}
                    </span>
                    {matchedProduct.barcode && (
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                        Cód: {matchedProduct.barcode}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                    {matchedProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {matchedProduct.presentation}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stock Actual</span>
                      <strong className={`font-mono text-sm ${matchedProduct.stock <= 2 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {matchedProduct.stock} piezas
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Precio Comercial</span>
                      <strong className="font-mono text-sm text-slate-900">
                        ${matchedProduct.commercialPrice.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-blue-600 block">Mayorista (-40%)</span>
                      <strong className="font-mono text-sm text-blue-700">
                        ${matchedProduct.wholesalePrice.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-600 block">Promo (-60%)</span>
                      <strong className="font-mono text-sm text-emerald-700">
                        ${matchedProduct.promoPrice.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions based on mode */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                {mode === 'store' ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleAddToCartConfirm}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await safeStopCamera();
                        setSelectedProductForQuickView(matchedProduct);
                        onClose();
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ver Detalle Completo
                    </button>
                  </div>
                ) : mode === 'inventory' ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <span className="text-xs font-semibold text-slate-700">Registrar Entrada:</span>
                    <div className="flex items-center gap-1">
                      {[1, 5, 10].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setStockAddQty(qty)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                            stockAddQty === qty
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          +{qty}
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={stockAddQty}
                      onChange={(e) => setStockAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-mono font-bold"
                    />

                    <button
                      type="button"
                      onClick={handleAddStockConfirm}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Confirmar Entrada</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await safeStopCamera();
                        setSelectedProductForQuickView(matchedProduct);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Ver Ficha de Producto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Not Found State + Direct Inline Add Option */}
          {notFoundCode && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 space-y-3 animate-fade-in shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-amber-950">
                    Producto nuevo (no registrado)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Código escaneado: <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">{notFoundCode}</strong>
                  </p>
                </div>
              </div>

              {!showQuickAddForm ? (
                <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-800">
                    ¿Deseas agregar este artículo a la tienda ahora?
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddForm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Registro Rápido Aquí</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoToFullAddModal(notFoundCode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <FileEdit className="w-4 h-4" />
                      <span>Ficha Completa con Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* INLINE QUICK ADD FORM: Register without closing camera */
                <form onSubmit={handleSaveQuickProduct} className="p-3 bg-white rounded-xl border border-amber-300 space-y-3 mt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Alta Rápida de Producto (Código: {notFoundCode})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Eucerin Sun Gel-Cream Oil Control 50ml"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Marca
                      </label>
                      <select
                        value={quickBrand}
                        onChange={(e) => setQuickBrand(e.target.value as Brand)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Nivea">Nivea</option>
                        <option value="Eucerin">Eucerin</option>
                        <option value="Aquaphor">Aquaphor</option>
                        <option value="Aquaphor Baby">Aquaphor Baby</option>
                        <option value="Nivea Men">Nivea Men</option>
                        <option value="Aquaphor / Eucerin">Aquaphor / Eucerin</option>
                        <option value="Otro">Otra Marca</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={quickCategory}
                        onChange={(e) => setQuickCategory(e.target.value as Category)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Protección Solar">Protección Solar</option>
                        <option value="Cuidado Corporal">Cuidado Corporal</option>
                        <option value="Reparación Dermatológica">Reparación Dermatológica</option>
                        <option value="Cuidado Facial & Labial">Cuidado Facial & Labial</option>
                        <option value="Cuidado Infantil">Cuidado Infantil</option>
                        <option value="Cuidado Masculino">Cuidado Masculino</option>
                        <option value="Gel de Ducha">Gel de Ducha</option>
                        <option value="Otro">Otra</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Precio Comercial (MXN) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          required
                          value={quickPrice}
                          onChange={(e) => setQuickPrice(parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Mayoreo: ${(quickPrice * 0.6).toFixed(0)} · Promo: ${(quickPrice * 0.4).toFixed(0)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Piezas en Inventario *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={quickStock}
                        onChange={(e) => setQuickStock(parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Stock inicial
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleGoToFullAddModal(notFoundCode)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-medium"
                    >
                      Ir a formulario con foto
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar y Dar de Alta</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Recent Scans History in Session */}
          {scanHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Escaneos recientes en esta sesión:
              </span>
              <div className="max-h-20 overflow-y-auto divide-y divide-slate-100 text-xs">
                {scanHistory.slice(0, 4).map((h, idx) => (
                  <div key={idx} className="py-1 flex items-center justify-between text-slate-600">
                    <span className="font-mono text-[11px] text-slate-800 font-medium">
                      {h.code}
                    </span>
                    <span className="text-[11px] truncate max-w-[200px] text-slate-500">
                      {h.product ? h.product.name : 'No registrado'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {h.timestamp.toLocaleTimeString('es-MX', { minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>Pistola USB / Bluetooth activa en segundo plano</span>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar Escáner
          </button>
        </div>

      </div>
    </div>
  );
};
