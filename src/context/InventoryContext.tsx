import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  CartItem, 
  PriceTier, 
  InventoryMovement, 
  Order, 
  MovementType,
  StoreSettings,
  Merchant,
  TrackingStatus,
  TrackingEvent,
  CreateOrderInput,
  UserRole,
  MerchantSettlement,
  Driver
} from '../types/inventory';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_ORDERS } from '../data/initialOrders';
import { SILAO_MERCHANTS, SILAO_DRIVERS } from '../data/silaoMarketData';
import { calculateDynamicDeliveryFee } from '../utils/deliveryFee';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsappNumber: '524721234567',
  businessName: 'Silaomarket on line',
  defaultPickupPoint: 'Hub Central Silao - Calle 5 de Mayo #45, Silao Centro',
  city: 'Silao',
  state: 'Guanajuato',
  hubAddress: 'Hub Central de Consolidación Silao, Calle 5 de Mayo #45, Silao Centro',
  deliveryCost: 25,
  orderStartTime: '08:00',
  orderEndTime: '20:00',
  maxOrdersPerHour: 12,
};

interface InventoryContextType {
  products: Product[];
  merchants: Merchant[];
  selectedMerchantId: string;
  setSelectedMerchantId: (id: string) => void;
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
  createOrder: (orderInput: CreateOrderInput) => Order;
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
  activeTab: 'tienda' | 'inventario' | 'pedidos' | 'movimientos' | 'reportes' | 'mi_negocio' | 'finanzas' | 'negocios' | 'hub_pedidos';
  setActiveTab: (tab: 'tienda' | 'inventario' | 'pedidos' | 'movimientos' | 'reportes' | 'mi_negocio' | 'finanzas' | 'negocios' | 'hub_pedidos') => void;
  selectedProductForQuickView: Product | null;
  setSelectedProductForQuickView: (product: Product | null) => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  activeTrackingOrder: Order | null;
  openTrackingModal: (order: Order) => void;
  closeTrackingModal: () => void;
  updateOrderTrackingStatus: (orderId: string, status: TrackingStatus) => void;
  isProductModalOpen: boolean;
  productToEdit: Product | Partial<Product> | null;
  openProductModal: (product?: Product | Partial<Product> | null) => void;
  closeProductModal: () => void;
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  scannerMode: 'store' | 'inventory' | 'lookup';
  setScannerMode: (mode: 'store' | 'inventory' | 'lookup') => void;
  openScanner: (mode?: 'store' | 'inventory' | 'lookup') => void;
  closeScanner: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: Date | null;
  refreshFromServer: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  saveToServer: () => Promise<boolean>;
  importFullBackup: (data: any) => boolean;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;

