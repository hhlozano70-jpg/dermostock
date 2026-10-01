import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Store, 
  Tag, 
  TrendingDown, 
  Check, 
  Snowflake, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Percent,
  Clock,
  Layers,
  RefreshCw,
  ExternalLink,
  Globe,
  FileText
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';
import { ProductVisual } from './ProductVisual';

interface SupermarketOffersSectionProps {
  onSelectCategory?: (category: string) => void;
}

export const SupermarketOffersSection: React.FC<SupermarketOffersSectionProps> = ({ onSelectCategory }) => {
  const { 
    products, 
    merchants, 
    priceTier, 
    addToCart, 
    setSelectedProductForQuickView,
    cart,
    setSelectedMerchantId,
    userRole,
    refreshFromServer
  } = useInventory();

  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Estado de automatización programada
  const [automationMeta, setAutomationMeta] = useState<{
    lastUpdate: string;
    dateFormatted: string;
    dayTheme: string;
    updatedCount: number;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Consultar estado de automatización al backend
    fetch('/api/supermarket-offers/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.meta) {
          setAutomationMeta(data.meta);
        }
      })
      .catch(() => {});
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/supermarket-offers/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.meta) {
          setAutomationMeta(data.meta);
        }
        await refreshFromServer();
      }
    } catch (e) {
      console.warn('Error al sincronizar ofertas manualmente:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtrar exclusivamente productos de supermercados de Silao
  const supermarketProducts = useMemo(() => {
    return products.filter(p => 
      p.category === 'Supermercados y Ofertas' || 
      p.merchantCategory === 'Supermercados y Ofertas' ||
      p.merchantId?.includes('aurrera') ||
      p.merchantId?.includes('soriana') ||
      p.merchantId?.includes('tiendas-3b') ||
      p.merchantId?.includes('super-bara')
    );
  }, [products]);

  // Subcategorías dinámicas para ofertas
  const subcategories = [
    { id: 'all', label: '🔥 Todas las Ofertas' },
    { id: 'despensa', label: '🌾 Canasta Básica' },
    { id: 'frescura', label: '🥬 Frutas y Verduras' },
    { id: 'carnes_lacteos', label: '🥩 Carnes y Lácteos' },
    { id: 'limpieza', label: '🧼 Limpieza del Hogar' },
    { id: 'bebidas', label: '🥤 Bebidas y Snacks' },
  ];

  // Filtro compuesto
  const displayedProducts = useMemo(() => {
    return supermarketProducts.filter(p => {
      const matchSuper = selectedSupermarket === 'all' || p.merchantId === selectedSupermarket;
      
      let matchSub = true;
      const lowerName = p.name.toLowerCase();
      const lowerDesc = (p.description || '').toLowerCase();
      
      if (selectedSubcategory === 'despensa') {
        matchSub = lowerName.includes('aceite') || lowerName.includes('arroz') || lowerName.includes('frijol') || 
                   lowerName.includes('huevo') || lowerName.includes('atún') || lowerName.includes('leche') || lowerName.includes('café');
      } else if (selectedSubcategory === 'frescura') {
        matchSub = lowerName.includes('jitomate') || lowerName.includes('aguacate') || lowerName.includes('plátano') || lowerDesc.includes('fresco');
      } else if (selectedSubcategory === 'carnes_lacteos') {
        matchSub = lowerName.includes('pechuga') || lowerName.includes('carne') || lowerName.includes('queso') || 
                   lowerName.includes('jamón') || lowerName.includes('salchicha');
      } else if (selectedSubcategory === 'limpieza') {
        matchSub = lowerName.includes('papel') || lowerName.includes('detergente') || lowerName.includes('jabón') || 
                   lowerName.includes('suavizante') || lowerName.includes('cloro') || lowerName.includes('lavatrastes');
      } else if (selectedSubcategory === 'bebidas') {
        matchSub = lowerName.includes('refresco') || lowerName.includes('coca') || lowerName.includes('cerveza') || 
                   lowerName.includes('hielo') || lowerName.includes('papas') || lowerName.includes('galletas');
      }

      return matchSuper && matchSub;
    });
  }, [supermarketProducts, selectedSupermarket, selectedSubcategory]);

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product, 1);
    if (success) {
      setJustAddedId(product.id);
      setTimeout(() => setJustAddedId(null), 1200);
    }
  };

  const supermarketTabs = [
    {
      id: 'all',
      name: 'Todos los Súpers',
      badge: `${supermarketProducts.length} Ofertas`,
      icon: '🛒',
      color: 'border-slate-800 bg-slate-900 text-white',
      brochureUrl: 'https://www.tiendeo.mx/silao/supermercados',
      brochureLabel: 'Ver Folletos de Silao en Tiendeo'
    },
    {
      id: 'merch-aurrera-silao',
      name: 'Bodega Aurrera',
      branch: 'Plaza La Joya',
      badge: '🏷️ Morralla Bodega',
      icon: '🟢',
      color: 'border-emerald-600 bg-emerald-900 text-white',
      brochureUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
      websiteUrl: 'https://despensa.bodegaaurrera.com.mx/',
      brochureLabel: 'Folleto Digital Bodega Aurrera'
    },
    {
      id: 'merch-soriana-silao',
      name: 'Mercado Soriana',
      branch: 'Blvd. Bailleres',
      badge: '🔥 Martes de Frescura',
      icon: '🔴',
      color: 'border-rose-600 bg-rose-900 text-white',
      brochureUrl: 'https://www.soriana.com/folleto-digital.html',
      websiteUrl: 'https://www.soriana.com/',
      brochureLabel: 'Folleto Digital Soriana Híper'
    },
    {
      id: 'merch-tiendas-3b',
      name: 'Tiendas 3B',
      branch: 'Centro & Sopeña',
      badge: '💥 Precios de Fábrica',
      icon: '🟣',
      color: 'border-purple-600 bg-purple-900 text-white',
      brochureUrl: 'https://tiendas3b.com/productos/',
      websiteUrl: 'https://tiendas3b.com/',
      brochureLabel: 'Catálogo Oficial Tiendas 3B'
    },
    {
      id: 'merch-super-bara',
      name: 'Super Bara',
      branch: 'Sopeña / Ducoing',
      badge: '⚡ Ahorro Exprés',
      icon: '🟠',
      color: 'border-amber-600 bg-amber-900 text-white',
      brochureUrl: 'https://bara.com.mx/promociones',
      websiteUrl: 'https://bara.com.mx/',
      brochureLabel: 'Promociones Bara Bajío'
    }
  ];

  const activeSupermarket = supermarketTabs.find(s => s.id === selectedSupermarket);


  return (
    <section id="seccion-ofertas-supermercados" className="scroll-mt-24 space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-5 sm:p-8 text-white shadow-2xl border border-emerald-500/30 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Folleto Semanal & Canasta Básica · Silao, Gto</span>
            </div>

            {/* Badge de Automatización Programada Diaria */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-emerald-400">Automatización Diaria Activa</span>
              {automationMeta && (
                <span className="text-slate-400 font-normal hidden sm:inline">
                  · {automationMeta.dateFormatted} ({automationMeta.dayTheme})
                </span>
              )}
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🛒 Ofertas de Supermercados de Silao</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Compara y ahorra en tu mandado: <strong>Bodega Aurrera, Mercado Soriana, Tiendas 3B y Super Bara</strong>. Agrega productos de varios supermercados al mismo carrito y nuestro <strong>Hub Central Silao</strong> te entrega todo consolidado en un solo flete a tu domicilio.
          </p>

          {/* Botón de Sincronización Inmediata para Administradores o prueba */}
          {(userRole === 'admin' || userRole === 'negocio') && (
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Ejecutar el robot de actualización diaria de precios ahora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Actualizando ofertas del día...' : 'Sincronizar Ofertas de Hoy Ahora'}</span>
              </button>
              <span className="text-[11px] text-slate-400">
                ⏰ Se ejecuta automáticamente diario a las 06:00 AM
              </span>
            </div>
          )}
        </div>

        {/* Highlight Stats Pill */}
        <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 shrink-0 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-lg border border-amber-400/30">
            %
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Ahorro Promedio en Despensa</div>
            <div className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span className="text-amber-400 font-mono">15% a 35%</span>
              <span className="text-xs text-emerald-400 font-normal">vs tiendas convencionales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supermarkets Filter Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {supermarketTabs.map((s) => {
          const isSelected = selectedSupermarket === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSupermarket(s.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg scale-102 ring-2 ring-emerald-400/50'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-900/80 text-emerald-300 border border-emerald-500/20'
                }`}>
                  {s.badge}
                </span>
              </div>
              <div>
                <strong className="text-xs sm:text-sm block font-black leading-snug">
                  {s.name}
                </strong>
                {s.branch && (
                  <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    📍 {s.branch}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Official Brochure Direct Link Bar */}
      {activeSupermarket && activeSupermarket.brochureUrl && (
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/30">
              {activeSupermarket.icon}
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Referencia Oficial: {activeSupermarket.name}</span>
                {activeSupermarket.branch && (
                  <span className="text-[10px] text-slate-400">({activeSupermarket.branch})</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Precios y ofertas respaldados con el portal digital y folleto de la cadena
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeSupermarket.websiteUrl && (
              <a
                href={activeSupermarket.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-300" />
                <span>Sitio Web</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            <a
              href={activeSupermarket.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{activeSupermarket.brochureLabel || 'Abrir Folleto Oficial Digital'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Subcategory Pills */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {subcategories.map((sub) => {
          const isSelected = selectedSubcategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Offers Product Grid */}
      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>Mostrando <strong>{displayedProducts.length}</strong> productos en oferta en supermercados de Silao</span>
          {selectedSupermarket !== 'all' && (
            <button 
              onClick={() => setSelectedSupermarket('all')}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              Ver todos los supermercados
            </button>
          )}
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedProducts.map((product) => {
              const inCartItem = cart.find(item => item.product.id === product.id);
              const qtyInCart = inCartItem ? inCartItem.quantity : 0;
              const isAdded = justAddedId === product.id;
              
              // Precio comercial vs Oferta
              const regularPrice = product.commercialPrice;
              const offerPrice = product.promoPrice || product.commercialPrice;
              const savings = Math.max(0, regularPrice - offerPrice);
              const discountPct = Math.round((savings / regularPrice) * 100);

              const storeColorBadge = 
                product.merchantId === 'merch-aurrera-silao'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  : product.merchantId === 'merch-soriana-silao'
                  ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                  : product.merchantId === 'merch-tiendas-3b'
                  ? 'bg-purple-950 text-purple-300 border-purple-700/60'
                  : 'bg-amber-950 text-amber-300 border-amber-700/60';

              return (
                <div 
                  key={product.id}
                  className="group bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700/90 hover:border-emerald-500/60 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl relative overflow-hidden"
                >
                  {/* Top discount chip */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border truncate max-w-[170px] ${storeColorBadge}`}>
                      {product.merchantName}
                    </span>

                    {savings > 0 && (
                      <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
                        -{discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Image slot */}
                  <div 
                    className="relative rounded-xl overflow-hidden bg-slate-900/60 p-2 cursor-pointer mb-2 flex items-center justify-center min-h-[140px]"
                    onClick={() => setSelectedProductForQuickView(product)}
                  >
                    <ProductVisual product={product} size="md" />

                    {product.isColdChain && (
                      <div className="absolute top-2 left-2 bg-cyan-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs">
                        <Snowflake className="w-3 h-3" />
                        <span>Frío</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductForQuickView(product);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Ver detalles"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <h3 
                      onClick={() => setSelectedProductForQuickView(product)}
                      className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-tight"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {product.presentation}
                    </p>

                    {/* Enlace a folleto/fuente web oficial */}
                    {product.sourceUrl && (
                      <div className="pt-0.5">
                        <a
                          href={product.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200 hover:underline font-semibold"
                          title="Abrir folleto oficial del supermercado en pestaña nueva"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Folleto oficial ↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Price & Cart footer */}
                  <div className="pt-3 mt-2 border-t border-slate-700/80 flex items-end justify-between gap-2">
                    <div>
                      {savings > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            ${regularPrice.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-bold">
                            Ahorras ${savings.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                          ${offerPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">MXN</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isAdded
                          ? 'bg-emerald-500 text-white shadow-md'
                          : qtyInCart > 0
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                      }`}
                      aria-label={`Agregar ${product.name} al carrito`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Listo!</span>
                        </>
                      ) : qtyInCart > 0 ? (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>({qtyInCart}) Agregar +</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400">
            <p className="text-sm">No se encontraron productos de oferta para esta combinación de filtros.</p>
          </div>
        )}
      </div>

      {/* Direct Reference Web Directory */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Referencias y Folletos Web Oficiales Consultados en Silao, Gto</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <a
            href="https://despensa.bodegaaurrera.com.mx/c/folleto-digital"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="space-y-0.5">
              <strong className="block text-white text-xs group-hover:text-emerald-300 font-bold">🟢 Bodega Aurrera Silao</strong>
              <span className="text-[10px] text-slate-400 block">Folleto Digital & Morralla</span>
              <span className="text-[9px] text-emerald-400/80 font-mono block">despensa.bodegaaurrera.com.mx</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://www.soriana.com/folleto-digital.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="space-y-0.5">
              <strong className="block text-white text-xs group-hover:text-rose-300 font-bold">🔴 Mercado Soriana Silao</strong>
              <span className="text-[10px] text-slate-400 block">Martes de Frescura & Catálogo</span>
              <span className="text-[9px] text-rose-400/80 font-mono block">soriana.com/folleto-digital</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://tiendas3b.com/productos/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="space-y-0.5">
              <strong className="block text-white text-xs group-hover:text-purple-300 font-bold">🟣 Tiendas 3B Silao</strong>
              <span className="text-[10px] text-slate-400 block">Catálogo Oficial de Fábrica</span>
              <span className="text-[9px] text-purple-400/80 font-mono block">tiendas3b.com/productos</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://bara.com.mx/promociones"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="space-y-0.5">
              <strong className="block text-white text-xs group-hover:text-amber-300 font-bold">🟠 Super Bara Silao</strong>
              <span className="text-[10px] text-slate-400 block">Promociones Quincenales Bajío</span>
              <span className="text-[9px] text-amber-400/80 font-mono block">bara.com.mx/promociones</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>
        </div>
      </div>

      {/* Footer Info Ribbon */}
      <div className="relative z-10 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Garantía de frescura y precios de folleto vigentes en Silao de la Victoria.</span>
        </div>

        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <span>🚚 Envíos a todo Silao (Centro, Sopeña, Las Cruces, FIPASI, Puerto Interior)</span>
        </div>
      </div>

    </section>
  );
};
