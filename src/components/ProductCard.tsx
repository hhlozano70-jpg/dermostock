import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Edit3 } from 'lucide-react';
import { Product } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { ProductVisual } from './ProductVisual';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    priceTier, 
    addToCart, 
    setSelectedProductForQuickView,
    openProductModal,
    cart
  } = useInventory();

  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const getPrice = () => {
    switch (priceTier) {
      case 'mayorista':
        return product.wholesalePrice;
      case 'promocion':
        return product.promoPrice;
      case 'comercial':
      default:
        return product.commercialPrice;
    }
  };

  const currentPrice = getPrice();
  const hasDiscount = priceTier !== 'comercial';
  const discountPercent = priceTier === 'mayorista' ? 40 : priceTier === 'promocion' ? 60 : 0;

  // Cart quantity check
  const inCartItem = cart.find((item) => item.product.id === product.id);
  const qtyInCart = inCartItem ? inCartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = qtyInCart >= product.stock;

  const handleAdd = () => {
    if (isOutOfStock || isMaxInCart) return;
    const success = addToCart(product, 1);
    if (success) {
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 1200);
    }
  };

  return (
    <article className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      
      {/* Product Image Slot */}
      <div className="relative p-2 bg-[#FBFBF9] cursor-pointer" onClick={() => setSelectedProductForQuickView(product)}>
        <ProductVisual product={product} size="md" />

        {/* Quick View & Edit Overlay Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openProductModal(product);
            }}
            className="bg-white/95 hover:bg-white text-slate-700 hover:text-blue-700 p-2 rounded-lg shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
            title="Editar producto e imagen"
            aria-label="Editar producto"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductForQuickView(product);
            }}
            className="bg-white/95 hover:bg-white text-slate-700 hover:text-blue-700 p-2 rounded-lg shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
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
          {/* Metadata: Category & Volume unboxed */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volume || product.presentation}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => setSelectedProductForQuickView(product)}
            className="text-base font-semibold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Presentation detail */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {product.presentation}
          </p>
        </div>

        {/* Price & Actions Area */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                  ${product.commercialPrice.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                  -{discountPercent}%
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                ${currentPrice.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">MXN</span>
            </div>
            {priceTier === 'mayorista' && (
              <span className="text-[10px] text-blue-600 block font-medium">Tarifa Mayorista</span>
            )}
            {priceTier === 'promocion' && (
              <span className="text-[10px] text-emerald-600 block font-medium">Oferta Promoción</span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isMaxInCart}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isMaxInCart
                ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-white hover:bg-blue-700 shadow-xs active:scale-95'
            }`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado!</span>
              </>
            ) : isOutOfStock ? (
              <span>Agotado</span>
            ) : isMaxInCart ? (
              <span>Máx. Stock</span>
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
