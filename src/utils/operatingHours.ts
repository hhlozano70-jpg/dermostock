import { Order, StoreSettings, Merchant, CartItem } from '../types/inventory';

export interface OperatingHoursStatus {
  isOpen: boolean;
  currentHour: number;
  currentMinute: number;
  message: string;
  formattedRange: string;
  nextOpenTimeStr: string;
}

/**
 * Formatea una hora en formato HH:mm (24h) a formato legible 12h (ej. "8:30 AM", "1:00 PM").
 */
export function formatTime12h(timeStr?: string | number | null): string {
  if (!timeStr) return '8:00 AM';
  const str = String(timeStr);
  const parts = str.split(':');
  const h = parseInt(parts[0] || '8', 10);
  const m = parseInt(parts[1] || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mStr = (isNaN(m) ? 0 : m).toString().padStart(2, '0');
  return `${isNaN(h12) ? 8 : h12}:${mStr} ${period}`;
}

export interface MerchantOperatingStatus {
  isOpen: boolean;
  isBeforeOpening: boolean;
  isAfterClosing: boolean;
  openingTime: string;
  closingTime: string;
  openingTime12h: string;
  closingTime12h: string;
  scheduleText: string;
  statusLabel: string;
  statusColor: 'green' | 'amber' | 'slate';
  minutesUntilOpening: number;
}

/**
 * Evalúa el horario de servicio específico de un negocio individual.
 */
export function checkMerchantOperatingStatus(
  merchant?: Partial<Merchant> | null,
  customNow?: Date
): MerchantOperatingStatus {
  const openingTime = typeof merchant?.openingTime === 'string' ? merchant.openingTime : '08:00';
  const closingTime = typeof merchant?.closingTime === 'string' ? merchant.closingTime : '20:00';

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  const now = customNow || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = (openH || 8) * 60 + (openM || 0);
  const closeMinutes = (closeH || 20) * 60 + (closeM || 0);

  const isBeforeOpening = currentMinutes < openMinutes;
  const isAfterClosing = currentMinutes >= closeMinutes;
  const isOpen = !isBeforeOpening && !isAfterClosing;

  const openingTime12h = formatTime12h(openingTime);
  const closingTime12h = formatTime12h(closingTime);
  const scheduleText = `${openingTime12h} - ${closingTime12h}`;

  let statusLabel = 'Abierto';
  let statusColor: 'green' | 'amber' | 'slate' = 'green';
  let minutesUntilOpening = 0;

  if (isBeforeOpening) {
    statusLabel = `Aún no abre · Abre ${openingTime12h}`;
    statusColor = 'amber';
    minutesUntilOpening = openMinutes - currentMinutes;
  } else if (isAfterClosing) {
    statusLabel = `Cerrado · Abre mañana ${openingTime12h}`;
    statusColor = 'slate';
  } else {
    statusLabel = `Abierto hasta ${closingTime12h}`;
    statusColor = 'green';
  }

  return {
    isOpen,
    isBeforeOpening,
    isAfterClosing,
    openingTime,
    closingTime,
    openingTime12h,
    closingTime12h,
    scheduleText,
    statusLabel,
    statusColor,
    minutesUntilOpening,
  };
}

export interface EarlyOrClosedMerchantDetail {
  merchantId: string;
  merchantName: string;
  isBeforeOpening: boolean;
  isAfterClosing: boolean;
  openingTime: string;
  closingTime: string;
  openingTime12h: string;
  closingTime12h: string;
  minutesUntilOpening: number;
  itemsCount: number;
  productNames: string[];
}

export interface CartMerchantsScheduleValidation {
  canProceedToCheckout: boolean;
  hasEarlyMerchants: boolean;
  hasClosedMerchants: boolean;
  earlyMerchants: EarlyOrClosedMerchantDetail[];
  closedMerchants: EarlyOrClosedMerchantDetail[];
  latestOpeningTime12h: string;
  restrictionReason?: string;
}

/**
 * Valida si todos los negocios involucrados en el carrito están actualmente abiertos
 * y coloca la restricción si el pedido se intenta realizar tan temprano cuando algún comercio aún no abre.
 */
export function validateCartMerchantsSchedule(
  cart: CartItem[],
  merchants: Merchant[],
  customNow?: Date
): CartMerchantsScheduleValidation {
  if (!cart || cart.length === 0) {
    return {
      canProceedToCheckout: true,
      hasEarlyMerchants: false,
      hasClosedMerchants: false,
      earlyMerchants: [],
      closedMerchants: [],
      latestOpeningTime12h: '8:00 AM',
    };
  }

  // Agrupar items por comercio
  const merchantMap = new Map<string, { merchant: Merchant; items: CartItem[] }>();

  cart.forEach(item => {
    const mId = item.product.merchantId || item.product.merchantName;
    if (!merchantMap.has(mId)) {
      const found = merchants.find(m => m.id === item.product.merchantId || m.name === item.product.merchantName);
      const fallbackMerchant: Merchant = found || {
        id: item.product.merchantId || 'm-gen',
        name: item.product.merchantName || 'Comercio Silao',
        category: item.product.merchantCategory || 'Comercio Local',
        address: item.product.merchantAddress || 'Silao, Gto.',
        silaoZone: 'Silao Centro',
        rating: 4.8,
        reviewsCount: 10,
        badge: 'Local',
        iconName: 'Store',
        description: '',
        openingTime: '08:00',
        closingTime: '20:00',
      };
      merchantMap.set(mId, { merchant: fallbackMerchant, items: [] });
    }
    merchantMap.get(mId)!.items.push(item);
  });

  const earlyMerchants: EarlyOrClosedMerchantDetail[] = [];
  const closedMerchants: EarlyOrClosedMerchantDetail[] = [];
  let latestOpenMinutes = 0;
  let latestOpeningTimeStr = '08:00';

  merchantMap.forEach(({ merchant, items }) => {
    const status = checkMerchantOperatingStatus(merchant, customNow);
    const itemsCount = items.reduce((acc, i) => acc + i.quantity, 0);
    const productNames = items.map(i => i.product.name);

    const [h, m] = status.openingTime.split(':').map(Number);
    const openMin = (h || 8) * 60 + (m || 0);
    if (openMin > latestOpenMinutes) {
      latestOpenMinutes = openMin;
      latestOpeningTimeStr = status.openingTime;
    }

    if (status.isBeforeOpening) {
      earlyMerchants.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        isBeforeOpening: true,
        isAfterClosing: false,
        openingTime: status.openingTime,
        closingTime: status.closingTime,
        openingTime12h: status.openingTime12h,
        closingTime12h: status.closingTime12h,
        minutesUntilOpening: status.minutesUntilOpening,
        itemsCount,
        productNames,
      });
    } else if (status.isAfterClosing) {
      closedMerchants.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        isBeforeOpening: false,
        isAfterClosing: true,
        openingTime: status.openingTime,
        closingTime: status.closingTime,
        openingTime12h: status.openingTime12h,
        closingTime12h: status.closingTime12h,
        minutesUntilOpening: 0,
        itemsCount,
        productNames,
      });
    }
  });

  const hasEarlyMerchants = earlyMerchants.length > 0;
  const hasClosedMerchants = closedMerchants.length > 0;
  const canProceedToCheckout = !hasEarlyMerchants && !hasClosedMerchants;

  let restrictionReason = '';
  if (hasEarlyMerchants) {
    const names = earlyMerchants.map(m => `"${m.merchantName}" (abre a las ${m.openingTime12h})`).join(', ');
    restrictionReason = `Restricción de horario: No se pueden solicitar pedidos tan temprano a ${names} porque el negocio aún no ha abierto sus puertas. Espera a su horario de apertura (${formatTime12h(latestOpeningTimeStr)}) o retira sus productos del carrito.`;
  } else if (hasClosedMerchants) {
    const names = closedMerchants.map(m => `"${m.merchantName}"`).join(', ');
    restrictionReason = `Restricción de horario: ${names} ya cerró por el día de hoy.`;
  }

  return {
    canProceedToCheckout,
    hasEarlyMerchants,
    hasClosedMerchants,
    earlyMerchants,
    closedMerchants,
    latestOpeningTime12h: formatTime12h(latestOpeningTimeStr),
    restrictionReason,
  };
}

