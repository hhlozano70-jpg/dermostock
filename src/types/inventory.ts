export type Brand = string;

export type UserRole = 'cliente' | 'negocio' | 'admin';

export type MerchantCategory = 
  | 'Abarrotes y Cremería'
  | 'Refaccionaria y Automotriz'
  | 'Servicios Personalizados'
  | 'Farmacia y Salud'
  | 'Ferretería y Tlapalería'
  | 'Mascotas y Veterinaria'
  | 'Flores y Regalos'
  | 'Cadena Fría (Aguas, Paletas, Cervezas)'
  | 'Restaurantes y Comida'
  | 'Belleza y Cuidado Personal'
  | string;

export type Category = MerchantCategory;

export interface GiroCommissionRate {
  giro: string;
  category: string; // Alias for giro
  commission: number; // e.g. 8, 10, 12, 14, 15, 18
  rate: number; // Alias for commission
  type: 'Producto' | 'Servicio';
}

export const BROCHURE_COMMISSIONS: GiroCommissionRate[] = [
  { giro: 'Restaurantes y comida preparada', category: 'Restaurantes y comida preparada', commission: 18, rate: 18, type: 'Producto' },
  { giro: 'Farmacias', category: 'Farmacias', commission: 10, rate: 10, type: 'Producto' },
  { giro: 'Abarrotes y mini-súper', category: 'Abarrotes y mini-súper', commission: 8, rate: 8, type: 'Producto' },
  { giro: 'Fruterías y verdulerías', category: 'Fruterías y verdulerías', commission: 9, rate: 9, type: 'Producto' },
  { giro: 'Botanas y dulcería', category: 'Botanas y dulcería', commission: 12, rate: 12, type: 'Producto' },
  { giro: 'Ferretería y materiales', category: 'Ferretería y materiales', commission: 10, rate: 10, type: 'Producto' },
  { giro: 'Tortillerías y panaderías', category: 'Tortillerías y panaderías', commission: 8, rate: 8, type: 'Producto' },
  { giro: 'Mascotas (alimento y accesorios)', category: 'Mascotas (alimento y accesorios)', commission: 14, rate: 14, type: 'Producto' },
  { giro: 'Papelería y oficina', category: 'Papelería y oficina', commission: 12, rate: 12, type: 'Producto' },
  { giro: 'Flores y regalos', category: 'Flores y regalos', commission: 18, rate: 18, type: 'Producto' },
  { giro: 'Limpieza y hogar', category: 'Limpieza y hogar', commission: 14, rate: 14, type: 'Producto' },
  { giro: 'Belleza y cuidado personal', category: 'Belleza y cuidado personal', commission: 15, rate: 15, type: 'Producto' },
  { giro: 'Ropa y calzado', category: 'Ropa y calzado', commission: 15, rate: 15, type: 'Producto' },
  { giro: 'Limpieza del hogar', category: 'Limpieza del hogar', commission: 18, rate: 18, type: 'Servicio' },
  { giro: 'Plomería y electricidad', category: 'Plomería y electricidad', commission: 15, rate: 15, type: 'Servicio' },
  { giro: 'Lavandería', category: 'Lavandería', commission: 15, rate: 15, type: 'Servicio' },
  { giro: 'Estética a domicilio', category: 'Estética a domicilio', commission: 18, rate: 18, type: 'Servicio' },
];

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  address: string;
  silaoZone: string; // e.g. "Centro", "Blvd. Raúl Bailleres", "Calzada Hidalgo", "Sopeña"
  phone?: string;
  rating: number;
  reviewsCount: number;
  isColdChain?: boolean; // Requiere hielera / cadena de frío
  badge: string;
  iconName: string;
  description: string;
  commissionRate?: number; // % de comisión según giro (8% - 18%)
  type?: 'Producto' | 'Servicio';
  pin?: string; // PIN de acceso (default "1234")
  bankAccount?: string; // CLABE o banco para liquidación semanal
  ownerName?: string;
  email?: string;
  websiteUrl?: string;
  brochureUrl?: string;
}

