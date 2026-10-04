import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Edit3, Snowflake, Store, Tag, Package } from 'lucide-react';
import { Product } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { ProductVisual } from './ProductVisual';
import { calculateEffectiveProductPrice } from '../utils/pricing';
import { checkMerchantOperatingStatus } from '../utils/operatingHours';

interface ProductCardProps {
  product: Product;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    merchants,
    addToCart, 
    setSelectedProductForQuickView,
    openProductModal,
    cart,
    userRole,
    loggedMerchantId
  } = useInventory();

  const [isAddedRecently, setIsAddedRecently] = useState(false);

  // Cart quantity check
  const inCartItem = cart.find((item) => item.product.id === product.id);
  const qtyInCart = inCartItem ? inCartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = qtyInCart >= product.stock;

  // Merchant lookup and pricing calculation
  const merchant = merchants.find((m) => m.id === product.merchantId);
  const merchantScheduleStatus = checkMerchantOperatingStatus(merchant);
  const effectivePricing = calculateEffectiveProductPrice(
    product, 
    merchant, 
    qtyInCart > 0 ? qtyInCart : 1
  );

  const isDeclaredOffer = effectivePricing.isDeclaredOffer;
  const isWholesaleActiveInCart = qtyInCart >= effectivePricing.wholesaleMinPieces && effectivePricing.productOffersWholesale;
  const currentPrice = effectivePricing.unitPrice;
  const hasDiscount = isDeclaredOffer || isWholesaleActiveInCart;
  const discountPercent = effectivePricing.commercialPrice > 0 
    ? Math.round(((effectivePricing.commercialPrice - currentPrice) / effectivePricing.commercialPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (isOutOfStock || isMaxInCart) return;
    const success = addToCart(product, 1);
    if (success) {
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 1200);
    }
  };

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      
      {/* Product Image Slot */}
      <div className="relative p-2 bg-[#FBFBF9] cursor-pointer" onClick={() => setSelectedProductForQuickView(product)}>
        <ProductVisual product={product} size="md" />

        {/* Cold Chain Badge on Image */}
        {product.isColdChain && (
          <div className="absolute top-3 left-3 bg-cyan-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs">
            <Snowflake className="w-3 h-3" />
            <span>Cadena Fría</span>
          </div>
        )}

        {/* Quick View & Edit Overlay Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {(userRole === 'admin' || (userRole === 'negocio' && product.merchantId === loggedMerchantId)) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openProductModal(product);
              }}
              className="bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 p-2 rounded-lg shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
              title="Editar producto e imagen (Solo tú y administración)"
              aria-label="Editar producto"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductForQuickView(product);
            }}
            className="bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 p-2 rounded-lg shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
            title="Vista rápida del producto"
            aria-label="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content & Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Merchant tag and operating schedule */}
          <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
            <span 
              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md truncate max-w-[190px] flex items-center gap-1.5"
              title={`${product.merchantName} · Horario: ${merchantScheduleStatus.scheduleText}`}
            >
              {merchant?.logoUrl ? (
                <img 
                  src={merchant.logoUrl} 
                  alt={product.merchantName} 
                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-emerald-300" 
                />
              ) : (
                <Store className="w-3 h-3 text-emerald-600 shrink-0" />
              )}
              <span className="truncate">{product.merchantName || 'Comercio Silao'}</span>
            </span>

            {/* Operating status badge */}
            <span 
              title={`Horario de atención: ${merchantScheduleStatus.scheduleText}`}
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                merchantScheduleStatus.isOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : merchantScheduleStatus.isBeforeOpening
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {merchantScheduleStatus.isOpen 
                ? `Abierto · Cierra ${merchantScheduleStatus.closingTime12h}` 
                : `Abre ${merchantScheduleStatus.openingTime12h}`}
            </span>
          </div>

          {/* Badges de negocio independiente o que acompaña pedido */}
          {(merchant?.isPhysicalLocation === false || merchant?.canAccompanyOrders) && (
            <div className="flex items-center gap-1 mb-1.5 flex-wrap">
              {merchant?.isPhysicalLocation === false && (
                <span 
                  title="Servicio independiente o digital sin mostrador físico en Silao"
                  className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded"
                >
                  🏠 Sin local físico
                </span>
              )}
              {merchant?.canAccompanyOrders && (
                <span 
                  title="Este producto o trabajo viaja en tu entrega consolidada del Hub"
                  className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded"
                >
                  📦 Acompaña tu pedido
                </span>
              )}
              {(product.requiresCustomerFile || merchant?.requiresCustomerFile) && (
                <span 
                  title={product.fileInstructions || merchant?.fileRequirementsInstructions || 'Requiere que el cliente envíe foto o archivo para este servicio'}
                  className="text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded"
                >
                  📎 Requiere archivo/foto
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 
            onClick={() => setSelectedProductForQuickView(product)}
            className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Presentation detail & Category */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {product.presentation} · <span className="text-slate-400">{product.category}</span>
          </p>
        </div>

        {/* Price & Actions Area */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div className="min-w-0 pr-2">
            {/* Si es Oferta Declarada */}
            {isDeclaredOffer ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    ${effectivePricing.commercialPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                    Oferta -{discountPercent}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-rose-600 font-mono tabular-nums tracking-tight">
                    ${currentPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">MXN</span>
                </div>
                <span className="text-[10px] text-rose-700 font-semibold block truncate">
                  🏷️ Oferta declarada (1+ pza)
                </span>
              </div>
            ) : isWholesaleActiveInCart ? (
              /* Si el cliente ya tiene en carrito las piezas suficientes para mayoreo */
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    ${effectivePricing.commercialPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                    Mayoreo -{discountPercent}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-blue-700 font-mono tabular-nums tracking-tight">
                    ${currentPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">MXN</span>
                </div>
                <span className="text-[10px] text-blue-700 font-semibold block truncate">
                  🎉 Mayoreo activo ({qtyInCart} pzas)
                </span>
              </div>
            ) : (
              /* Estándar Inicial: PRECIO COMERCIAL PARA TODOS */
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                    ${effectivePricing.commercialPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">MXN</span>
                </div>
                {/* Mayoreo opcional por tienda con piezas mínimas */}
                {effectivePricing.productOffersWholesale ? (
                  <span 
                    className="text-[10px] text-blue-700 font-medium bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 px-1.5 py-0.5 rounded block truncate cursor-pointer transition-colors"
                    title={`Mayoreo de $${effectivePricing.wholesalePrice.toFixed(2)} a partir de ${effectivePricing.wholesaleMinPieces} piezas`}
                    onClick={() => setSelectedProductForQuickView(product)}
                  >
                    📦 Mayoreo: ${effectivePricing.wholesalePrice.toFixed(2)} (mín. {effectivePricing.wholesaleMinPieces} pzs)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 block">
                    Precio Comercial estándar
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isMaxInCart}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isMaxInCart
                ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-white hover:bg-emerald-700 shadow-xs active:scale-95'
            }`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Listo!</span>
              </>
            ) : isOutOfStock ? (
              <span>Agotado</span>
            ) : isMaxInCart ? (
              <span>En Carrito</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>

      </div>

    </article>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
