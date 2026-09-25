import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Edit3 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductVisual } from './ProductVisual';

export const ProductQuickView: React.FC = () => {
  const { 
    selectedProductForQuickView, 
    setSelectedProductForQuickView,
    priceTier,
    setPriceTier,
    addToCart,
    openProductModal,
    cart
  } = useInventory();

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!selectedProductForQuickView) return null;
  const product = selectedProductForQuickView;

  const inCart = cart.find((i) => i.product.id === product.id);
  const qtyInCart = inCart ? inCart.quantity : 0;
  const maxAvailableToAdd = Math.max(0, product.stock - qtyInCart);

  const getTierPrice = (tier: string) => {
    if (tier === 'mayorista') return product.wholesalePrice;
    if (tier === 'promocion') return product.promoPrice;
    return product.commercialPrice;
  };

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
          </div>
        </div>

        {/* Product Information & Contiguous Purchase Module Right Pane */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              {product.category}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>
            
            <p className="text-xs text-slate-500 mt-1">
              Presentación: <span className="font-medium text-slate-700">{product.presentation}</span>
            </p>

            {/* Description */}
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {product.description}
            </p>

            {/* All 3 Price Tiers Comparison Table */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Estructura de Precios Disponibles
              </span>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Comercial */}
                <button
                  type="button"
                  onClick={() => setPriceTier('comercial')}
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                    priceTier === 'comercial'
                      ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600'
                      : 'bg-white/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 block">Comercial</span>
                  <span className="text-sm font-bold text-slate-900 font-mono tabular-nums block">
                    ${product.commercialPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400">PVP Estándar</span>
                </button>

                {/* Mayorista -40% */}
                <button
                  type="button"
                  onClick={() => setPriceTier('mayorista')}
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                    priceTier === 'mayorista'
                      ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-1 ring-blue-600'
                      : 'bg-white/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-medium text-blue-700 block">Mayoreo (-40%)</span>
                  <span className="text-sm font-bold text-blue-900 font-mono tabular-nums block">
                    ${product.wholesalePrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium">Ahorras ${(product.commercialPrice - product.wholesalePrice).toFixed(2)}</span>
                </button>

                {/* Promoción -60% */}
                <button
                  type="button"
                  onClick={() => setPriceTier('promocion')}
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                    priceTier === 'promocion'
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                      : 'bg-white/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-medium text-emerald-700 block">Promo (-60%)</span>
                  <span className="text-sm font-bold text-emerald-900 font-mono tabular-nums block">
                    ${product.promoPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium">Ahorras ${(product.commercialPrice - product.promoPrice).toFixed(2)}</span>
                </button>
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
              <div className="flex items-center border border-slate-300 rounded-lg bg-white">
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
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-150 shadow-xs cursor-pointer ${
                  maxAvailableToAdd <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-blue-700 text-white'
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
                      Agregar {quantity} por ${(getTierPrice(priceTier) * quantity).toFixed(2)} MXN
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
