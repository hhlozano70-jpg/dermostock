export type Brand = string;

export type MerchantCategory = 
  | 'Abarrotes y Cremería'
  | 'Refaccionaria y Automotriz'
  | 'Servicios Personalizados'
  | 'Farmacia y Salud'
  | 'Ferretería y Tlapalería'
  | 'Mascotas y Veterinaria'
  | 'Flores y Regalos'
  | 'Cadena Fría (Aguas, Paletas, Cervezas)'
  | string;

export type Category = MerchantCategory;

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
}

export type PriceTier = 'comercial' | 'mayorista' | 'promocion';

export type DeliveryType = 'domicilio' | 'punto_fijo' | 'envio' | 'sucursal';

export interface StoreSettings {
  whatsappNumber: string; // e.g. "524721234567"
  businessName: string;   // "Silaomarket on line"
  defaultPickupPoint?: string; // "Hub Central Silao - Jardín Principal / 5 de Mayo"
  city: string; // "Silao"
  state: string; // "Guanajuato"
  hubAddress: string; // "Hub Central de Envíos Silao, Calle 5 de Mayo #45, Silao Centro"
  deliveryCost: number; // Costo único de envío por pedido consolidado
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

export interface Order {
  id: string;
  date: string;
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
  appliedTier: PriceTier;
  hasColdChain: boolean;
  merchantsCount: number;
  merchantsNames: string[];
  status: 'completado' | 'pendiente' | 'entregado';
}
