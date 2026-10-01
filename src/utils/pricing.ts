import { Product, Merchant, PriceTier } from '../types/inventory';

export interface ProductPriceCalculation {
  unitPrice: number;
  appliedTier: PriceTier;
  isDeclaredOffer: boolean;
  
  // Mayoreo
  storeOffersWholesale: boolean;
  productOffersWholesale: boolean;
  wholesaleMinPieces: number;
  wholesaleActive: boolean;
  wholesalePrice: number;
  piecesNeededForWholesale: number;
  
  // Promociones
  storeOffersPromos: boolean;
  promoMinPieces: number;
  promoActive: boolean;
  promoPrice: number;
  piecesNeededForPromo: number;
  
  // Totales y ahorros
  commercialPrice: number;
  savingsPerUnit: number;
  totalSavings: number;
  totalPrice: number;
  badgeLabel: string;
  explanation: string;
}

/**
 * Motor central de precios para SilaoMarket:
 * 1. El estándar inicial es PRECIO COMERCIAL para todos los clientes y comercios.
 * 2. EXCEPCIÓN: Ofertas ya declaradas (folletos de supermercados, promociones directas oficiales) aplican desde 1 pieza.
 * 3. Precios a mayoreo son OPCIONALES para cada tienda y aplican exclusivamente si se alcanza el número mínimo de piezas.
 * 4. Promociones especiales son OPCIONALES para cada tienda y aplican según sus condiciones y piezas mínimas.
 */
export function calculateEffectiveProductPrice(
  product: Product,
  merchant?: Merchant | null,
  quantity: number = 1
): ProductPriceCalculation {
  const safeQty = Math.max(1, Math.floor(quantity || 1));
  const commercialPrice = Number(product.commercialPrice) || 0;
  const wholesalePrice = Number(product.wholesalePrice) > 0 ? Number(product.wholesalePrice) : commercialPrice;
  const promoPrice = Number(product.promoPrice) > 0 ? Number(product.promoPrice) : commercialPrice;

  // 1. Detección de OFERTA YA DECLARADA
  // Aplica directo desde 1 pieza si:
  // - Está explícitamente marcada como isOfferDeclared
  // - Pertenece al folleto oficial de supermercados de Silao (Bodega Aurrera, Soriana, Tiendas 3B, Super Bara)
  // - O tiene un promoPrice menor al comercial y la tienda tiene ofertas declaradas con minPieces <= 1
  const isSupermarketOffer = 
    product.category === 'Supermercados y Ofertas' || 
    product.merchantCategory === 'Supermercados y Ofertas' ||
    Boolean(product.merchantId?.includes('aurrera') || product.merchantId?.includes('soriana') || product.merchantId?.includes('tiendas-3b') || product.merchantId?.includes('super-bara'));

  const isDeclaredOffer = Boolean(
    product.isOfferDeclared || 
    (isSupermarketOffer && promoPrice < commercialPrice)
  );

  // 2. Mayoreo Opcional por Tienda
  // Si la tienda define hasWholesale, se respeta estrictamente. Si no está definido en el comercio, se verifica el producto o default false si es servicio/farmacia.
  const storeOffersWholesale = merchant?.hasWholesale !== undefined 
    ? Boolean(merchant.hasWholesale)
    : Boolean(product.hasWholesale !== undefined ? product.hasWholesale : false);

  const productOffersWholesale = 
    storeOffersWholesale && 
    product.hasWholesale !== false && 
    wholesalePrice > 0 && 
    wholesalePrice < commercialPrice;

  const wholesaleMinPieces = 
    product.wholesaleMinPieces || 
    merchant?.wholesaleMinPieces || 
    3;

  const wholesaleActive = 
    !isDeclaredOffer && 
    productOffersWholesale && 
    safeQty >= wholesaleMinPieces;

  const piecesNeededForWholesale = 
    productOffersWholesale && safeQty < wholesaleMinPieces 
      ? wholesaleMinPieces - safeQty 
      : 0;

  // 3. Promociones Especiales Opcionales por Tienda
  const storeOffersPromos = merchant?.hasSpecialPromos !== undefined
    ? Boolean(merchant.hasSpecialPromos)
    : Boolean(product.hasSpecialPromos !== undefined ? product.hasSpecialPromos : isDeclaredOffer);

  const promoMinPieces = 
    product.promoMinPieces || 
    merchant?.promoMinPieces || 
    (isDeclaredOffer ? 1 : 2);

  const promoActive = 
    !isDeclaredOffer && 
    storeOffersPromos && 
    product.hasSpecialPromos !== false && 
    promoPrice > 0 && 
    promoPrice < commercialPrice && 
    safeQty >= promoMinPieces;

  const piecesNeededForPromo = 
    storeOffersPromos && promoPrice < commercialPrice && safeQty < promoMinPieces
      ? promoMinPieces - safeQty
      : 0;

  // 4. Determinación del Precio Unitario y Tier Aplicado
  let unitPrice = commercialPrice;
  let appliedTier: PriceTier = 'comercial';
  let badgeLabel = 'Precio Comercial';
  let explanation = 'PVP Estándar de la tienda';

  if (isDeclaredOffer) {
    unitPrice = promoPrice;
    appliedTier = 'promocion';
    badgeLabel = '🏷️ Oferta Declarada';
    explanation = `Oferta vigente de folleto (Aplica desde 1 pieza)`;
  } else if (wholesaleActive) {
    unitPrice = wholesalePrice;
    appliedTier = 'mayorista';
    badgeLabel = `📦 Mayoreo (${safeQty} pzas)`;
    explanation = `Precio Mayorista aplicado por comprar ${safeQty} pzas (Mínimo: ${wholesaleMinPieces} pzas)`;
  } else if (promoActive) {
    unitPrice = promoPrice;
    appliedTier = 'promocion';
    badgeLabel = `⚡ Promo Especial (${safeQty} pzas)`;
    explanation = `Promoción especial por volumen (Mínimo: ${promoMinPieces} pzas)`;
  } else {
    // Estándar Comercial inicial para todos
    unitPrice = commercialPrice;
    appliedTier = 'comercial';
    if (productOffersWholesale) {
      explanation = `Precio Comercial estándar. ¡Mayoreo a $${wholesalePrice.toFixed(2)} a partir de ${wholesaleMinPieces} piezas!`;
    } else {
      explanation = `Precio Comercial estándar de ${merchant?.name || product.merchantName || 'la tienda'}.`;
    }
  }

  const savingsPerUnit = Math.max(0, commercialPrice - unitPrice);
  const totalSavings = savingsPerUnit * safeQty;
  const totalPrice = unitPrice * safeQty;

  return {
    unitPrice,
    appliedTier,
    isDeclaredOffer,
    storeOffersWholesale,
    productOffersWholesale,
    wholesaleMinPieces,
    wholesaleActive,
    wholesalePrice,
    piecesNeededForWholesale,
    storeOffersPromos,
    promoMinPieces,
    promoActive,
    promoPrice,
    piecesNeededForPromo,
    commercialPrice,
    savingsPerUnit,
    totalSavings,
    totalPrice,
    badgeLabel,
    explanation,
  };
}
