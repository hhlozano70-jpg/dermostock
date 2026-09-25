export type Brand = 
  | 'Nivea' 
  | 'Eucerin' 
  | 'Aquaphor' 
  | 'Aquaphor Baby' 
  | 'Nivea Men' 
  | 'Aquaphor / Eucerin'
  | string;

export type Category = 
  | 'Cuidado Corporal' 
  | 'Reparación Dermatológica' 
  | 'Cuidado Infantil' 
  | 'Cuidado Facial & Labial' 
  | 'Gel de Ducha' 
  | 'Cuidado Masculino' 
  | 'Protección Solar'
  | string;

export type PriceTier = 'comercial' | 'mayorista' | 'promocion';

export type DeliveryType = 'domicilio' | 'punto_fijo' | 'envio' | 'sucursal';

export interface StoreSettings {
  whatsappNumber: string; // e.g. "5215512345678" o "5512345678"
  businessName: string;
  defaultPickupPoint?: string; // e.g. "Punto de encuentro a convenir"
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  presentation: string;
  brand: Brand;
  category: Category;
  commercialPrice: number; // Precio Comercial (MXN)
  wholesalePrice: number;  // Precio Mayorista (-40%)
  promoPrice: number;      // Precio Promoción (-60%)
  stock: number;           // Numero de piezas
  minStockAlert: number;   // Umbral de stock bajo (default 2)
  description?: string;
  packagingType: 'bottle' | 'large_bottle' | 'tin' | 'tube' | 'pump' | 'lip_balm' | 'box' | 'jar' | 'dropper';
  volume?: string;
  imageUrl?: string;       // Foto / Imagen personalizada (URL o Base64/DataURL)
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
  deliveryType: DeliveryType;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega';
  items: CartItem[];
  subtotal: number;
  discountSavings: number;
  total: number;
  appliedTier: PriceTier;
  status: 'completado' | 'pendiente' | 'entregado';
}