export interface HourCapacityStatus {
  isSaturated: boolean;
  currentHourOrders: number;
  maxAllowed: number;
  remainingSlots: number;
  saturationPercentage: number;
  message: string;
}

export interface HourlySlotStat {
  slot: string; // ej. "08:00 - 10:00"
  label: string; // ej. "8am - 10am"
  orderCount: number;
  deliveredCount: number;
  inTransitCount: number;
  pendingCount: number;
  capacityMax: number;
  avgItems: number;
}

/**
 * Valida si la hora actual está dentro del horario comercial de Silao (8:00 AM a 8:00 PM).
 */
export function checkOperatingHours(settings?: Partial<StoreSettings>): OperatingHoursStatus {
  const startStr = settings?.orderStartTime || '08:00';
  const endStr = settings?.orderEndTime || '20:00';

  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutesFromMidnight = currentHour * 60 + currentMinute;

  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  const isOpen = currentMinutesFromMidnight >= startMinutes && currentMinutesFromMidnight < endMinutes;

  const formattedRange = '8:00 AM a 8:00 PM';
  let nextOpenTimeStr = 'Hoy a las 8:00 AM';
  let message = '🟢 Hub Silao abierto para pedidos en ruta';

  if (!isOpen) {
    if (currentMinutesFromMidnight < startMinutes) {
      nextOpenTimeStr = 'Hoy a las 8:00 AM';
      message = '⏰ Pedidos abren a las 8:00 AM. Puedes programar tu pedido.';
    } else {
      nextOpenTimeStr = 'Mañana a las 8:00 AM';
      message = '🌙 Servicio cerrado por hoy (8:00 PM). Puedes programar para mañana a las 8:00 AM.';
    }
  }

  return {
    isOpen,
    currentHour,
    currentMinute,
    message,
    formattedRange,
    nextOpenTimeStr,
  };
}

