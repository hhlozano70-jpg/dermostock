export interface DeliveryFeeCalculation {
  fee: number;
  baseFee: number;
  merchantsCount: number;
  merchantExtra: number;
  itemsCount: number;
  volumeExtra: number;
  description: string;
}

/**
 * Calcula el costo de envío consolidado en Silao (ajuste dinámico de $25 a $40 pesos).
 * Variables:
 * 1. Cantidad de comercios/negocios distintos (más paradas de recolección para el repartidor del Hub).
 * 2. Cantidad total de productos / piezas (peso y volumen de paquetes).
 * 
 * Regla: Mínimo $25.00, Máximo $40.00 pesos.
 */
export function calculateDynamicDeliveryFee(
  totalItemsCount: number,
  merchantsCount: number
): DeliveryFeeCalculation {
  const baseFee = 25;

  if (merchantsCount <= 0 || totalItemsCount <= 0) {
    return {
      fee: 25,
      baseFee: 25,
      merchantsCount: Math.max(1, merchantsCount),
      merchantExtra: 0,
      itemsCount: Math.max(1, totalItemsCount),
      volumeExtra: 0,
      description: 'Tarifa base: $25.00'
    };
  }

  // Costo por comercios adicionales (paradas de recolección del Hub en Silao):
  // 1 comercio: +$0
  // 2 comercios: +$5
  // 3 comercios: +$9
  // 4+ comercios: +$12
  let merchantExtra = 0;
  if (merchantsCount === 2) {
    merchantExtra = 5;
  } else if (merchantsCount === 3) {
    merchantExtra = 9;
  } else if (merchantsCount >= 4) {
    merchantExtra = 12;
  }

  // Costo por volumen / cantidad de artículos:
  // 1 a 3 piezas: +$0
  // 4 a 6 piezas: +$3
  // 7 a 10 piezas: +$6
  // 11 o más piezas: +$8
  let volumeExtra = 0;
  if (totalItemsCount >= 11) {
    volumeExtra = 8;
  } else if (totalItemsCount >= 7) {
    volumeExtra = 6;
  } else if (totalItemsCount >= 4) {
    volumeExtra = 3;
  }

  const rawFee = baseFee + merchantExtra + volumeExtra;
  // Limitar estrictamente entre $25 y $40 pesos
  const fee = Math.min(40, Math.max(25, rawFee));

  let description = `$25 base`;
  if (merchantExtra > 0) {
    description += ` + $${merchantExtra} (${merchantsCount} comercios)`;
  }
  if (volumeExtra > 0) {
    description += ` + $${volumeExtra} (${totalItemsCount} arts)`;
  }
  if (rawFee > 40) {
    description += ` (tope $40)`;
  }

  return {
    fee,
    baseFee,
    merchantsCount,
    merchantExtra,
    itemsCount: totalItemsCount,
    volumeExtra,
    description
  };
}
