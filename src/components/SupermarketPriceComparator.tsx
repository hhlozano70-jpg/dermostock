import React, { useState } from 'react';
import { 
  Check, 
  ShoppingBag, 
  ExternalLink, 
  Award, 
  ArrowRight, 
  TrendingDown, 
  Sparkles, 
  Layers, 
  Info,
  CheckCircle2,
  Store,
  DollarSign
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { 
  SUPERMARKET_COMPARISON_CATEGORIES, 
  OPTIMIZED_SMART_BASKET,
  ComparisonCategory,
  ComparisonItem 
} from '../data/supermarketComparisonData';

export const SupermarketPriceComparator: React.FC = () => {
  const { products, addToCart } = useInventory();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [basketAdded, setBasketAdded] = useState(false);

  // Categorías a mostrar
  const displayedCategories = selectedCatId === 'all'
    ? SUPERMARKET_COMPARISON_CATEGORIES
    : SUPERMARKET_COMPARISON_CATEGORIES.filter(c => c.id === selectedCatId);

  const handleAddItem = (item: ComparisonItem) => {
    // Buscar si existe el producto en el catálogo
    const foundProduct = item.productId
      ? products.find(p => p.id === item.productId)
      : products.find(p => p.name.toLowerCase().includes(item.brand.toLowerCase()) || p.name.toLowerCase().includes(item.productName.toLowerCase()));

    if (foundProduct) {
      addToCart(foundProduct, 1);
    } else {
      // Agregar como producto virtual con sus datos
      addToCart({
        id: item.id,
        sku: `CMP-${item.id.toUpperCase()}`,
        name: item.productName,
        presentation: item.presentation,
        brand: item.brand,
        category: 'Supermercados y Ofertas',
        merchantId: item.storeId,
        merchantName: item.storeName,
        merchantCategory: 'Supermercados y Ofertas',
        isColdChain: item.isColdChain || false,
        commercialPrice: item.regularPrice,
        wholesalePrice: item.regularPrice * 0.8,
        promoPrice: item.promoPrice,
        stock: 50,
        minStockAlert: 2,
        sourceUrl: item.sourceUrl
      }, 1);
    }

    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleAddSmartBasket = () => {
    OPTIMIZED_SMART_BASKET.forEach(b => {
      const prod = products.find(p => p.id === b.productId);
      if (prod) {
        addToCart(prod, 1);
      }
    });
    setBasketAdded(true);
    setTimeout(() => setBasketAdded(false), 2000);
  };

  // Cálculo de totales de la Canasta Básica Inteligente
  const totalRegularBasket = OPTIMIZED_SMART_BASKET.reduce((sum, b) => sum + b.regularPrice, 0);
  const totalSmartBasket = OPTIMIZED_SMART_BASKET.reduce((sum, b) => sum + b.bestPrice, 0);
  const totalBasketSavings = totalRegularBasket - totalSmartBasket;
  const basketSavingsPct = Math.round((totalBasketSavings / totalRegularBasket) * 100);

  return (
    <div className="space-y-6">
      
      {/* Smart Basket Banner / Simulator */}
      <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl p-4 sm:p-6 border border-amber-400/30 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>Simulador de Mandado Inteligente en Silao</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¿Por qué comparar? <span className="text-amber-300">Ahorra hasta ${totalBasketSavings.toFixed(2)} MXN</span> por semana
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En lugar de ir a un solo súper y pagar precios inflados en ciertos artículos, <strong>SilaoMarket consolida los productos más baratos de cada tienda</strong> (huevo de Aurrera, leche de 3B, jitomate de Soriana) en una sola orden con un solo envío a tu casa.
            </p>
          </div>

          {/* Numbers box & 1-click button */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">En un solo súper regular</div>
                <div className="text-sm text-slate-400 line-through font-mono">${totalRegularBasket.toFixed(2)} MXN</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-400 uppercase font-black">Canasta SilaoMarket ({OPTIMIZED_SMART_BASKET.length} arts)</div>
                <div className="text-xl font-black text-amber-300 font-mono">${totalSmartBasket.toFixed(2)} MXN</div>
                <div className="text-[10px] text-emerald-400 font-bold">Ahorras -{basketSavingsPct}% (${totalBasketSavings.toFixed(2)})</div>
              </div>
            </div>

            <button
              onClick={handleAddSmartBasket}
              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                basketAdded
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-102'
              }`}
            >
              {basketAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Canasta de 8 artículos agregada!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar Canasta Más Barata (8 arts)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedCatId('all')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCatId === 'all'
              ? 'bg-white text-slate-950 border-white shadow-sm font-black'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          ✨ Comparar Todo ({SUPERMARKET_COMPARISON_CATEGORIES.length} productos)
        </button>

        {SUPERMARKET_COMPARISON_CATEGORIES.map((cat) => {
          const isSelected = selectedCatId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Comparison Sections List */}
      <div className="space-y-6">
        {displayedCategories.map((category) => {
          // Ordenar items de menor precio a mayor precio
          const sortedItems = [...category.items].sort((a, b) => a.promoPrice - b.promoPrice);
          const cheapestPrice = sortedItems[0]?.promoPrice || 0;

          return (
            <div 
              key={category.id}
              className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/80 space-y-3.5 shadow-md"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-2 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>{category.title}</span>
                      <span className="text-[11px] font-normal text-slate-400">({category.unitLabel})</span>
                    </h4>
                    <p className="text-xs text-slate-400">{category.description}</p>
                  </div>
                </div>

                <div className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Mejor opción hoy: <strong>${cheapestPrice.toFixed(2)} MXN</strong>
                </div>
              </div>

              {/* Stores Comparison Grid (Side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sortedItems.map((item, idx) => {
                  const isLowest = idx === 0;
                  const priceDiff = item.promoPrice - cheapestPrice;
                  const isAdded = justAddedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3.5 flex flex-col justify-between transition-all relative border ${
                        isLowest
                          ? 'bg-gradient-to-b from-emerald-950/70 to-slate-900 border-emerald-400/70 shadow-lg ring-1 ring-emerald-400/40'
                          : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      {/* Store header tag & Winner Badge */}
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border truncate ${item.storeColor}`}>
                            {item.icon} {item.storeName}
                          </span>

                          {isLowest ? (
                            <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>MÁS BARATO</span>
                            </span>
                          ) : priceDiff > 0 ? (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +${priceDiff.toFixed(2)}
                            </span>
                          ) : null}
                        </div>

                        <div className="text-[10px] text-slate-400">
                          📍 {item.storeBadge}
                        </div>
                      </div>

                      {/* Product details */}
                      <div className="space-y-1 my-1">
                        <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                          {item.productName}
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          {item.presentation} · <span className="text-slate-300 font-medium">{item.brand}</span>
                        </p>

                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200 hover:underline pt-0.5"
                          >
                            <span>Ver folleto oficial</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Price & Action button */}
                      <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-end justify-between gap-2">
                        <div>
                          {item.savingsVsRegular > 0 && (
                            <div className="text-[10px] text-slate-500 line-through font-mono">
                              ${item.regularPrice.toFixed(2)}
                            </div>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base sm:text-lg font-black font-mono ${isLowest ? 'text-emerald-400' : 'text-white'}`}>
                              ${item.promoPrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">MXN</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddItem(item)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                            isAdded
                              ? 'bg-emerald-500 text-white shadow-md'
                              : isLowest
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>¡Listo!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3" />
                              <span>Elegir</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
