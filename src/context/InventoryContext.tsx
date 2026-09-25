import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  PriceTier, 
  InventoryMovement, 
  Order, 
  MovementType,
  StoreSettings 
} from '../types/inventory';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_ORDERS } from '../data/initialOrders';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsappNumber: '525512345678',
  businessName: 'DermoStock México',
  defaultPickupPoint: 'Punto de entrega a acordar',
};

interface InventoryContextType {
  products: Product[];
  priceTier: PriceTier;
  setPriceTier: (tier: PriceTier) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartSavings: number;
  cartTotal: number;
  orders: Order[];
  createOrder: (orderInput: Omit<Order, 'id' | 'date' | 'status'>) => Order;
  movements: InventoryMovement[];
  addStockMovement: (
    productId: string, 
    type: MovementType, 
    quantity: number, 
    reason: string, 
    reference?: string
  ) => boolean;
  quickAdjustStock: (productId: string, delta: number) => boolean;
  updateProduct: (updated: Product) => void;
  addProduct: (newProd: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  resetToInitial: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeTab: 'tienda' | 'inventario' | 'pedidos' | 'movimientos' | 'reportes';
  setActiveTab: (tab: 'tienda' | 'inventario' | 'pedidos' | 'movimientos' | 'reportes') => void;
  selectedProductForQuickView: Product | null;
  setSelectedProductForQuickView: (product: Product | null) => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  isProductModalOpen: boolean;
  productToEdit: Product | null;
  openProductModal: (product?: Product | null) => void;
  closeProductModal: () => void;
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: Date | null;
  refreshFromServer: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  saveToServer: () => Promise<boolean>;
  importFullBackup: (data: any) => boolean;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'dermostock_products_v2',
  MOVEMENTS: 'dermostock_movements_v1',
  ORDERS: 'dermostock_orders_v1',
  TIER: 'dermostock_tier_v1',
  SETTINGS: 'dermostock_settings_v1',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading products from storage', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Price tier: 'comercial' | 'mayorista' | 'promocion'
  const [priceTier, setPriceTier] = useState<PriceTier>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TIER);
      if (stored === 'comercial' || stored === 'mayorista' || stored === 'promocion') {
        return stored;
      }
    } catch {}
    return 'comercial';
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  // Movements (Kardex log)
  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Initial movement log entry for inventory bootstrap
    return [
      {
        id: 'mov-init',
        timestamp: new Date().toISOString(),
        productId: 'ALL',
        productName: 'Inventario Inicial Cargado',
        type: 'entrada',
        quantity: 58,
        previousStock: 0,
        newStock: 58,
        reason: 'Carga inicial desde archivo de catálogo',
        reference: 'IMPORT-001',
      },
    ];
  });

  // Navigation and Modals
  const [activeTab, setActiveTab] = useState<'tienda' | 'inventario' | 'pedidos' | 'movimientos' | 'reportes'>('tienda');
  const [selectedProductForQuickView, setSelectedProductForQuickView] = useState<Product | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Global Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const openProductModal = (prod?: Product | null) => {
    setProductToEdit(prod || null);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  // Store Settings (WhatsApp number, business name, default pickup point)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.whatsappNumber === 'string') return parsed;
      }
    } catch {}
    return DEFAULT_STORE_SETTINGS;
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      settingsRef.current = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}
      syncToServer(products, movements, orders, priceTier, updated);
      return updated;
    });
  };

  // Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const isInitialLoadDoneRef = React.useRef(false);
  const lastServerTimestampRef = React.useRef<string>('');
  const isSavingRef = React.useRef(false);

  // Sync state to backend server so PC and Mobile share the same data and images
  const syncToServer = async (
    currentProducts: Product[],
    currentMovements: InventoryMovement[],
    currentOrders: Order[],
    currentTier: PriceTier,
    currentSettings?: StoreSettings
  ) => {
    try {
      setSyncStatus('syncing');
      isSavingRef.current = true;
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: currentProducts,
          movements: currentMovements,
          orders: currentOrders,
          priceTier: currentTier,
          settings: currentSettings || settingsRef.current,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.lastUpdated) {
          lastServerTimestampRef.current = result.lastUpdated;
        }
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.warn('Network sync failed (working offline):', e);
      setSyncStatus('offline');
    } finally {
      isSavingRef.current = false;
    }
  };

  // Fetch state from server
  const fetchFromServer = async (force = false) => {
    try {
      if (isSavingRef.current) return;
      const res = await fetch('/api/data');
      if (!res.ok) {
        setSyncStatus('offline');
        return;
      }
      const data = await res.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        // If server data is newer or force
        if (force || !isInitialLoadDoneRef.current || (data.lastUpdated && data.lastUpdated !== lastServerTimestampRef.current)) {
          lastServerTimestampRef.current = data.lastUpdated || new Date().toISOString();
          setProducts(data.products);
          if (Array.isArray(data.movements)) setMovements(data.movements);
          if (Array.isArray(data.orders)) setOrders(data.orders);
          if (data.priceTier) setPriceTier(data.priceTier);
          if (data.settings && data.settings.whatsappNumber) {
            setSettings(data.settings);
            settingsRef.current = data.settings;
            try {
              localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            } catch {}
          }
          setLastSyncTime(new Date());
          setSyncStatus('synced');

          // Update local cache
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
            if (data.priceTier) localStorage.setItem(STORAGE_KEYS.TIER, data.priceTier);
            if (data.orders) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
            if (data.movements) localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(data.movements));
          } catch {}
        }
      } else if (!isInitialLoadDoneRef.current) {
        // Server was empty, seed server with current client state
        await syncToServer(products, movements, orders, priceTier, settingsRef.current);
      }
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Error fetching from server:', err);
      setSyncStatus('offline');
    } finally {
      isInitialLoadDoneRef.current = true;
    }
  };

  const refreshFromServer = async () => {
    setSyncStatus('syncing');
    await fetchFromServer(true);
  };

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const syncWithServer = async () => {
    await refreshFromServer();
  };

  const saveToServer = async (): Promise<boolean> => {
    try {
      await syncToServer(products, movements, orders, priceTier, settings);
      return true;
    } catch {
      return false;
    }
  };

  const importFullBackup = (data: any): boolean => {
    try {
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        if (Array.isArray(data.movements)) setMovements(data.movements);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (data.priceTier) setPriceTier(data.priceTier);
        syncToServer(
          data.products, 
          Array.isArray(data.movements) ? data.movements : movements, 
          Array.isArray(data.orders) ? data.orders : orders, 
          data.priceTier || priceTier
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Initial load from server on mount
  useEffect(() => {
    fetchFromServer(true);

    // Auto-poll every 30 seconds to sync changes from PC to Phone and vice versa without quota burn
    const interval = setInterval(() => {
      fetchFromServer(false);
    }, 30000);

    // Also sync immediately when window/tab is focused
    const handleFocus = () => {
      fetchFromServer(false);
    };
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchFromServer(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Sync changes to server and localStorage whenever state updates
  useEffect(() => {
    if (!isInitialLoadDoneRef.current) return;

    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.TIER, priceTier);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (err) {
      console.warn('LocalStorage quota limit reached:', err);
    }

    const timer = setTimeout(() => {
      syncToServer(products, movements, orders, priceTier);
    }, 400);

    return () => clearTimeout(timer);
  }, [products, priceTier, orders, movements]);

  // Price helper based on current active tier
  const getProductPriceForTier = (product: Product, tier: PriceTier): number => {
    switch (tier) {
      case 'mayorista':
        return product.wholesalePrice;
      case 'promocion':
        return product.promoPrice;
      case 'comercial':
      default:
        return product.commercialPrice;
    }
  };

  // Add to cart
  const addToCart = (product: Product, quantity = 1): boolean => {
    const currentProd = products.find((p) => p.id === product.id);
    if (!currentProd || currentProd.stock <= 0) return false;

    const existingCartItem = cart.find((item) => item.product.id === product.id);
    const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;

    if (currentCartQty + quantity > currentProd.stock) {
      return false; // Exceeds current warehouse stock
    }

    const unitPrice = getProductPriceForTier(currentProd, priceTier);

    if (existingCartItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                appliedTier: priceTier,
                unitPrice,
              }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          product: currentProd,
          quantity,
          appliedTier: priceTier,
          unitPrice,
        },
      ]);
    }
    return true;
  };

  // Update Cart Quantity
  const updateCartQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    const currentProd = products.find((p) => p.id === productId);
    if (!currentProd) return false;

    if (quantity > currentProd.stock) {
      return false; // Cannot exceed stock
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              unitPrice: getProductPriceForTier(currentProd, priceTier),
              appliedTier: priceTier,
            }
          : item
      )
    );
    return true;
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Dynamic calculations based on cart and tier
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Recalculate cart prices when tier changes
  useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        const prod = products.find((p) => p.id === item.product.id);
        if (!prod) return item;
        return {
          ...item,
          appliedTier: priceTier,
          unitPrice: getProductPriceForTier(prod, priceTier),
        };
      })
    );
  }, [priceTier]);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.commercialPrice * item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const cartSavings = Math.max(0, cartSubtotal - cartTotal);

  // Create Order and deduct inventory
  const createOrder = (orderInput: Omit<Order, 'id' | 'date' | 'status'>): Order => {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      ...orderInput,
      id: orderId,
      date: new Date().toISOString(),
      status: 'completado',
    };

    // Deduct stock and log movements
    const updatedProducts = [...products];
    const newMovements: InventoryMovement[] = [];

    newOrder.items.forEach((item) => {
      const idx = updatedProducts.findIndex((p) => p.id === item.product.id);
      if (idx !== -1) {
        const prev = updatedProducts[idx].stock;
        const deduction = Math.min(prev, item.quantity);
        const next = Math.max(0, prev - deduction);
        updatedProducts[idx] = {
          ...updatedProducts[idx],
          stock: next,
        };

        newMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          productId: item.product.id,
          productName: item.product.name,
          type: 'venta',
          quantity: -deduction,
          previousStock: prev,
          newStock: next,
          reason: `Venta en tienda #${orderId} (${newOrder.customerName})`,
          reference: orderId,
        });
      }
    });

    setProducts(updatedProducts);
    setMovements((prev) => [...newMovements, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setLastCompletedOrder(newOrder);
    return newOrder;
  };

  // Stock Movement (Entrada / Salida / Ajuste)
  const addStockMovement = (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    reference?: string
  ): boolean => {
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) return false;

    const currentProd = products[productIndex];
    const prevStock = currentProd.stock;
    let nextStock = prevStock;

    if (type === 'entrada') {
      nextStock = prevStock + Math.abs(quantity);
    } else if (type === 'salida' || type === 'venta') {
      nextStock = Math.max(0, prevStock - Math.abs(quantity));
    } else if (type === 'ajuste') {
      nextStock = Math.max(0, quantity); // direct set
    }

    const movementQty = type === 'ajuste' ? nextStock - prevStock : type === 'entrada' ? Math.abs(quantity) : -Math.abs(quantity);

    const updatedProd: Product = {
      ...currentProd,
      stock: nextStock,
    };

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      productId,
      productName: currentProd.name,
      type,
      quantity: movementQty,
      previousStock: prevStock,
      newStock: nextStock,
      reason,
      reference: reference || 'ERP-MANUAL',
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProd : p))
    );
    setMovements((prev) => [newMovement, ...prev]);
    return true;
  };

  // Quick adjust inline (+1 or -1)
  const quickAdjustStock = (productId: string, delta: number): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    const newStock = Math.max(0, prod.stock + delta);
    if (newStock === prod.stock) return false;

    const type: MovementType = delta > 0 ? 'entrada' : 'salida';
    return addStockMovement(
      productId,
      type,
      Math.abs(delta),
      delta > 0 ? 'Ajuste rápido (+)' : 'Ajuste rápido (-)',
      'ERP-QUICK'
    );
  };

  // Update existing product
  const updateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // Add new product
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now().toString().slice(-6)}`;
    const productWithId: Product = { ...newProd, id };

    setProducts((prev) => [productWithId, ...prev]);

    // Log movement
    if (productWithId.stock > 0) {
      setMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          timestamp: new Date().toISOString(),
          productId: id,
          productName: productWithId.name,
          type: 'entrada',
          quantity: productWithId.stock,
          previousStock: 0,
          newStock: productWithId.stock,
          reason: 'Alta de nuevo producto en catálogo',
          reference: productWithId.sku,
        },
        ...prev,
      ]);
    }
  };

  // Delete product
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  // Reset to original document data
  const resetToInitial = () => {
    setProducts(INITIAL_PRODUCTS);
    setPriceTier('comercial');
    setCart([]);
    setMovements([
      {
        id: `mov-reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        productId: 'ALL',
        productName: 'Reinicio a Datos Originales del Archivo',
        type: 'ajuste',
        quantity: 58,
        previousStock: products.reduce((s, p) => s + p.stock, 0),
        newStock: 58,
        reason: 'Restablecimiento de inventario a 18 SKUs originales',
        reference: 'RESET-FILE',
      },
    ]);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        priceTier,
        setPriceTier,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartSavings,
        cartTotal,
        orders,
        createOrder,
        movements,
        addStockMovement,
        quickAdjustStock,
        updateProduct,
        addProduct,
        deleteProduct,
        resetToInitial,
        isCartOpen,
        setIsCartOpen,
        activeTab,
        setActiveTab,
        selectedProductForQuickView,
        setSelectedProductForQuickView,
        lastCompletedOrder,
        setLastCompletedOrder,
        isProductModalOpen,
        productToEdit,
        openProductModal,
        closeProductModal,
        settings,
        updateSettings,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        syncStatus,
        lastSyncTime,
        refreshFromServer,
        syncWithServer,
        saveToServer,
        importFullBackup,
        isSyncModalOpen,
        setIsSyncModalOpen,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
