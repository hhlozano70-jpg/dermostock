import { Order } from '../types/inventory';
import { INITIAL_PRODUCTS } from './initialProducts';

const getProd = (id: string) => {
  const p = INITIAL_PRODUCTS.find((item) => item.id === id);
  if (!p) throw new Error(`Product ${id} not found`);
  return p;
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-849201',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // Hace 5 días
    customerName: 'Dra. Sofía Mendoza',
    customerPhone: '55 4192 8831',
    customerAddress: 'Av. Insurgentes Sur 1420, Col. Actipan, CDMX',
    deliveryType: 'envio',
    paymentMethod: 'transferencia',
    appliedTier: 'mayorista',
    items: [
      {
        product: getProd('prod-05'), // Eucerin Advanced Repair
        quantity: 3,
        appliedTier: 'mayorista',
        unitPrice: 288.00,
      },
      {
        product: getProd('prod-16'), // Eucerin pH5 Locion
        quantity: 2,
        appliedTier: 'mayorista',
        unitPrice: 216.00,
      },
      {
        product: getProd('prod-03'), // Aquaphor Healing Ointment 50g
        quantity: 4,
        appliedTier: 'mayorista',
        unitPrice: 90.00,
      },
    ],
    subtotal: 2760.00,
    discountSavings: 1104.00,
    total: 1656.00,
    status: 'completado',
  },
  {
    id: 'ORD-849202',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // Hace 3 días
    customerName: 'Farmacia Dermatológica San Ángel',
    customerPhone: '55 8329 1104',
    customerAddress: 'Av. Revolución 1120, San Ángel, CDMX',
    deliveryType: 'envio',
    paymentMethod: 'transferencia',
    appliedTier: 'mayorista',
    items: [
      {
        product: getProd('prod-04'), // Aquaphor Baby Wash
        quantity: 5,
        appliedTier: 'mayorista',
        unitPrice: 156.00,
      },
      {
        product: getProd('prod-07'), // Aquaphor Baby Diaper Rash
        quantity: 4,
        appliedTier: 'mayorista',
        unitPrice: 114.00,
      },
      {
        product: getProd('prod-17'), // Aquaphor Baby Healing Ointment
        quantity: 3,
        appliedTier: 'mayorista',
        unitPrice: 168.00,
      },
    ],
    subtotal: 2900.00,
    discountSavings: 1160.00,
    total: 1740.00,
    status: 'completado',
  },
  {
    id: 'ORD-849203',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // Hace 2 días
    customerName: 'Mariana Valenzuela',
    customerPhone: '55 1948 2039',
    customerAddress: 'Calle Durango 88, Roma Norte, CDMX',
    deliveryType: 'envio',
    paymentMethod: 'tarjeta',
    appliedTier: 'comercial',
    items: [
      {
        product: getProd('prod-01'), // Nivea Milk Nutritiva
        quantity: 4,
        appliedTier: 'comercial',
        unitPrice: 100.00,
      },
      {
        product: getProd('prod-08'), // Bálsamo Nivea Watermelon x2
        quantity: 6,
        appliedTier: 'comercial',
        unitPrice: 130.00,
      },
      {
        product: getProd('prod-09'), // Nivea Lata Azul
        quantity: 5,
        appliedTier: 'comercial',
        unitPrice: 45.00,
      },
    ],
    subtotal: 1405.00,
    discountSavings: 0.00,
    total: 1405.00,
    status: 'completado',
  },
  {
    id: 'ORD-849204',
    date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // Ayer
    customerName: 'Carlos Alberto Ríos',
    customerPhone: '55 3302 9941',
    deliveryType: 'sucursal',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    items: [
      {
        product: getProd('prod-06'), // Nivea Men Sensitive
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 110.00,
      },
      {
        product: getProd('prod-18'), // Nivea Men Post Shave
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 140.00,
      },
      {
        product: getProd('prod-15'), // Nivea Crema Solar FPS 15
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 110.00,
      },
    ],
    subtotal: 610.00,
    discountSavings: 0.00,
    total: 610.00,
    status: 'completado',
  },
  {
    id: 'ORD-849205',
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // Hoy hace 4h
    customerName: 'DermoClínica Pedregal',
    customerPhone: '55 9012 3456',
    customerAddress: 'Periférico Sur 4302, Jardines del Pedregal, CDMX',
    deliveryType: 'envio',
    paymentMethod: 'transferencia',
    appliedTier: 'promocion',
    items: [
      {
        product: getProd('prod-05'), // Eucerin Advanced Repair
        quantity: 4,
        appliedTier: 'promocion',
        unitPrice: 192.00,
      },
      {
        product: getProd('prod-16'), // Eucerin pH5
        quantity: 3,
        appliedTier: 'promocion',
        unitPrice: 144.00,
      },
      {
        product: getProd('prod-04'), // Aquaphor Baby Wash
        quantity: 2,
        appliedTier: 'promocion',
        unitPrice: 104.00,
      },
      {
        product: getProd('prod-01'), // Nivea Milk
        quantity: 5,
        appliedTier: 'promocion',
        unitPrice: 40.00,
      },
    ],
    subtotal: 3980.00,
    discountSavings: 2372.00,
    total: 1608.00,
    status: 'completado',
  },
];
