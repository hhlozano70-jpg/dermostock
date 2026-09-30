import { Order, CartItem } from '../types/inventory';

export interface CollectionLeadTimeResult {
  minutes: number; // Siempre entre 60 y 120 minutos (1 a 2 horas)
  hoursFormatted: string; // ej. "1h 30m"
  hoursLabel: string; // ej. "1 hora y 30 minutos antes"
  breakdown: string; // Explicación de cálculo por tiendas y piezas
  pickupStartTime: Date; // Hora recomendada para arrancar recolección
  pickupStartTimeStr: string; // "12:30 PM"
  targetDeliveryTime: Date; // Hora estimada de entrega al cliente
  targetDeliveryTimeStr: string; // "02:00 PM"
  urgency: 'urgente' | 'proximo' | 'a_tiempo' | 'entregado';
  urgencyLabel: string;
  urgencyBadgeColor: string;
}

/**
 * Calcula el tiempo estimado de recolección previa (de 1 a 2 horas antes de la entrega)
 * con base en el número de productos y la cantidad de comercios a visitar en Silao.
 */
export function calculateCollectionLeadTime(
  orderOrData: {
    merchantsCount?: number;
    items?: CartItem[] | { quantity: number }[];
    hasColdChain?: boolean;
    date?: string | Date;
    scheduledTime?: string;
    trackingStatus?: string;
  }
): CollectionLeadTimeResult {
  const merchantsCount = Math.max(1, orderOrData.merchantsCount || 1);
  
  // Total de piezas físicas de producto
  const totalItemsQuantity = orderOrData.items && Array.isArray(orderOrData.items)
    ? orderOrData.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 1;

  const hasColdChain = Boolean(orderOrData.hasColdChain);

  // 1. Base mínima: 60 minutos (1 hora antes)
  const baseMinutes = 60;

  // 2. Tiempo adicional por comercios a visitar (+15 min por comercio extra a partir del 1ro)
  const extraMerchants = Math.max(0, merchantsCount - 1);
  const merchantExtraMinutes = Math.min(50, extraMerchants * 15);

  // 3. Tiempo adicional por volumen de productos (revisión de caducidad, empaque, lote)
  let productExtraMinutes = 0;
  if (totalItemsQuantity >= 15) {
    productExtraMinutes = 30;
  } else if (totalItemsQuantity >= 8) {
    productExtraMinutes = 20;
  } else if (totalItemsQuantity >= 4) {
    productExtraMinutes = 10;
  }

  // 4. Tiempo adicional si requiere preparación de cadena de frío (hielera con refrigerante)
  const coldChainExtra = hasColdChain ? 10 : 0;

  // 5. Total de minutos acotado estrictamente entre 60 min (1 hr) y 120 min (2 hrs)
  const calculatedMinutes = baseMinutes + merchantExtraMinutes + productExtraMinutes + coldChainExtra;
  const minutes = Math.min(120, Math.max(60, calculatedMinutes));

  // Formateo de texto legible
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hoursFormatted = m === 0 ? `${h}h` : `${h}h ${m}m`;
  const hoursLabel = m === 0 
    ? `${h} ${h === 1 ? 'hora' : 'horas'} antes`
    : `${h} hora${h > 1 ? 's' : ''} y ${m} minutos antes`;

  // Explicación de desglose para el operador y conductor
  const factors: string[] = ['1h base'];
  if (merchantExtraMinutes > 0) {
    factors.push(`+${merchantExtraMinutes}m por ${merchantsCount} negocios`);
  }
  if (productExtraMinutes > 0) {
    factors.push(`+${productExtraMinutes}m por ${totalItemsQuantity} piezas`);
  }
  if (coldChainExtra > 0) {
    factors.push(`+10m cadena de frío ❄️`);
  }
  const breakdown = factors.join(' ');

  // 6. Estimación de Horas (Hora de Inicio de Recolección y Hora de Entrega)
  const now = new Date();
  let baseOrderDate = orderOrData.date ? new Date(orderOrData.date) : new Date();
  if (isNaN(baseOrderDate.getTime())) {
    baseOrderDate = new Date();
  }

  // Determinar hora objetivo de entrega al cliente
  // Si el pedido es programado a las 8am o una hora específica:
  let targetDeliveryTime = new Date(baseOrderDate.getTime() + (minutes + 30) * 60000);
  
  if (orderOrData.scheduledTime && orderOrData.scheduledTime.includes(':')) {
    const parts = orderOrData.scheduledTime.match(/(\d{1,2}):(\d{2})/);
    if (parts) {
      const scheduledH = parseInt(parts[1], 10);
      const scheduledM = parseInt(parts[2], 10);
      const scheduledDate = new Date(baseOrderDate);
      scheduledDate.setHours(scheduledH, scheduledM, 0, 0);
      // Si la hora programada ya pasó hoy, considerarla
      targetDeliveryTime = scheduledDate;
    }
  }

  // La hora de inicio de recolección es targetDeliveryTime MENOS los minutos de recolección
  const pickupStartTime = new Date(targetDeliveryTime.getTime() - minutes * 60000);

  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const pickupStartTimeStr = pickupStartTime.toLocaleTimeString('es-MX', timeOptions);
  const targetDeliveryTimeStr = targetDeliveryTime.toLocaleTimeString('es-MX', timeOptions);

  // 7. Nivel de Urgencia en el Hub Silao
  const isDelivered = orderOrData.trackingStatus === 'entregado';
  let urgency: 'urgente' | 'proximo' | 'a_tiempo' | 'entregado' = 'a_tiempo';
  let urgencyLabel = 'A tiempo';
  let urgencyBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (isDelivered) {
    urgency = 'entregado';
    urgencyLabel = 'Entregado';
    urgencyBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  } else {
    const minutesUntilPickup = (pickupStartTime.getTime() - now.getTime()) / 60000;
    if (minutesUntilPickup <= 0) {
      urgency = 'urgente';
      urgencyLabel = '¡Recolectar ya en comercios!';
      urgencyBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-black';
    } else if (minutesUntilPickup <= 30) {
      urgency = 'proximo';
      urgencyLabel = `Iniciar en ~${Math.round(minutesUntilPickup)} min`;
      urgencyBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    } else {
      urgency = 'a_tiempo';
      urgencyLabel = `Recolección a las ${pickupStartTimeStr}`;
      urgencyBadgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  }

  return {
    minutes,
    hoursFormatted,
    hoursLabel,
    breakdown,
    pickupStartTime,
    pickupStartTimeStr,
    targetDeliveryTime,
    targetDeliveryTimeStr,
    urgency,
    urgencyLabel,
    urgencyBadgeColor,
  };
}
