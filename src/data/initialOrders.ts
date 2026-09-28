import { Order } from '../types/inventory';
import { INITIAL_SILAO_PRODUCTS } from './silaoMarketData';

const getProd = (id: string) => {
  const p = INITIAL_SILAO_PRODUCTS.find((item) => item.id === id);
  if (!p) {
    return INITIAL_SILAO_PRODUCTS[0];
  }
  return p;
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-SILAO-101',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // Hace 2 días
    customerName: 'Arq. Roberto Granados',
    customerPhone: '472 105 8421',
    customerAddress: 'Calle Río Lerma #18, Fracc. Valle del Rizo, Silao, Gto.',
    deliveryColonia: 'Fracc. Valle del Rizo',
    deliveryType: 'domicilio',
    paymentMethod: 'transferencia',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 3,
    merchantsNames: [
      'Abarrotes y Cremería La Providencia',
      'Paletería y Helados La Michoacana Silao',
      'Ferretería y Tlapalería El Tornillo'
    ],
    items: [
      {
        product: getProd('silao-ab-01'), // Huevo San Juan
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 52.00,
      },
      {
        product: getProd('silao-frio-01'), // Agua de Horchata
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 42.00,
      },
      {
        product: getProd('silao-frio-03'), // Paleta Fresa
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 65.00,
      },
      {
        product: getProd('silao-ferr-01'), // Foco LED Philips
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 120.00,
      },
    ],
    subtotal: 321.00,
    discountSavings: 0,
    total: 321.00,
    status: 'entregado',
  },
  {
    id: 'ORD-SILAO-102',
    date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // Hace 18 horas
    customerName: 'Lic. Claudia Morales Torres',
    customerPhone: '472 118 9932',
    customerAddress: 'Av. Zaragoza #45, Silao Centro, Silao, Gto.',
    deliveryColonia: 'Silao Centro',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'Florería Rosa de Oro Silao',
      'Farmacia & Botica San Juan Silao'
    ],
    items: [
      {
        product: getProd('silao-flor-01'), // 12 Rosas
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 280.00,
      },
      {
        product: getProd('silao-farm-01'), // Electrolit Fresa
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 35.00,
      },
    ],
    subtotal: 350.00,
    discountSavings: 0,
    total: 350.00,
    status: 'entregado',
  },
  {
    id: 'ORD-SILAO-103',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // Hace 3 horas
    customerName: 'Ing. Carlos Macías',
    customerPhone: '472 144 7720',
    customerAddress: 'Calle San Juan Bosco #102, Col. Sopeña, Silao, Gto.',
    deliveryColonia: 'Col. Sopeña',
    deliveryType: 'domicilio',
    paymentMethod: 'contra_entrega',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 2,
    merchantsNames: [
      'Refaccionaria Automotriz El Güero',
      'Depósito & Cervecería Fría El Bajío'
    ],
    items: [
      {
        product: getProd('silao-ref-01'), // Castrol 20W-50
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 580.00,
      },
      {
        product: getProd('silao-cerveza-01'), // Six Corona Fría
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 135.00,
      },
      {
        product: getProd('silao-cerveza-03'), // Bolsa Hielo
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 32.00,
      },
    ],
    subtotal: 747.00,
    discountSavings: 0,
    total: 747.00,
    status: 'completado',
  },
];
