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
  description?: string;
  canAccompanyOrders?: boolean; // Permite que sus trabajos o productos viajen junto a pedidos del Hub Central
  isCustom?: boolean; // Creado o editado por el administrador
}

export const BROCHURE_COMMISSIONS: GiroCommissionRate[] = [
  { giro: 'Impresiones y trámites oficiales', category: 'Impresiones y trámites oficiales', commission: 10, rate: 10, type: 'Servicio', canAccompanyOrders: true, description: 'Copias, impresiones urgentes, actas de nacimiento, CURP, RFC y documentos oficiales que viajan con los pedidos' },
  { giro: 'Venta de cosas usadas y bazar', category: 'Venta de cosas usadas y bazar', commission: 12, rate: 12, type: 'Producto', canAccompanyOrders: true, description: 'Artículos de segunda mano garantizados, ropa de bazar, antigüedades y oportunidades de ocasión' },
  { giro: 'Páginas web y aplicaciones', category: 'Páginas web y aplicaciones', commission: 15, rate: 15, type: 'Servicio', canAccompanyOrders: false, description: 'Desarrollo de sitios web, menús con código QR, tiendas en línea y aplicaciones para negocios locales' },
  { giro: 'Productos poco comunes y coleccionables', category: 'Productos poco comunes y coleccionables', commission: 14, rate: 14, type: 'Producto', canAccompanyOrders: true, description: 'Artículos raros, piezas descatalogadas, monedas de colección, antigüedades y productos difíciles de conseguir' },
  { giro: 'Restaurantes y comida preparada', category: 'Restaurantes y comida preparada', commission: 18, rate: 18, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Farmacias', category: 'Farmacias', commission: 10, rate: 10, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Abarrotes y mini-súper', category: 'Abarrotes y mini-súper', commission: 8, rate: 8, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Fruterías y verdulerías', category: 'Fruterías y verdulerías', commission: 9, rate: 9, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Botanas y dulcería', category: 'Botanas y dulcería', commission: 12, rate: 12, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Ferretería y materiales', category: 'Ferretería y materiales', commission: 10, rate: 10, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Tortillerías y panaderías', category: 'Tortillerías y panaderías', commission: 8, rate: 8, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Mascotas (alimento y accesorios)', category: 'Mascotas (alimento y accesorios)', commission: 14, rate: 14, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Papelería y oficina', category: 'Papelería y oficina', commission: 12, rate: 12, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Flores y regalos', category: 'Flores y regalos', commission: 18, rate: 18, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Limpieza y hogar', category: 'Limpieza y hogar', commission: 14, rate: 14, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Belleza y cuidado personal', category: 'Belleza y cuidado personal', commission: 15, rate: 15, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Ropa y calzado', category: 'Ropa y calzado', commission: 15, rate: 15, type: 'Producto', canAccompanyOrders: true },
  { giro: 'Limpieza del hogar', category: 'Limpieza del hogar', commission: 18, rate: 18, type: 'Servicio', canAccompanyOrders: false },
  { giro: 'Plomería y electricidad', category: 'Plomería y electricidad', commission: 15, rate: 15, type: 'Servicio', canAccompanyOrders: false },
  { giro: 'Lavandería', category: 'Lavandería', commission: 15, rate: 15, type: 'Servicio', canAccompanyOrders: true },
  { giro: 'Estética a domicilio', category: 'Estética a domicilio', commission: 18, rate: 18, type: 'Servicio', canAccompanyOrders: false },
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
  pin?: string; // Contraseña alfanumérica hasta 18 caracteres (compatibilidad pin)
  password?: string; // Contraseña alfanumérica hasta 18 caracteres del encargado
  logoUrl?: string; // Espacio para el logo oficial de cada negocio
  bankAccount?: string; // CLABE o banco para liquidación semanal
  ownerName?: string;
  email?: string;
  websiteUrl?: string;
  brochureUrl?: string;
  sourceUrl?: string;
  status?: 'active' | 'inactive';

  // Horario de atención y servicio del negocio (Apertura y Cierre)
  openingTime?: string;            // Formato 24h ej. "08:30" (Apertura)
  closingTime?: string;            // Formato 24h ej. "20:00" (Cierre)
  serviceDays?: string;            // ej. "Lunes a Domingo", "Lunes a Sábado"
  serviceHoursNote?: string;       // Nota opcional ej. "Abre 8:30 AM - Cierra 8:00 PM"

  // Modalidad física vs. Independiente / Sin local físico
  isPhysicalLocation?: boolean;    // true = Local con mostrador; false = Sin local físico (independiente / trabajo desde casa / digital)
  canAccompanyOrders?: boolean;    // true = Sus entregas/trabajos pueden viajar junto a pedidos consolidados del Hub Central
  serviceTypeTag?: string;         // Ej. "Trámites e Impresiones", "Segunda Mano / Bazar", "Digital / Web", "Poco Comunes"
  customGiroId?: string;

  // Opcionales para cada tienda: Mayoreo y Promociones Especiales
  hasWholesale?: boolean;          // Opcional: ¿La tienda ofrece precios a mayoreo?
  wholesaleMinPieces?: number;     // En qué casos aplica: número de piezas mínimas (ej. 3, 6, 12 pzas)
  hasSpecialPromos?: boolean;      // Opcional: ¿La tienda ofrece promociones especiales?
  promoMinPieces?: number;         // En qué casos aplica: piezas mínimas para promo especial
  promoTerms?: string;             // Explicación de en qué casos aplica (ej. "Ofertas de folleto", "2x1 a partir de 2 pzas")
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
  commercialPrice: number; // Precio Comercial (MXN) - Estándar inicial para todos
  wholesalePrice: number;  // Precio Mayorista (opcional según tienda y piezas mínimas)
  promoPrice: number;      // Precio Promoción / Oferta declarada
  stock: number;           // Numero de piezas
  minStockAlert: number;   // Umbral de stock bajo (default 2)
  description?: string;
  packagingType?: 'bottle' | 'large_bottle' | 'tin' | 'tube' | 'pump' | 'lip_balm' | 'box' | 'jar' | 'dropper' | 'package' | 'cold_box' | 'service' | 'bag' | 'tetra' | 'pack' | 'bar' | 'can' | 'bulk' | 'tray' | string;
  volume?: string;
  imageUrl?: string;       // Foto / Imagen personalizada
  barcode?: string;        // Código de barras EAN-13, UPC o Code-128
  sourceUrl?: string;      // Enlace web oficial al folleto o tienda

  // Condiciones de aplicación de precios por producto:
  isOfferDeclared?: boolean;       // OFERTA YA DECLARADA: Aplica precio de oferta directo desde 1 pieza (folleto/temporada)
  hasWholesale?: boolean;          // Opcional para este producto específico (si false, solo comercial)
  wholesaleMinPieces?: number;     // Piezas mínimas específicas para mayoreo de este producto
  hasSpecialPromos?: boolean;      // Opcional para este producto específico
  promoMinPieces?: number;         // Piezas mínimas para promo especial
  promoDescription?: string;       // Descripción de la oferta o promoción
}

export interface CartItem {
  product: Product;
  quantity: number;
  appliedTier: PriceTier;
  unitPrice: number;
  savings?: number;
  isWholesaleApplied?: boolean;
  isDeclaredOffer?: boolean;
  minPiecesWholesale?: number;
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
