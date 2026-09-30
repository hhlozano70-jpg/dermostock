import { Order, StoreSettings } from '../types/inventory';

export interface OperatingHoursStatus {
  isOpen: boolean;
  currentHour: number;
  currentMinute: number;
  message: string;
  formattedRange: string;
  nextOpenTimeStr: string;
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
