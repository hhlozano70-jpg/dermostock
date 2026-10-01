import { Order } from '../types/inventory';
import { INITIAL_SILAO_PRODUCTS } from './silaoMarketData';

const getProd = (id: string) => {
  const p = INITIAL_SILAO_PRODUCTS.find((item) => item.id === id);
  if (!p) {
    return INITIAL_SILAO_PRODUCTS[0];
  }
  return p;
};

// Generador de fechas para evaluación operativa en Silao (horario 8:00 a 20:00)
const getDateForToday = (hours: number, minutes: number, daysAgo = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const INITIAL_ORDERS: Order[] = [
  // =========================================================================
  // BLOQUE 1: ENTREGADOS CON ÉXITO (4 PEDIDOS)
  // =========================================================================
  {
    id: 'ORD-SLO-201',
    date: getDateForToday(8, 20),
    scheduledTime: '10:00',
    customerName: 'Arq. Roberto Granados M.',
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
        product: getProd('prod-silao-abarrotes-01'), // Huevo Blanco de Granja
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 48.00,
      },
      {
        product: getProd('prod-silao-cadena-fria-01'), // Paleta Fresa
        quantity: 3,
        appliedTier: 'comercial',
        unitPrice: 28.00,
      },
      {
        product: getProd('prod-silao-ferreteria-01'), // Foco LED Philips
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 45.00,
      }
    ],
    subtotal: 270.00,
    discountSavings: 0,
    deliveryFee: 35.00,
    total: 305.00,
    status: 'entregado',
    trackingCode: 'SLO-TRK-201',
    trackingStatus: 'entregado',
    driverId: 'drv-1',
    courierName: 'Carlos Méndez (Italika FT150 Roja)',
    courierPhone: '4721019944',
    courierVehicle: 'Italika FT150 - GTO-884A (Caja térmica roja)',
    assignedAt: getDateForToday(8, 45),
    deliveredAt: getDateForToday(10, 15),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-201',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central Calle 5 de Mayo #45',
        timestamp: getDateForToday(8, 20),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Carlos Méndez recolectó en La Providencia, Michoacana y El Tornillo',
        timestamp: getDateForToday(8, 50),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado con hielera térmica de frío ❄️ en Hub Silao',
        timestamp: getDateForToday(9, 35),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'En ruta hacia Fracc. Valle del Rizo',
        timestamp: getDateForToday(9, 50),
        completed: true,
      },
      {
        status: 'entregado',
        title: 'Entregado al Cliente',
        description: 'Entrega concluida y firma de recepción confirmada',
        timestamp: getDateForToday(10, 15),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-202',
    date: getDateForToday(8, 55),
    scheduledTime: '11:00',
    customerName: 'Lic. Claudia Morales Torres',
    customerPhone: '472 118 9932',
    customerAddress: 'Av. Zaragoza #45, Silao Centro, Silao, Gto.',
    deliveryColonia: 'Silao Centro',
    deliveryType: 'domicilio',
    paymentMethod: 'tarjeta',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'Florería Rosa de Oro Silao',
      'Farmacia & Botica San Juan Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-flores-01'), // Ramo 12 Rosas Rojas
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 320.00,
      },
      {
        product: getProd('prod-silao-farmacia-01'), // Electrolit Fresa
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 32.00,
      }
    ],
    subtotal: 384.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 412.00,
    status: 'entregado',
    trackingCode: 'SLO-TRK-202',
    trackingStatus: 'entregado',
    driverId: 'drv-2',
    courierName: 'Alejandro Rocha (Honda Cargo Azul)',
    courierPhone: '4721153322',
    courierVehicle: 'Honda Cargo 125 - GTO-319B (Caja térmica azul)',
    assignedAt: getDateForToday(9, 20),
    deliveredAt: getDateForToday(10, 50),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-202',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central Calle 5 de Mayo #45',
        timestamp: getDateForToday(8, 55),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolectado en Florería Rosa de Oro y Farmacia San Juan',
        timestamp: getDateForToday(9, 25),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado listo para entrega en centro histórico',
        timestamp: getDateForToday(10, 5),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'Repartidor en ruta a Av. Zaragoza #45',
        timestamp: getDateForToday(10, 20),
        completed: true,
      },
      {
        status: 'entregado',
        title: 'Entregado al Cliente',
        description: 'Entregado en recepción con pago con tarjeta verificado',
        timestamp: getDateForToday(10, 50),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-203',
    date: getDateForToday(9, 30),
    scheduledTime: '11:30',
    customerName: 'Ing. Carlos Macías Alcocer',
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
        product: getProd('prod-silao-refacciones-01'), // Castrol 20W-50
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 520.00,
      },
      {
        product: getProd('prod-silao-cerveceria-01'), // Six Corona Fría
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 135.00,
      },
      {
        product: getProd('prod-silao-cerveceria-03'), // Bolsa Hielo 5kg
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 30.00,
      }
    ],
    subtotal: 820.00,
    discountSavings: 0,
    deliveryFee: 33.00,
    total: 853.00,
    status: 'entregado',
    trackingCode: 'SLO-TRK-203',
    trackingStatus: 'entregado',
    driverId: 'drv-3',
    courierName: 'Miguel Ángel Torres (El Güero)',
    courierPhone: '4721287711',
    courierVehicle: 'Yamaha YBR 125 - GTO-502C (Hielera activa ❄️)',
    assignedAt: getDateForToday(9, 50),
    deliveredAt: getDateForToday(11, 25),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-203',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(9, 30),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolección en Refaccionaria El Güero y Cervecería El Bajío',
        timestamp: getDateForToday(9, 55),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Paquete con hielera activa sellado en Hub',
        timestamp: getDateForToday(10, 35),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'Ruta hacia Col. Sopeña',
        timestamp: getDateForToday(10, 50),
        completed: true,
      },
      {
        status: 'entregado',
        title: 'Entregado al Cliente',
        description: 'Entregado y cobrado contra entrega en efectivo',
        timestamp: getDateForToday(11, 25),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-204',
    date: getDateForToday(10, 15),
    scheduledTime: '12:00',
    customerName: 'Dra. Marcela Villanueva',
    customerPhone: '472 165 4410',
    customerAddress: 'Blvd. Raúl Bailleres #210, Fracc. Las Cruces, Silao, Gto.',
    deliveryColonia: 'Fracc. Las Cruces',
    deliveryType: 'domicilio',
    paymentMethod: 'tarjeta',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'MARET SILAO',
      'Veterinaria & PetShop Huellitas Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-maret-silao-01'), // Blusa Artesanal
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 380.00,
      },
      {
        product: getProd('prod-silao-mascotas-01'), // Nupec Perro 2kg
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 290.00,
      }
    ],
    subtotal: 670.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 698.00,
    status: 'entregado',
    trackingCode: 'SLO-TRK-204',
    trackingStatus: 'entregado',
    driverId: 'drv-1',
    courierName: 'Carlos Méndez (Italika FT150 Roja)',
    courierPhone: '4721019944',
    courierVehicle: 'Italika FT150 - GTO-884A (Caja térmica roja)',
    assignedAt: getDateForToday(10, 30),
    deliveredAt: getDateForToday(11, 55),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-204',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(10, 15),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolectado en MARET SILAO y PetShop Huellitas',
        timestamp: getDateForToday(10, 35),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Empaque de boutique y producto pet consolidado',
        timestamp: getDateForToday(11, 10),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'En camino a Fracc. Las Cruces',
        timestamp: getDateForToday(11, 25),
        completed: true,
      },
      {
        status: 'entregado',
        title: 'Entregado al Cliente',
        description: 'Entrega confirmada a la Dra. Villanueva',
        timestamp: getDateForToday(11, 55),
        completed: true,
      }
    ]
  },

  // =========================================================================
  // BLOQUE 2: EN CAMINO / EN RUTA CON DRIVER (5 PEDIDOS)
  // =========================================================================
  {
    id: 'ORD-SLO-205',
    date: getDateForToday(10, 45),
    scheduledTime: '12:30',
    customerName: 'Don Jesús Valdivia Ortega',
    customerPhone: '472 133 9021',
    customerAddress: 'Calle 5 de Mayo #78, Silao Centro, Silao, Gto.',
    deliveryColonia: 'Silao Centro',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 3,
    merchantsNames: [
      'Abarrotes y Cremería La Providencia',
      'Farmacia & Botica San Juan Silao',
      'Ferretería y Tlapalería El Tornillo'
    ],
    items: [
      {
        product: getProd('prod-silao-abarrotes-03'), // Queso Panela Fresco
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 65.00,
      },
      {
        product: getProd('prod-silao-farmacia-03'), // Paracetamol
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 25.00,
      },
      {
        product: getProd('prod-silao-ferreteria-04'), // Cinta Canela
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 35.00,
      }
    ],
    subtotal: 185.00,
    discountSavings: 0,
    deliveryFee: 34.00,
    total: 219.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-205',
    trackingStatus: 'en_camino',
    driverId: 'drv-2',
    courierName: 'Alejandro Rocha (Honda Cargo Azul)',
    courierPhone: '4721153322',
    courierVehicle: 'Honda Cargo 125 - GTO-319B (Caja térmica azul)',
    assignedAt: getDateForToday(11, 10),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-205',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(10, 45),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Alejandro Rocha recolectó en 3 tiendas de Silao Centro',
        timestamp: getDateForToday(11, 15),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado con preservación de frío para lácteos',
        timestamp: getDateForToday(11, 50),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'Driver en trayecto a Calle 5 de Mayo #78 (a 5 minutos)',
        timestamp: getDateForToday(12, 5),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-206',
    date: getDateForToday(11, 15),
    scheduledTime: '13:00',
    customerName: 'Mtra. Sofía Delgado Reyes',
    customerPhone: '472 147 6234',
    customerAddress: 'Calle Hidalgo #33, Barrio Nuevo, Silao, Gto.',
    deliveryColonia: 'Barrio Nuevo',
    deliveryType: 'domicilio',
    paymentMethod: 'transferencia',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'MARET SILAO',
      'Florería Rosa de Oro Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-maret-silao-02'), // Vestido Casual
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 490.00,
      },
      {
        product: getProd('prod-silao-flores-03'), // Girasoles Silao
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 280.00,
      }
    ],
    subtotal: 770.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 798.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-206',
    trackingStatus: 'en_camino',
    driverId: 'drv-3',
    courierName: 'Miguel Ángel Torres (El Güero)',
    courierPhone: '4721287711',
    courierVehicle: 'Yamaha YBR 125 - GTO-502C (Hielera activa ❄️)',
    assignedAt: getDateForToday(11, 40),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-206',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(11, 15),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolectado en MARET SILAO y Florería Rosa de Oro',
        timestamp: getDateForToday(11, 45),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Paquete de regalo protegido en caja especial',
        timestamp: getDateForToday(12, 15),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'Repartidor transitando hacia Barrio Nuevo',
        timestamp: getDateForToday(12, 30),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-207',
    date: getDateForToday(11, 45),
    scheduledTime: '13:30',
    customerName: 'C.P. Fernando Becerra',
    customerPhone: '472 178 8802',
    customerAddress: 'Fracc. Rinconada de las Flores #12, Silao, Gto.',
    deliveryColonia: 'Fracc. Rinconada de las Flores',
    deliveryType: 'domicilio',
    paymentMethod: 'tarjeta',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 3,
    merchantsNames: [
      'Paletería y Helados La Michoacana Silao',
      'Abarrotes y Cremería La Providencia',
      'Depósito & Cervecería Fría El Bajío'
    ],
    items: [
      {
        product: getProd('prod-silao-cadena-fria-04'), // Helado 1L
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 110.00,
      },
      {
        product: getProd('prod-silao-abarrotes-05'), // Queso Manchego
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 82.00,
      },
      {
        product: getProd('prod-silao-cerveceria-08'), // Botana Cacahuates
        quantity: 3,
        appliedTier: 'comercial',
        unitPrice: 22.00,
      }
    ],
    subtotal: 258.00,
    discountSavings: 0,
    deliveryFee: 34.00,
    total: 292.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-207',
    trackingStatus: 'en_camino',
    driverId: 'drv-4',
    courierName: 'Brenda Salazar (Suzuki Isotérmica)',
    courierPhone: '4721445588',
    courierVehicle: 'Suzuki AX100 - GTO-714D (Caja isotérmica)',
    assignedAt: getDateForToday(12, 10),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-207',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(11, 45),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Brenda recolectando helado con hielera portátil',
        timestamp: getDateForToday(12, 15),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado con congelante en caja isotérmica',
        timestamp: getDateForToday(12, 40),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'En trayecto hacia Fracc. Rinconada de las Flores',
        timestamp: getDateForToday(12, 55),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-208',
    date: getDateForToday(12, 15),
    scheduledTime: '14:00',
    customerName: 'Arq. Elena Pantoja Silva',
    customerPhone: '472 112 3456',
    customerAddress: 'Calle Manuel Doblado #89, Col. Los Ángeles, Silao, Gto.',
    deliveryColonia: 'Col. Los Ángeles',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'Ferretería y Tlapalería El Tornillo',
      'Servicios Exprés & Cerrajería Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-ferreteria-05'), // Candado Seguridad
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 165.00,
      },
      {
        product: getProd('prod-silao-servicios-01'), // Duplicado Llave
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 45.00,
      }
    ],
    subtotal: 255.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 283.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-208',
    trackingStatus: 'en_camino',
    driverId: 'drv-1',
    courierName: 'Carlos Méndez (Italika FT150 Roja)',
    courierPhone: '4721019944',
    courierVehicle: 'Italika FT150 - GTO-884A (Caja térmica roja)',
    assignedAt: getDateForToday(12, 35),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-208',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(12, 15),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolección en cerrajería y ferretería El Tornillo',
        timestamp: getDateForToday(12, 40),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado en Hub Calle 5 de Mayo #45',
        timestamp: getDateForToday(13, 5),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'Driver en camino hacia Col. Los Ángeles',
        timestamp: getDateForToday(13, 20),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-209',
    date: getDateForToday(12, 45),
    scheduledTime: '14:30',
    customerName: 'Lic. Jorge Luis Rangel',
    customerPhone: '472 155 7890',
    customerAddress: 'Av. Silao Poniente #404, Col. La Paz, Silao, Gto.',
    deliveryColonia: 'Col. La Paz',
    deliveryType: 'domicilio',
    paymentMethod: 'contra_entrega',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'Farmacia & Botica San Juan Silao',
      'Abarrotes y Cremería La Providencia'
    ],
    items: [
      {
        product: getProd('prod-silao-farmacia-05'), // Omeprazol 20mg
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 38.00,
      },
      {
        product: getProd('prod-silao-abarrotes-12'), // Leche Deslactosada
        quantity: 3,
        appliedTier: 'comercial',
        unitPrice: 31.00,
      }
    ],
    subtotal: 169.00,
    discountSavings: 0,
    deliveryFee: 31.00,
    total: 200.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-209',
    trackingStatus: 'en_camino',
    driverId: 'drv-2',
    courierName: 'Alejandro Rocha (Honda Cargo Azul)',
    courierPhone: '4721153322',
    courierVehicle: 'Honda Cargo 125 - GTO-319B (Caja térmica azul)',
    assignedAt: getDateForToday(13, 5),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-209',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(12, 45),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Alejandro Rocha recolectó en Farmacia San Juan y Abarrotes',
        timestamp: getDateForToday(13, 10),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado en Hub Silao',
        timestamp: getDateForToday(13, 35),
        completed: true,
      },
      {
        status: 'en_camino',
        title: 'En Camino a Domicilio',
        description: 'Ruta hacia Col. La Paz',
        timestamp: getDateForToday(13, 50),
        completed: true,
      }
    ]
  },

  // =========================================================================
  // BLOQUE 3: CONSOLIDADO EN HUB (3 PEDIDOS)
  // =========================================================================
  {
    id: 'ORD-SLO-210',
    date: getDateForToday(13, 10),
    scheduledTime: '15:00',
    customerName: 'Lic. Miriam Caudillo Guerra',
    customerPhone: '472 138 2901',
    customerAddress: 'Calle Arenal #205, Col. Santiago Apóstol, Silao, Gto.',
    deliveryColonia: 'Col. Santiago Apóstol',
    deliveryType: 'domicilio',
    paymentMethod: 'transferencia',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'MARET SILAO',
      'Florería Rosa de Oro Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-maret-silao-03'), // Bolso Tote Dama
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 420.00,
      },
      {
        product: getProd('prod-silao-flores-02'), // Ramillete Flores
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 190.00,
      }
    ],
    subtotal: 610.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 638.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-210',
    trackingStatus: 'consolidado',
    driverId: 'drv-3',
    courierName: 'Miguel Ángel Torres (El Güero)',
    courierPhone: '4721287711',
    courierVehicle: 'Yamaha YBR 125 - GTO-502C (Hielera activa ❄️)',
    assignedAt: getDateForToday(13, 30),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-210',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(13, 10),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolectado en MARET SILAO y Florería',
        timestamp: getDateForToday(13, 35),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Empaquetado en Hub Central Calle 5 de Mayo #45, listo para salida',
        timestamp: getDateForToday(14, 5),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-211',
    date: getDateForToday(13, 45),
    scheduledTime: '15:30',
    customerName: 'Ing. Javier Zúñiga',
    customerPhone: '472 199 4321',
    customerAddress: 'Parque Industrial FIPASI, Nave 12, Silao, Gto.',
    deliveryColonia: 'Parque Industrial FIPASI',
    deliveryType: 'domicilio',
    paymentMethod: 'transferencia',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 3,
    merchantsNames: [
      'Refaccionaria Automotriz El Güero',
      'Ferretería y Tlapalería El Tornillo',
      'Abarrotes y Cremería La Providencia'
    ],
    items: [
      {
        product: getProd('prod-silao-refacciones-03'), // Limpiador Inyectores
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 85.00,
      },
      {
        product: getProd('prod-silao-ferreteria-06'), // Desarmador Imantado
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 75.00,
      },
      {
        product: getProd('prod-silao-abarrotes-16'), // Galletas Marian
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 42.00,
      }
    ],
    subtotal: 329.00,
    discountSavings: 0,
    deliveryFee: 37.00,
    total: 366.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-211',
    trackingStatus: 'consolidado',
    driverId: 'drv-4',
    courierName: 'Brenda Salazar (Suzuki Isotérmica)',
    courierPhone: '4721445588',
    courierVehicle: 'Suzuki AX100 - GTO-714D (Caja isotérmica)',
    assignedAt: getDateForToday(14, 5),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-211',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(13, 45),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolectado en 3 comercios de Silao',
        timestamp: getDateForToday(14, 10),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Consolidado listo para ruta industrial FIPASI',
        timestamp: getDateForToday(14, 40),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-212',
    date: getDateForToday(14, 15),
    scheduledTime: '16:00',
    customerName: 'Sra. Guillermina Lona',
    customerPhone: '472 121 8765',
    customerAddress: 'Fracc. La Joyita, Calle Esmeralda #45, Silao, Gto.',
    deliveryColonia: 'Fracc. La Joyita',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 2,
    merchantsNames: [
      'Paletería y Helados La Michoacana Silao',
      'Abarrotes y Cremería La Providencia'
    ],
    items: [
      {
        product: getProd('prod-silao-cadena-fria-03'), // Paletas Limón
        quantity: 4,
        appliedTier: 'comercial',
        unitPrice: 22.00,
      },
      {
        product: getProd('prod-silao-abarrotes-07'), // Crema Ácida 500g
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 38.00,
      }
    ],
    subtotal: 164.00,
    discountSavings: 0,
    deliveryFee: 31.00,
    total: 195.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-212',
    trackingStatus: 'consolidado',
    driverId: 'drv-1',
    courierName: 'Carlos Méndez (Italika FT150 Roja)',
    courierPhone: '4721019944',
    courierVehicle: 'Italika FT150 - GTO-884A (Caja térmica roja)',
    assignedAt: getDateForToday(14, 30),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-212',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(14, 15),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Recolectadas paletas y cremas con refrigerante',
        timestamp: getDateForToday(14, 35),
        completed: true,
      },
      {
        status: 'consolidado',
        title: 'Empaquetado y Consolidado',
        description: 'Empacado con hielera térmica de frío ❄️ en Hub Central',
        timestamp: getDateForToday(15, 5),
        completed: true,
      }
    ]
  },

  // =========================================================================
  // BLOQUE 4: EN RECOLECCIÓN EN COMERCIOS (4 PEDIDOS)
  // =========================================================================
  {
    id: 'ORD-SLO-213',
    date: getDateForToday(14, 40),
    scheduledTime: '16:30',
    customerName: 'Dr. Héctor Manuel Lozano',
    customerPhone: '472 160 5544',
    customerAddress: 'Calle Industria Nacional #14, Col. Vía I, Silao, Gto.',
    deliveryColonia: 'Col. Vía I',
    deliveryType: 'domicilio',
    paymentMethod: 'transferencia',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 3,
    merchantsNames: [
      'Abarrotes y Cremería La Providencia',
      'Farmacia & Botica San Juan Silao',
      'MARET SILAO'
    ],
    items: [
      {
        product: getProd('prod-silao-abarrotes-04'), // Queso Oaxaca
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 78.00,
      },
      {
        product: getProd('prod-silao-farmacia-06'), // Alcohol 70%
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 34.00,
      },
      {
        product: getProd('prod-silao-maret-silao-05'), // Bufanda Lana
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 220.00,
      }
    ],
    subtotal: 444.00,
    discountSavings: 0,
    deliveryFee: 34.00,
    total: 478.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-213',
    trackingStatus: 'en_recoleccion',
    driverId: 'drv-2',
    courierName: 'Alejandro Rocha (Honda Cargo Azul)',
    courierPhone: '4721153322',
    courierVehicle: 'Honda Cargo 125 - GTO-319B (Caja térmica azul)',
    assignedAt: getDateForToday(15, 0),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-213',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(14, 40),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Alejandro Rocha recolectando en La Providencia y Farmacia San Juan',
        timestamp: getDateForToday(15, 5),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-214',
    date: getDateForToday(15, 10),
    scheduledTime: '17:00',
    customerName: 'Lic. Patricia Antillón',
    customerPhone: '472 174 3322',
    customerAddress: 'Calle Jardín del Trabajo #8, Fracc. Los Espárragos, Silao, Gto.',
    deliveryColonia: 'Fracc. Los Espárragos',
    deliveryType: 'domicilio',
    paymentMethod: 'contra_entrega',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 2,
    merchantsNames: [
      'Veterinaria & PetShop Huellitas Silao',
      'Depósito & Cervecería Fría El Bajío'
    ],
    items: [
      {
        product: getProd('prod-silao-mascotas-03'), // Shampoo Antipulgas
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 145.00,
      },
      {
        product: getProd('prod-silao-cerveceria-02'), // Six Modelo Especial
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 145.00,
      }
    ],
    subtotal: 435.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 463.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-214',
    trackingStatus: 'en_recoleccion',
    driverId: 'drv-3',
    courierName: 'Miguel Ángel Torres (El Güero)',
    courierPhone: '4721287711',
    courierVehicle: 'Yamaha YBR 125 - GTO-502C (Hielera activa ❄️)',
    assignedAt: getDateForToday(15, 25),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-214',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(15, 10),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Miguel Ángel Torres en camino a Cervecería El Bajío',
        timestamp: getDateForToday(15, 30),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-215',
    date: getDateForToday(15, 35),
    scheduledTime: '17:30',
    customerName: 'Ing. Ramón Estrada',
    customerPhone: '472 188 9012',
    customerAddress: 'Calle Ferrocarril #55, Col. Tierra y Libertad, Silao, Gto.',
    deliveryColonia: 'Col. Tierra y Libertad',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'Ferretería y Tlapalería El Tornillo',
      'Refaccionaria Automotriz El Güero'
    ],
    items: [
      {
        product: getProd('prod-silao-ferreteria-07'), // Cinta Aislar 3M
        quantity: 3,
        appliedTier: 'comercial',
        unitPrice: 22.00,
      },
      {
        product: getProd('prod-silao-refacciones-05'), // Focos Halógeno H4
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 95.00,
      }
    ],
    subtotal: 256.00,
    discountSavings: 0,
    deliveryFee: 31.00,
    total: 287.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-215',
    trackingStatus: 'en_recoleccion',
    driverId: 'drv-4',
    courierName: 'Brenda Salazar (Suzuki Isotérmica)',
    courierPhone: '4721445588',
    courierVehicle: 'Suzuki AX100 - GTO-714D (Caja isotérmica)',
    assignedAt: getDateForToday(15, 50),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-215',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(15, 35),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Brenda Salazar recolectando piezas automotrices y ferreteras',
        timestamp: getDateForToday(15, 55),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-216',
    date: getDateForToday(16, 15),
    scheduledTime: '18:00',
    customerName: 'Sra. Carmen Trujillo',
    customerPhone: '472 109 4433',
    customerAddress: 'Calle Álvaro Obregón #72, Silao Centro, Silao, Gto.',
    deliveryColonia: 'Silao Centro',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 2,
    merchantsNames: [
      'Abarrotes y Cremería La Providencia',
      'Paletería y Helados La Michoacana Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-abarrotes-09'), // Mantequilla Gloria
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 26.00,
      },
      {
        product: getProd('prod-silao-abarrotes-08'), // Requesón Fresco
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 42.00,
      },
      {
        product: getProd('prod-silao-cadena-fria-02'), // Paleta Mango Chile
        quantity: 3,
        appliedTier: 'comercial',
        unitPrice: 24.00,
      }
    ],
    subtotal: 166.00,
    discountSavings: 0,
    deliveryFee: 31.00,
    total: 197.00,
    status: 'completado',
    trackingCode: 'SLO-TRK-216',
    trackingStatus: 'en_recoleccion',
    driverId: 'drv-1',
    courierName: 'Carlos Méndez (Italika FT150 Roja)',
    courierPhone: '4721019944',
    courierVehicle: 'Italika FT150 - GTO-884A (Caja térmica roja)',
    assignedAt: getDateForToday(16, 30),
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-216',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central',
        timestamp: getDateForToday(16, 15),
        completed: true,
      },
      {
        status: 'en_recoleccion',
        title: 'Recolectando en Comercios',
        description: 'Carlos Méndez en recolección en Paletería La Michoacana',
        timestamp: getDateForToday(16, 35),
        completed: true,
      }
    ]
  },

  // =========================================================================
  // BLOQUE 5: RECIBIDOS EN HUB (4 PEDIDOS PENDIENTES DE ASIGNAR DRIVER)
  // =========================================================================
  {
    id: 'ORD-SLO-217',
    date: getDateForToday(16, 50),
    scheduledTime: '18:30',
    customerName: 'Lic. Gerardo Fonseca',
    customerPhone: '472 125 6678',
    customerAddress: 'Fracc. Valle de San José, Calle San Pedro #19, Silao, Gto.',
    deliveryColonia: 'Col. Valles de San José',
    deliveryType: 'domicilio',
    paymentMethod: 'tarjeta',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 2,
    merchantsNames: [
      'MARET SILAO',
      'Farmacia & Botica San Juan Silao'
    ],
    items: [
      {
        product: getProd('prod-silao-maret-silao-04'), // Camisa Caballero Algodón
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 350.00,
      },
      {
        product: getProd('prod-silao-farmacia-08'), // Complejo B
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 120.00,
      }
    ],
    subtotal: 470.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 498.00,
    status: 'pendiente',
    trackingCode: 'SLO-TRK-217',
    trackingStatus: 'recibido',
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-217',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central Calle 5 de Mayo #45, esperando asignación de driver',
        timestamp: getDateForToday(16, 50),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-218',
    date: getDateForToday(17, 25),
    scheduledTime: '19:00',
    customerName: 'Srita. Daniela Ibarra',
    customerPhone: '472 153 8899',
    customerAddress: 'Calle Benito Juárez #118, Silao Centro, Silao, Gto.',
    deliveryColonia: 'Silao Centro',
    deliveryType: 'domicilio',
    paymentMethod: 'transferencia',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 3,
    merchantsNames: [
      'Florería Rosa de Oro Silao',
      'Paletería y Helados La Michoacana Silao',
      'MARET SILAO'
    ],
    items: [
      {
        product: getProd('prod-silao-flores-04'), // Tulipanes
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 390.00,
      },
      {
        product: getProd('prod-silao-cadena-fria-06'), // Nieve 1L
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 95.00,
      },
      {
        product: getProd('prod-silao-maret-silao-06'), // Cinturón Piel
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 180.00,
      }
    ],
    subtotal: 665.00,
    discountSavings: 0,
    deliveryFee: 34.00,
    total: 699.00,
    status: 'pendiente',
    trackingCode: 'SLO-TRK-218',
    trackingStatus: 'recibido',
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-218',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central. Requiere hielera para nieve.',
        timestamp: getDateForToday(17, 25),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-219',
    date: getDateForToday(18, 10),
    scheduledTime: '19:30',
    customerName: 'Don Aurelio Carmona',
    customerPhone: '472 137 0012',
    customerAddress: 'Calle San Antonio #90, Col. Sopeña, Silao, Gto.',
    deliveryColonia: 'Col. Sopeña',
    deliveryType: 'domicilio',
    paymentMethod: 'contra_entrega',
    appliedTier: 'comercial',
    hasColdChain: true,
    merchantsCount: 2,
    merchantsNames: [
      'Depósito & Cervecería Fría El Bajío',
      'Abarrotes y Cremería La Providencia'
    ],
    items: [
      {
        product: getProd('prod-silao-cerveceria-04'), // Cartón Victoria
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 380.00,
      },
      {
        product: getProd('prod-silao-abarrotes-18'), // Totopos Maíz
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 32.00,
      }
    ],
    subtotal: 444.00,
    discountSavings: 0,
    deliveryFee: 28.00,
    total: 472.00,
    status: 'pendiente',
    trackingCode: 'SLO-TRK-219',
    trackingStatus: 'recibido',
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-219',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central, listo para programar recolección previa',
        timestamp: getDateForToday(18, 10),
        completed: true,
      }
    ]
  },
  {
    id: 'ORD-SLO-220',
    date: getDateForToday(18, 45),
    scheduledTime: '20:00',
    customerName: 'Sra. Teresa Gasca',
    customerPhone: '472 182 6650',
    customerAddress: 'Calle Honda #25, Silao Centro, Silao, Gto.',
    deliveryColonia: 'Silao Centro',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    appliedTier: 'comercial',
    hasColdChain: false,
    merchantsCount: 3,
    merchantsNames: [
      'Farmacia & Botica San Juan Silao',
      'Veterinaria & PetShop Huellitas Silao',
      'Ferretería y Tlapalería El Tornillo'
    ],
    items: [
      {
        product: getProd('prod-silao-farmacia-10'), // Termómetro Digital
        quantity: 1,
        appliedTier: 'comercial',
        unitPrice: 110.00,
      },
      {
        product: getProd('prod-silao-mascotas-05'), // Premios Snacks Gato
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 36.00,
      },
      {
        product: getProd('prod-silao-ferreteria-09'), // Teflón
        quantity: 2,
        appliedTier: 'comercial',
        unitPrice: 14.00,
      }
    ],
    subtotal: 210.00,
    discountSavings: 0,
    deliveryFee: 34.00,
    total: 244.00,
    status: 'pendiente',
    trackingCode: 'SLO-TRK-220',
    trackingStatus: 'recibido',
    qrData: 'https://silaomarket.onrender.com/?rastreo=SLO-TRK-220',
    timeline: [
      {
        status: 'recibido',
        title: 'Pedido Recibido en Hub Silao',
        description: 'Registrado en Hub Central 5 de Mayo #45, último turno del día (8:00 PM)',
        timestamp: getDateForToday(18, 45),
        completed: true,
      }
    ]
  }
];