export interface MerchantSettlement {
  id: string;
  merchantId: string;
  merchantName: string;
  period: string; // ej. "Semana 39 (22-28 Sep 2026)"
  orderIds: string[];
  grossSales: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: 'pendiente' | 'pagado';
  settledDate?: string;
  paymentReference?: string;
  notes?: string;
}

export type PriceTier = 'comercial' | 'mayorista' | 'promocion';

export type DeliveryType = 'domicilio' | 'punto_fijo' | 'envio' | 'sucursal';

export interface Driver {
  id: string;
  name: string;
  phone: string; // WhatsApp
  vehicle: string;
  status: 'disponible' | 'en_ruta' | 'descanso';
  activeOrdersCount?: number;
  totalDelivered?: number;
  rating?: number;
}

export interface StoreSettings {
  whatsappNumber: string; // e.g. "524721234567"
  businessName: string;   // "Silaomarket on line"
  defaultPickupPoint?: string; // "Hub Central Silao - Jardín Principal / 5 de Mayo"
  city: string; // "Silao"
  state: string; // "Guanajuato"
  hubAddress: string; // "Hub Central de Envíos Silao, Calle 5 de Mayo #45, Silao Centro"
  deliveryCost: number; // Costo único de envío por pedido consolidado
  orderStartTime?: string; // "08:00"
  orderEndTime?: string;   // "20:00"
  maxOrdersPerHour?: number; // ej. 12
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  presentation: string;
  brand: string;
  category: Category;
  merchantId: string;
  merchantName: string;
  merchantCategory: MerchantCategory;
  merchantAddress?: string;
  isColdChain?: boolean; // ❄️ Requiere hielera / transporte térmico
  commercialPrice: number; // Precio Comercial (MXN)
  wholesalePrice: number;  // Precio Mayorista (-40%)
  promoPrice: number;      // Precio Promoción (-60%)
  stock: number;           // Numero de piezas
  minStockAlert: number;   // Umbral de stock bajo (default 2)
  description?: string;
  packagingType?: 'bottle' | 'large_bottle' | 'tin' | 'tube' | 'pump' | 'lip_balm' | 'box' | 'jar' | 'dropper' | 'package' | 'cold_box' | 'service' | 'bag';
  volume?: string;
  imageUrl?: string;       // Foto / Imagen personalizada
  barcode?: string;        // Código de barras EAN-13, UPC o Code-128
  sourceUrl?: string;      // Enlace web oficial al folleto o tienda
}

export interface CartItem {
  product: Product;
  quantity: number;
  appliedTier: PriceTier;
  unitPrice: number;
}

export type MovementType = 'entrada' | 'salida' | 'venta' | 'ajuste';

export interface InventoryMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number; // positivo para entrada, negativo para salida/venta
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string; // ej. No. de Pedido o Factura
}

export type TrackingStatus = 'recibido' | 'en_recoleccion' | 'consolidado' | 'en_camino' | 'entregado';

export interface TrackingEvent {
  status: TrackingStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  date: string;
  trackingCode: string; // e.g. "SLO-TRK-74921"
  trackingStatus: TrackingStatus;
  timeline?: TrackingEvent[];
  driverId?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string;
  assignedAt?: string;
  deliveredAt?: string;
  scheduledTime?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryPoint?: string;
  deliveryColonia?: string;
  deliveryType: DeliveryType;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega';
  items: CartItem[];
  subtotal: number;
  discountSavings: number;
  total: number;
  deliveryFee?: number;
  appliedTier: PriceTier;
  hasColdChain: boolean;
  merchantsCount: number;
  merchantsNames: string[];
  status: 'completado' | 'pendiente' | 'entregado';
  qrData?: string;
}

export type CreateOrderInput = Omit<Order, 'id' | 'date' | 'status' | 'trackingCode' | 'trackingStatus'> & {
  trackingCode?: string;
  trackingStatus?: TrackingStatus;
};
