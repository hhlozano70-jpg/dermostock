import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Edit3, ExternalLink, Sparkles, Tag, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductVisual } from './ProductVisual';
import { calculateEffectiveProductPrice } from '../utils/pricing';
import { checkMerchantOperatingStatus } from '../utils/operatingHours';

export const ProductQuickView: React.FC = () => {
  const { 
    selectedProductForQuickView, 
    setSelectedProductForQuickView,
    merchants,
    addToCart,
    openProductModal,
    cart,
    userRole,
    loggedMerchantId
  } = useInventory();

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!selectedProductForQuickView) return null;
  const product = selectedProductForQuickView;

  const merchant = merchants.find((m) => m.id === product.merchantId);
  const merchantScheduleStatus = checkMerchantOperatingStatus(merchant);
  const inCart = cart.find((i) => i.product.id === product.id);
  const qtyInCart = inCart ? inCart.quantity : 0;
  const maxAvailableToAdd = Math.max(0, product.stock - qtyInCart);

  // Dynamic pricing calculation based on selected quantity and merchant policy
  const pricing = calculateEffectiveProductPrice(product, merchant, quantity);

  const handleAddToCart = () => {
    if (maxAvailableToAdd <= 0) return;
    const qtyToAdd = Math.min(quantity, maxAvailableToAdd);
    const success = addToCart(product, qtyToAdd);
    if (success) {
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        setSelectedProductForQuickView(null);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForQuickView(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Presentation Left Pane */}
        <div className="md:w-1/2 p-6 bg-slate-50 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <ProductVisual product={product} size="detail" className="shadow-xs" />
          
          <div className="mt-4 w-full space-y-2">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 px-1">
              <span>SKU: <strong className="font-mono text-slate-700">{product.sku}</strong></span>
              <span>Marca: <strong className="text-slate-700">{product.brand}</strong></span>
            </div>

            {(userRole === 'admin' || (userRole === 'negocio' && product.merchantId === loggedMerchantId)) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForQuickView(null);
                  openProductModal(product);
                }}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Editar Datos o Cambiar Fotografía</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Information & Contiguous Purchase Module Right Pane */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            {/* Merchant and Category badge */}
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>🏪</span>
                <span>{product.merchantName || 'Comercio Silao'}</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Operating hours pill */}
                <span 
                  title={`Horario de servicio: ${merchantScheduleStatus.scheduleText}`}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    merchantScheduleStatus.isOpen
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : merchantScheduleStatus.isBeforeOpening
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  🕒 {merchantScheduleStatus.scheduleText} · {merchantScheduleStatus.statusLabel}
                </span>

                {product.isColdChain && (
                  <span className="text-xs font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-300 flex items-center gap-1">
                    <span>❄️</span>
                    <span>Cadena Fría</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {product.category}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>
            
            <p className="text-xs text-slate-500 mt-1">
              Presentación: <span className="font-medium text-slate-700">{product.presentation}</span>
              {product.merchantAddress && (
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  📍 Ubicación del negocio: {product.merchantAddress}
                </span>
              )}
            </p>

            {/* Description */}
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {product.description}
            </p>

            {/* Official Web / Brochure Reference Link */}
            {product.sourceUrl && (
              <div className="mt-2.5">
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver referencia web oficial en folleto digital ↗</span>
                </a>
              </div>
            )}

            {/* All 3 Price Tiers Comparison Table (Estructura de Precios por Tienda y Piezas) */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Estructura de Precios en {product.merchantName || 'esta tienda'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {pricing.isDeclaredOffer ? '🏷️ Oferta oficial declarada' : 'Estándar: Precio Comercial'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Comercial (Estándar inicial para todos) */}
                <div
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    pricing.appliedTier === 'comercial'
                      ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-600/30'
                      : 'bg-white/60 border-slate-200 opacity-75'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-600 block">Comercial (PVP)</span>
                  <span className="text-sm font-black text-slate-900 font-mono tabular-nums block">
                    ${product.commercialPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">Estándar inicial para todos</span>
                  {pricing.appliedTier === 'comercial' && (
                    <span className="mt-1 text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-bold block text-center">
                      Tarifa Actual
                    </span>
                  )}
                </div>

                {/* 2. Mayorista (Opcional para cada tienda, aplica con mínimo de piezas) */}
                <div
                  onClick={() => {
                    if (pricing.productOffersWholesale && quantity < pricing.wholesaleMinPieces) {
                      setQuantity(Math.min(maxAvailableToAdd, pricing.wholesaleMinPieces));
                    }
                  }}
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    !pricing.productOffersWholesale
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : pricing.wholesaleActive
                      ? 'bg-blue-50 border-blue-600 shadow-xs ring-2 ring-blue-600/30'
                      : 'bg-white/70 border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
                  }`}
                  title={
                    pricing.productOffersWholesale 
                      ? `Haz clic para fijar ${pricing.wholesaleMinPieces} piezas y activar mayoreo`
                      : 'Esta tienda no ofrece precios a mayoreo'
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 block">Mayoreo</span>
                    {pricing.productOffersWholesale && (
                      <span className="text-[8px] bg-blue-100 text-blue-800 px-1 rounded font-bold">
                        mín. {pricing.wholesaleMinPieces} pzs
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-black text-blue-900 font-mono tabular-nums block">
                    {pricing.productOffersWholesale ? `$${product.wholesalePrice.toFixed(2)}` : 'N/A'}
                  </span>
                  <span className="text-[9px] text-blue-700 font-medium block leading-tight">
                    {pricing.productOffersWholesale
                      ? pricing.wholesaleActive
                        ? `¡Activo! (-$${(product.commercialPrice - product.wholesalePrice).toFixed(2)} c/u)`
                        : `Lleva ${pricing.wholesaleMinPieces}+ pzas para activar`
                      : 'No aplica en esta tienda'}
                  </span>
                  {pricing.wholesaleActive && (
                    <span className="mt-1 text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold block text-center">
                      Mayoreo Aplicado
                    </span>
                  )}
                </div>

                {/* 3. Promoción / Oferta Declarada */}
                <div
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    pricing.isDeclaredOffer || pricing.promoActive
                      ? 'bg-rose-50 border-rose-500 shadow-xs ring-2 ring-rose-500/30'
                      : 'bg-white/60 border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-bold text-rose-800 block">
                    {pricing.isDeclaredOffer ? 'Oferta Declarada' : 'Promo Especial'}
                  </span>
                  <span className="text-sm font-black text-rose-700 font-mono tabular-nums block">
                    ${product.promoPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-rose-700 font-medium block leading-tight">
                    {pricing.isDeclaredOffer
                      ? 'Vigente desde 1 pieza'
                      : pricing.storeOffersPromos
                      ? `Mín. ${pricing.promoMinPieces} piezas`
                      : 'Sin promo activa'}
                  </span>
                  {(pricing.isDeclaredOffer || pricing.promoActive) && (
                    <span className="mt-1 text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold block text-center">
                      Oferta Activa
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Guidance Banner */}
              <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between gap-2">
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <span className="text-sm">
                    {pricing.isDeclaredOffer ? '🏷️' : pricing.wholesaleActive ? '🎉' : '💡'}
                  </span>
                  <span>{pricing.explanation}</span>
                </span>
                {pricing.totalSavings > 0 && (
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                    Ahorro: ${pricing.totalSavings.toFixed(2)} MXN
                  </span>
                )}
              </div>
            </div>

            {/* Stock Availability status */}
            <div className="mt-4 flex items-center justify-between text-xs py-2 px-3 bg-slate-100/70 rounded-lg">
              <span className="text-slate-600">Disponibilidad en almacén:</span>
              <span className="font-semibold font-mono text-slate-800">
                {product.stock > 0 ? `${product.stock} piezas físicas` : 'Sin inventario'}
              </span>
            </div>
          </div>

          {/* Purchase actions */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-base"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-bold font-mono text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxAvailableToAdd}
                  onClick={() => setQuantity((q) => Math.min(maxAvailableToAdd, q + 1))}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-base"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={maxAvailableToAdd <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-150 shadow-xs cursor-pointer ${
                  maxAvailableToAdd <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-emerald-700 text-white active:scale-98'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : maxAvailableToAdd <= 0 ? (
                  <span>Stock No Disponible</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Agregar {quantity} por ${pricing.totalPrice.toFixed(2)} MXN (${pricing.unitPrice.toFixed(2)} c/u)
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Trust cues */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Garantía de originalidad 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Envíos locales y nacionales</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