/**
 * Valida la capacidad de envíos por hora para evitar saturación del Hub de Silao.
 */
export function checkHourCapacity(
  orders: Order[],
  maxPerHour = 12
): HourCapacityStatus {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const currentHour = now.getHours();

  // Contar órdenes creadas hoy en la misma hora
  const currentHourOrders = orders.filter((order) => {
    try {
      const orderDate = new Date(order.date);
      return (
        orderDate.getFullYear() === currentYear &&
        orderDate.getMonth() === currentMonth &&
        orderDate.getDate() === currentDate &&
        orderDate.getHours() === currentHour
      );
    } catch {
      return false;
    }
  }).length;

  const maxAllowed = maxPerHour > 0 ? maxPerHour : 12;
  const isSaturated = currentHourOrders >= maxAllowed;
  const remainingSlots = Math.max(0, maxAllowed - currentHourOrders);
  const saturationPercentage = Math.min(100, Math.round((currentHourOrders / maxAllowed) * 100));

  let message = `Capacidad actual: ${currentHourOrders}/${maxAllowed} envíos en esta hora (${remainingSlots} disponibles)`;
  if (isSaturated) {
    message = `⚠️ Franja de ${currentHour}:00h saturada (${currentHourOrders}/${maxAllowed} envíos). Se programará para el siguiente turno.`;
  }

  return {
    isSaturated,
    currentHourOrders,
    maxAllowed,
    remainingSlots,
    saturationPercentage,
    message,
  };
}

/**
 * Genera la distribución de pedidos en los bloques de 8:00 AM a 8:00 PM para gráficas.
 */
export function getOperatingHoursDistribution(
  orders: Order[],
  capacityPerHour = 12
): HourlySlotStat[] {
  const slots = [
    { slot: '08:00 - 10:00', label: '8am - 10am', startH: 8, endH: 10 },
    { slot: '10:00 - 12:00', label: '10am - 12pm', startH: 10, endH: 12 },
    { slot: '12:00 - 14:00', label: '12pm - 2pm', startH: 12, endH: 14 },
    { slot: '14:00 - 16:00', label: '2pm - 4pm', startH: 14, endH: 16 },
    { slot: '16:00 - 18:00', label: '4pm - 6pm', startH: 16, endH: 18 },
    { slot: '18:00 - 20:00', label: '6pm - 8pm', startH: 18, endH: 20 },
  ];

  const now = new Date();

  return slots.map((s) => {
    const slotOrders = orders.filter((o) => {
      try {
        const d = new Date(o.date);
        const h = d.getHours();
        return h >= s.startH && h < s.endH;
      } catch {
        return false;
      }
    });

    const delivered = slotOrders.filter((o) => o.trackingStatus === 'entregado' || o.status === 'entregado').length;
    const inTransit = slotOrders.filter((o) => o.trackingStatus === 'en_camino').length;
    const pending = slotOrders.length - delivered - inTransit;

    const totalItems = slotOrders.reduce((sum, o) => {
      const itemsCount = o.items ? o.items.reduce((acc, i) => acc + i.quantity, 0) : 0;
      return sum + itemsCount;
    }, 0);

    const avgItems = slotOrders.length > 0 ? Math.round((totalItems / slotOrders.length) * 10) / 10 : 0;

    return {
      slot: s.slot,
      label: s.label,
      orderCount: slotOrders.length,
      deliveredCount: delivered,
      inTransitCount: inTransit,
      pendingCount: pending,
      capacityMax: capacityPerHour * 2, // 2 horas por slot
      avgItems,
    };
  });
}