  // Role & Access Control
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  loggedMerchantId: string | null;
  loggedMerchant: Merchant | null;
  hasAccessSelected: boolean;
  setHasAccessSelected: (selected: boolean) => void;
  loginRole: (role: UserRole, merchantId?: string, pin?: string) => { success: boolean; message?: string };
  logoutRole: () => void;
  adminPin: string;
  setAdminPin: (pin: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Merchant Management
  addMerchant: (merchantData: Omit<Merchant, 'id'>) => string;
  updateMerchant: (id: string, updated: Partial<Merchant>) => void;
  deleteMerchant: (id: string) => void;
  isMerchantManagerOpen: boolean;
  setIsMerchantManagerOpen: (open: boolean) => void;

  // Financials & Settlements
  settlements: MerchantSettlement[];
  recordSettlement: (
    merchantId: string, 
    period: string, 
    grossSales: number, 
    commissionRate: number, 
    commissionAmount: number, 
    netAmount: number, 
    orderIds: string[], 
    notes?: string
  ) => void;
  // Brochure Modal
  isBrochureModalOpen: boolean;
  setIsBrochureModalOpen: (open: boolean) => void;

  // Hub Dispatch & Drivers
  drivers: Driver[];
  assignDriverToOrder: (orderId: string, driverId: string) => boolean;
  updateOrderStatus: (orderId: string, newStatus: TrackingStatus, notes?: string) => void;
  resetOrdersToInitial: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'silaomarket_products_v4',
  MOVEMENTS: 'silaomarket_movements_v4',
  ORDERS: 'silaomarket_orders_v4',
  TIER: 'silaomarket_tier_v4',
  SETTINGS: 'silaomarket_settings_v4',
  MERCHANTS: 'silaomarket_merchants_v4',
  SETTLEMENTS: 'silaomarket_settlements_v4',
  ROLE: 'silaomarket_role_v4',
  LOGGED_MERCHANT: 'silaomarket_logged_merchant_v4',
  ADMIN_PIN: 'silaomarket_admin_pin_v4',
  ACCESS_SELECTED: 'silaomarket_access_selected_v1',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Access Gate state (requires selecting role upfront before accessing main views)
  const [hasAccessSelected, setHasAccessSelectedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_SELECTED) === 'true';
    } catch {}
    return false;
  });

  const setHasAccessSelected = (selected: boolean) => {
    setHasAccessSelectedState(selected);
    try {
      if (selected) localStorage.setItem(STORAGE_KEYS.ACCESS_SELECTED, 'true');
      else localStorage.removeItem(STORAGE_KEYS.ACCESS_SELECTED);
    } catch {}
  };
  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRODUCTS.length) return parsed;
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map(p => p.id));
          const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          } catch {}
          return merged;
        }
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

  // Access Control & Roles: 'cliente' | 'negocio' | 'admin'
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (stored === 'cliente' || stored === 'negocio' || stored === 'admin') return stored;
    } catch {}
    return 'cliente';
  });

  const [loggedMerchantId, setLoggedMerchantIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LOGGED_MERCHANT) || null;
    } catch {}
    return null;
  });

  const [adminPin, setAdminPinState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
    } catch {}
    return '1234';
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch {}
  };

  const setLoggedMerchantId = (id: string | null) => {
    setLoggedMerchantIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEYS.LOGGED_MERCHANT, id);
      else localStorage.removeItem(STORAGE_KEYS.LOGGED_MERCHANT);
    } catch {}
  };

  const setAdminPin = (pin: string) => {
    setAdminPinState(pin);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
    } catch {}
  };

  // Modals for Auth, Brochure, and Merchant Management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [isMerchantManagerOpen, setIsMerchantManagerOpen] = useState(false);

  // Local Silao Merchants state (reactive with local & server persistence)
  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
      if (stored) {
        const parsed: Merchant[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= SILAO_MERCHANTS.length) return parsed;
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map(m => m.id));
          const missing = SILAO_MERCHANTS.filter(m => !existingIds.has(m.id));
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
    } catch {}
    return SILAO_MERCHANTS;
  });
  const merchantsRef = React.useRef(merchants);
  merchantsRef.current = merchants;

  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('all');

  // Settlements state (7-day payments to merchants)
  const [settlements, setSettlements] = useState<MerchantSettlement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const settlementsRef = React.useRef(settlements);
  settlementsRef.current = settlements;

  const loggedMerchant = useMemo(() => {
    if (!loggedMerchantId) return null;
    return merchants.find(m => m.id === loggedMerchantId) || null;
  }, [loggedMerchantId, merchants]);

  // Auth / Role switcher handlers
  const loginRole = (role: UserRole, merchantId?: string, pin?: string): { success: boolean; message?: string } => {
    if (role === 'cliente') {
      setUserRole('cliente');
      setLoggedMerchantId(null);
      setHasAccessSelected(true);
      setActiveTab('tienda');
      return { success: true };
    }

    if (role === 'admin') {
      if (pin && pin.trim() === adminPin.trim()) {
        setUserRole('admin');
        setLoggedMerchantId(null);
        setHasAccessSelected(true);
        setActiveTab('inventario');
        return { success: true };
      }
      return { success: false, message: 'PIN de Administrador incorrecto (Por defecto: 1234)' };
    }

    if (role === 'negocio') {
      if (!merchantId) {
        return { success: false, message: 'Selecciona tu negocio para continuar.' };
      }
      const target = merchants.find(m => m.id === merchantId);
      if (!target) {
        return { success: false, message: 'Comercio no encontrado en el sistema.' };
      }
      const targetPin = target.pin || '1234';
      if (pin && pin.trim() === targetPin.trim()) {
        setUserRole('negocio');
        setLoggedMerchantId(merchantId);
        setHasAccessSelected(true);
        setActiveTab('mi_negocio');
        return { success: true };
      }
      return { success: false, message: `PIN incorrecto para ${target.name}. (Por defecto: 1234)` };
    }

    return { success: false, message: 'Rol no reconocido.' };
  };

  const logoutRole = () => {
    setUserRole('cliente');
    setLoggedMerchantId(null);
    setHasAccessSelected(false);
    setActiveTab('tienda');
  };

  // CRUD for Merchants
  const addMerchant = (merchantData: Omit<Merchant, 'id'>): string => {
    const newId = `merch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newMerchant: Merchant = {
      ...merchantData,
      id: newId,
      rating: merchantData.rating || 5.0,
      reviewsCount: merchantData.reviewsCount || 1,
      badge: merchantData.badge || 'Nuevo Comercio Silao',
      iconName: merchantData.iconName || 'Store',
      commissionRate: merchantData.commissionRate || 10,
      type: merchantData.type || 'Producto',
      pin: merchantData.pin || '1234'
    };

    const updatedList = [...merchants, newMerchant];
    setMerchants(updatedList);
    merchantsRef.current = updatedList;
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    } catch {}
    syncToServer(products, movements, orders, priceTier, settingsRef.current, updatedList, settlements);
    return newId;
  };

  const updateMerchant = (id: string, updated: Partial<Merchant>) => {
    const updatedList = merchants.map(m => m.id === id ? { ...m, ...updated } : m);
    setMerchants(updatedList);
    merchantsRef.current = updatedList;
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    } catch {}
    syncToServer(products, movements, orders, priceTier, settingsRef.current, updatedList, settlements);
  };

  const deleteMerchant = (id: string) => {
    const updatedList = merchants.filter(m => m.id !== id);
    setMerchants(updatedList);
    merchantsRef.current = updatedList;
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    } catch {}
    syncToServer(products, movements, orders, priceTier, settingsRef.current, updatedList, settlements);
  };

  // Financial settlements management
  const recordSettlement = (
    merchantId: string, 
    period: string, 
    grossSales: number, 
    commissionRate: number, 
    commissionAmount: number, 
    netAmount: number, 
    orderIds: string[], 
    notes?: string
  ) => {
    const target = merchants.find(m => m.id === merchantId);
    const newSettlement: MerchantSettlement = {
      id: `liq-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      merchantId,
      merchantName: target?.name || 'Comercio Silao',
      period,
      orderIds,
      grossSales,
      commissionRate,
      commissionAmount,
      netAmount,
      status: 'pagado',
      settledDate: new Date().toISOString(),
      paymentReference: `TRANSF-SILAO-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes || 'Liquidación semanal de ventas consolidada'
    };

    const updated = [newSettlement, ...settlements];
    setSettlements(updated);
    settlementsRef.current = updated;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
    } catch {}
    syncToServer(products, movements, orders, priceTier, settingsRef.current, merchants, updated);
  };

  const markSettlementPaid = (settlementId: string, reference?: string) => {
    const updated = settlements.map(s => {
      if (s.id !== settlementId) return s;
      return {
        ...s,
        status: 'pagado' as const,
        settledDate: new Date().toISOString(),
        paymentReference: reference || `TRANSF-SILAO-${Math.floor(100000 + Math.random() * 900000)}`
      };
    });
    setSettlements(updated);
    settlementsRef.current = updated;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
    } catch {}
    syncToServer(products, movements, orders, priceTier, settingsRef.current, merchants, updated);
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders (20 pedidos para evaluación operativa)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_ORDERS.length) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  const resetOrdersToInitial = () => {
    setOrders(INITIAL_ORDERS);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    } catch {}
    syncToServer(products, movements, INITIAL_ORDERS, priceTier, settingsRef.current, merchants, settlements);
  };

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

  const [activeTab, setActiveTab] = useState<'tienda' | 'inventario' | 'pedidos' | 'movimientos' | 'reportes' | 'mi_negocio' | 'finanzas' | 'negocios' | 'hub_pedidos'>('tienda');
  const [selectedProductForQuickView, setSelectedProductForQuickView] = useState<Product | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Drivers del Hub Silao
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const stored = localStorage.getItem('silaomarket_drivers_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SILAO_DRIVERS;
  });

  const openTrackingModal = (order: Order) => {
    setActiveTrackingOrder(order);
  };

  const closeTrackingModal = () => {
    setActiveTrackingOrder(null);
  };

  const updateOrderTrackingStatus = (orderId: string, status: TrackingStatus) => {
    updateOrderStatus(orderId, status);
  };

  const updateOrderStatus = (orderId: string, status: TrackingStatus, notes?: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        // Actualizar timeline
        const currentTimeline = o.timeline || [];
        const statusTitles: Record<TrackingStatus, { title: string; desc: string }> = {
          recibido: { title: 'Pedido Recibido en Hub Silao', desc: 'Registrado en Hub Central 5 de Mayo #45' },
          en_recoleccion: { title: 'Recolectando en Comercios', desc: `Driver recolectando en ${o.merchantsCount || 1} comercio(s)` },
          consolidado: { title: 'Empaquetado y Consolidado', desc: o.hasColdChain ? 'Empacado con hielera térmica de frío ❄️' : 'Paquetes consolidados' },
          en_camino: { title: 'En Camino a Domicilio', desc: `Driver en ruta a ${o.deliveryColonia || 'Silao'}` },
          entregado: { title: 'Entregado al Cliente', desc: notes || 'Entrega confirmada y concluida' },
        };

        const updatedTimeline = currentTimeline.map((item) => {
          if (item.status === status) {
            return { ...item, completed: true, timestamp: timeStr };
          }
          return item;
        });

        const newOrderObj: Order = {
          ...o,
          trackingStatus: status,
          status: status === 'entregado' ? 'entregado' : 'completado',
          deliveredAt: status === 'entregado' ? now.toISOString() : o.deliveredAt,
          timeline: updatedTimeline,
        };

        if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
          setActiveTrackingOrder(newOrderObj);
        }
        return newOrderObj;
      });

      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      } catch {}
      syncToServer(products, movements, updated, priceTier, settingsRef.current, merchants, settlements);
      return updated;
    });
  };

  const assignDriverToOrder = (orderId: string, driverId: string): boolean => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return false;

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = new Date();
        const nextStatus: TrackingStatus = o.trackingStatus === 'recibido' ? 'en_recoleccion' : o.trackingStatus;

        const updatedOrder: Order = {
          ...o,
          driverId: driver.id,
          courierName: `${driver.name} (${driver.vehicle})`,
          courierPhone: driver.phone,
          courierVehicle: driver.vehicle,
          assignedAt: now.toISOString(),
          trackingStatus: nextStatus,
        };

        if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
          setActiveTrackingOrder(updatedOrder);
        }
        return updatedOrder;
      });

      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      } catch {}
      syncToServer(products, movements, updated, priceTier, settingsRef.current, merchants, settlements);
      return updated;
    });

    return true;
  };

  // Global Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | Partial<Product> | null>(null);

  const openProductModal = (prod?: Product | Partial<Product> | null) => {
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

  // Barcode / QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'store' | 'inventory' | 'lookup'>('store');

  const openScanner = (mode: 'store' | 'inventory' | 'lookup' = 'store') => {
    setScannerMode(mode);
    setIsScannerOpen(true);
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
  };

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
    currentSettings?: StoreSettings,
    currentMerchants?: Merchant[],
    currentSettlements?: MerchantSettlement[]
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
          merchants: currentMerchants || merchantsRef.current,
          settlements: currentSettlements || settlementsRef.current,
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
      if (data && Array.isArray(data.products) && data.products.length >= INITIAL_PRODUCTS.length) {
        if (force || !isInitialLoadDoneRef.current || (data.lastUpdated && data.lastUpdated !== lastServerTimestampRef.current)) {
          lastServerTimestampRef.current = data.lastUpdated || new Date().toISOString();
          setProducts(data.products);
          if (Array.isArray(data.movements)) setMovements(data.movements);
          if (Array.isArray(data.orders)) {
            setOrders(data.orders.length >= INITIAL_ORDERS.length ? data.orders : INITIAL_ORDERS);
          }
          if (data.priceTier) setPriceTier(data.priceTier);
          if (data.settings && data.settings.whatsappNumber) {
            setSettings(data.settings);
            settingsRef.current = data.settings;
            try {
              localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            } catch {}
          }
          if (Array.isArray(data.merchants) && data.merchants.length > 0) {
            setMerchants(data.merchants);
            merchantsRef.current = data.merchants;
            try {
              localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(data.merchants));
            } catch {}
          }
          if (Array.isArray(data.settlements)) {
            setSettlements(data.settlements);
            settlementsRef.current = data.settlements;
            try {
              localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(data.settlements));
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
      } else if (!isInitialLoadDoneRef.current || (data && Array.isArray(data.products) && data.products.length < INITIAL_PRODUCTS.length)) {
        // Server was empty or has outdated smaller catalog, seed server with current master 500-product state
        await syncToServer(INITIAL_PRODUCTS, movements, orders, priceTier, settingsRef.current, merchantsRef.current, settlementsRef.current);
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
  const createOrder = (orderInput: CreateOrderInput): Order => {
    const orderId = `ORD-SILAO-${Date.now().toString().slice(-5)}`;
    const trackingCode = `SLO-TRK-${Math.floor(10000 + Math.random() * 90000)}`;
    const merchantsSet = new Set(orderInput.items.map((i) => i.product.merchantName || 'Comercio Local'));
    const hasCold = orderInput.items.some((i) => i.product.isColdChain);

    const now = new Date();
    const timeline: TrackingEvent[] = [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Orden registrada en Hub Central (Calle 5 de Mayo #45, Silao Centro)',
        timestamp: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando con Comercios',
        description: `Recolección programada en ${merchantsSet.size} comercio(s) de Silao`,
        timestamp: 'En proceso',
        completed: false,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidación',
        description: hasCold ? 'Empaquetado en Hub Silao con hielera térmica de frío ❄️' : 'Empaquetado y sellado en Hub Silao',
        timestamp: 'Pendiente',
        completed: false,
      },
      {
        status: 'en_camino',
        title: 'En Traslado a Domicilio',
        description: `Repartidor en ruta hacia ${orderInput.deliveryColonia || 'Silao Centro'}`,
        timestamp: 'Pendiente',
        completed: false,
      },
      {
        status: 'entregado',
        title: 'Entregado al Cliente',
        description: 'Confirmación y firma de recepción en domicilio',
        timestamp: 'Pendiente',
        completed: false,
      }
    ];

    const qrData = JSON.stringify({
      app: 'Silaomarket on line',
      orderId,
      trackingCode,
      customer: orderInput.customerName,
      colonia: orderInput.deliveryColonia || 'Silao Centro',
      total: orderInput.total,
      coldChain: hasCold,
      merchants: Array.from(merchantsSet),
      hub: 'Hub Central Silao - 5 de Mayo #45'
    });

    const totalItemsCount = orderInput.items.reduce((s, i) => s + i.quantity, 0);
    const dynamicDeliveryFee = orderInput.deliveryType === 'domicilio'
      ? (orderInput.deliveryFee ?? calculateDynamicDeliveryFee(totalItemsCount, merchantsSet.size).fee)
      : 0;

    const newOrder: Order = {
      ...orderInput,
      id: orderId,
      date: new Date().toISOString(),
      trackingCode,
      trackingStatus: 'recibido',
      timeline,
      courierName: 'Repartidor Hub Silao (Unidad Moto 03)',
      courierPhone: '472-722-1234',
      courierVehicle: 'Motocicleta con caja térmica',
      hasColdChain: hasCold,
      merchantsCount: merchantsSet.size,
      merchantsNames: Array.from(merchantsSet),
      deliveryFee: dynamicDeliveryFee,
      status: 'pendiente',
      qrData,
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
    setActiveTrackingOrder(newOrder);
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

  // Reset to initial Silao catalog (500 products across 10 giros)
  const resetToInitial = () => {
    setProducts(INITIAL_PRODUCTS);
    setPriceTier('comercial');
    setCart([]);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.TIER, 'comercial');
    } catch {}
    const initialPieces = INITIAL_PRODUCTS.reduce((s, p) => s + p.stock, 0);
    const newMovements: InventoryMovement[] = [
      {
        id: `mov-reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        productId: 'ALL',
        productName: 'Reinicio a Catálogo Completo Silao (500 Productos)',
        type: 'ajuste',
        quantity: initialPieces,
        previousStock: products.reduce((s, p) => s + p.stock, 0),
        newStock: initialPieces,
        reason: 'Restablecimiento de inventario a 500 productos y 10 giros de Silao',
        reference: 'RESET-500-SILAO',
      },
    ];
    setMovements(newMovements);
    syncToServer(INITIAL_PRODUCTS, newMovements, orders, 'comercial', settingsRef.current);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        merchants,
        selectedMerchantId,
        setSelectedMerchantId,
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
        activeTrackingOrder,
        openTrackingModal,
        closeTrackingModal,
        updateOrderTrackingStatus,
        isProductModalOpen,
        productToEdit,
        openProductModal,
        closeProductModal,
        settings,
        updateSettings,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isScannerOpen,
        setIsScannerOpen,
        scannerMode,
        setScannerMode,
        openScanner,
        closeScanner,
        syncStatus,
        lastSyncTime,
        refreshFromServer,
        syncWithServer,
        saveToServer,
        importFullBackup,
        isSyncModalOpen,
        setIsSyncModalOpen,
        userRole,
        setUserRole,
        loggedMerchantId,
        loggedMerchant,
        hasAccessSelected,
        setHasAccessSelected,
        loginRole,
        logoutRole,
        adminPin,
        setAdminPin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        addMerchant,
        updateMerchant,
        deleteMerchant,
        isMerchantManagerOpen,
        setIsMerchantManagerOpen,
        settlements,
        recordSettlement,
        markSettlementPaid,
        isBrochureModalOpen,
        setIsBrochureModalOpen,
        drivers,
        assignDriverToOrder,
        updateOrderStatus,
        resetOrdersToInitial,
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
