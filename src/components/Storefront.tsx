import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Truck, 
  Store, 
  Snowflake, 
  Plus, 
  Scan,
  FileText,
  Building2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductCard } from './ProductCard';
import { SILAO_COLONIAS } from '../data/silaoMarketData';
import { SilaoLandmarksShowcase } from './SilaoLandmarksShowcase';
import { SupermarketOffersSection } from './SupermarketOffersSection';

export const Storefront: React.FC = () => {
  const { 
    products, 
    merchants,
    selectedMerchantId,
    setSelectedMerchantId,
    openProductModal, 
    openScanner,
    setIsBrochureModalOpen,
    setIsAuthModalOpen
  } = useInventory();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyColdChain, setOnlyColdChain] = useState<boolean>(false);

  const categories = [
    'all',
    'Supermercados y Ofertas',
    'Abarrotes y Cremería',
    'Cadena Fría (Aguas, Paletas, Cervezas)',
    'Cuidado Personal y Belleza',
    'Farmacia y Salud',
    'Ferretería y Tlapalería',
    'Refaccionaria y Automotriz',
    'Mascotas y Veterinaria',
    'Flores y Regalos',
    'Servicios Personalizados',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.presentation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || 
        p.category === selectedCategory || 
        p.merchantCategory === selectedCategory ||
        (selectedCategory === 'Supermercados y Ofertas' && (
          p.category === 'Supermercados y Ofertas' || 
          p.merchantCategory === 'Supermercados y Ofertas' ||
          p.merchantId?.includes('aurrera') ||
          p.merchantId?.includes('soriana') ||
          p.merchantId?.includes('tiendas-3b') ||
          p.merchantId?.includes('super-bara')
        )) ||
        (selectedCategory === 'Cuidado Personal y Belleza' && (
          p.merchantId === 'merch-maret-silao' || 
          p.category.includes('Belleza') || 
          p.category.includes('Cuidado Personal')
        ));

      const matchMerchant =
        selectedMerchantId === 'all' || p.merchantId === selectedMerchantId;

      const matchCold = !onlyColdChain || Boolean(p.isColdChain);

      return matchSearch && matchCategory && matchMerchant && matchCold;
    });
  }, [products, searchTerm, selectedCategory, selectedMerchantId, onlyColdChain]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-10 md:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Background Image of Cerro del Cubilete & Cristo Rey Silao (Silao, Gto) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none scale-105"
          style={{
            backgroundImage: `url('/images/cristo_rey_silao.jpg'), url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg/1280px-Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg')`
          }}
        />
        {/* Balanced contrast gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950/95 pointer-events-none" />

        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          
          {/* Logo Principal Prominente Silaomarket */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer" onClick={() => setIsBrochureModalOpen(true)}>
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-400 via-amber-300 to-teal-400 opacity-60 blur-lg group-hover:opacity-100 transition-opacity"></div>
              <img 
                src="/images/silaomarket_logo.jpg" 
                alt="SILAOMARKET ON LINE Logo Oficial" 
                className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl object-contain shadow-2xl border-4 border-white/90 bg-white p-1.5 transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md whitespace-nowrap border border-white/60">
                Silao · Gto
              </span>
            </div>
          </div>

          {/* Header pill with Silao Location */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-md">
            <span>⛰️ Silao de la Victoria, Guanajuato</span>
            <span className="text-amber-500" aria-hidden="true">·</span>
            <span className="text-emerald-400 font-extrabold">Hub Central de Comercio Local</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Todos los Comercios de Silao en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">un Solo Carrito</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pide de tiendas de abarrotes, farmacias, ferreterías, carnicerías y bebidas frías. Pagas un solo envío y nuestro <strong>Hub Central</strong> consolida y entrega todo en tu puerta en una sola vuelta.
          </p>

          {/* Hub Logistics Step-by-Step Banner */}
          <div className="pt-2 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                  1
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Arma Tu Carrito Mixto</h4>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Elige de varios comercios locales de Silao en una misma orden sin restricciones.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                  2
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <span>Hub Silao + Cadena Fría</span>
                  <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                El Hub recolecta tus compras. Artículos fríos y helados viajan con hielera térmica activa.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  3
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">1 Solo Pago y Vuelta</h4>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Recibe todos tus paquetes juntos en tu domicilio con tarifa justa y despacho local.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* SECTION: Search & Store Filters */}
        <section className="space-y-4 pt-2">
          
          {/* Search bar + Cold Chain Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar abarrotes, refacciones, medicamentos, flores, helados, cerveza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              
              {/* Embedded Scanner Button */}
              <button
                type="button"
                onClick={() => openScanner('store')}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                title="Escanear código de barras con la cámara"
              >
                <Scan className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Escanear</span>
              </button>
            </div>

            {/* Cold Chain Only Toggle Pill */}
            <button
              type="button"
              onClick={() => setOnlyColdChain(!onlyColdChain)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                onlyColdChain
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                  : 'bg-white text-cyan-900 border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              <Snowflake className={`w-4 h-4 ${onlyColdChain ? 'text-white' : 'text-cyan-600'}`} />
              <span>Solo Cadena Fría</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-3.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? '✨ Todos los Productos' : cat}
              </button>
            ))}
          </div>

          {/* Merchants Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Comercios Afiliados de Silao</span>
              </span>
              {selectedMerchantId !== 'all' && (
                <button
                  onClick={() => setSelectedMerchantId('all')}
                  className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  ✕ Quitar filtro de comercio
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                onClick={() => setSelectedMerchantId('all')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  selectedMerchantId === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base shrink-0">🏪</span>
                  <div className="truncate">
                    <strong className="text-xs block truncate">Todos</strong>
                    <span className={`text-[10px] block truncate ${selectedMerchantId === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {products.length} productos
                    </span>
                  </div>
                </div>
              </button>

              {merchants.map((m) => {
                const isSelected = selectedMerchantId === m.id;
                const merchantItemCount = products.filter(p => p.merchantId === m.id).length;
                const isMaret = m.id === 'merch-maret-silao';
                const isSupermarket = m.category.includes('Supermercados') || m.id.includes('aurrera') || m.id.includes('soriana') || m.id.includes('tiendas-3b') || m.id.includes('super-bara');
                const icon = isMaret 
                  ? '✨' 
                  : isSupermarket
                  ? '🛒'
                  : m.isColdChain 
                  ? '❄️' 
                  : m.category.includes('Refaccionaria') || m.category.includes('Automotriz')
                  ? '🔧' 
                  : m.category.includes('Farmacia') 
                  ? '💊' 
                  : m.category.includes('Ferretería') 
                  ? '🔨' 
                  : m.category.includes('Flores') 
                  ? '💐' 
                  : m.category.includes('Mascotas') 
                  ? '🐾' 
                  : m.category.includes('Servicios') || m.category.includes('Cerrajería')
                  ? '🔑' 
                  : '🧀';

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMerchantId(isSelected ? 'all' : m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? isMaret
                          ? 'bg-blue-800 text-white border-blue-800 shadow-sm'
                          : 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : isMaret
                        ? 'bg-blue-50/70 text-slate-800 border-blue-200 hover:border-blue-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {m.logoUrl ? (
                        <img 
                          src={m.logoUrl} 
                          alt={m.name} 
                          className="w-5 h-5 rounded-md object-cover shrink-0 border border-slate-200" 
                        />
                      ) : (
                        <span className="text-base shrink-0">{icon}</span>
                      )}
                      <div className="truncate">
                        <strong className="text-xs block truncate">{isMaret ? 'MARET SILAO' : m.name}</strong>
                        <span className={`text-[10px] block truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {merchantItemCount} arts
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION: Catalog Results */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div>
              <span>Mostrando <strong>{filteredProducts.length}</strong> productos disponibles en Silao</span>
              {selectedMerchantId !== 'all' && (
                <span className="ml-1 text-emerald-700 font-semibold">
                  · Filtrado por comercio
                </span>
              )}
              {onlyColdChain && (
                <span className="ml-1 text-cyan-700 font-semibold">
                  · Solo refrigerados/congelados
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => openProductModal(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dar de Alta Producto</span>
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No se encontraron productos con estos filtros</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Intenta cambiar la categoría o el comercio seleccionado, o bien realiza una búsqueda diferente.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedMerchantId('all');
                  setOnlyColdChain(false);
                }}
                className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Restablecer Filtros
              </button>
            </div>
          )}
        </section>

        {/* SECTION: Ofertas de Supermercados de Silao */}
        <SupermarketOffersSection onSelectCategory={(cat) => setSelectedCategory(cat)} />

        {/* SECTION: Lugares Emblemáticos & Orgullo de Silao */}
        <SilaoLandmarksShowcase />

        {/* BANNER OFICIAL DE AFILIACIÓN COMERCIAL */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
                <span>0% Cuota de Entrada</span>
                <span>•</span>
                <span>Liquidación Semanal</span>
                <span>•</span>
                <span>8% a 18% Comisión</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ¿Tienes un Negocio en Silao? Únete a <span className="text-amber-300">SILAOMARKET ON LINE</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Vende a toda la ciudad sin pagar rentas ni mensualidades fijas. Los clientes compran de varios negocios en un solo carrito, el Hub Central consolida y entrega en una sola vuelta, y tú recibes tus ganancias netas cada 7 días.
              </p>
              
              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-amber-200">
                <span>✉️ Afiliación: <strong className="text-white">hhlozano70@hotmail.com</strong></span>
                <span>📍 Hub Calle 5 de Mayo #45, Silao Centro</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setIsBrochureModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Folleto Oficial y Tasas</span>
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>Portal para Negocios Afiliados</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Coverage in Silao Footer Notice */}
        <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 rounded-2xl p-6 text-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <Truck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Zonas de Cobertura y Entrega en Silao, Gto.
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Nuestro Hub Central realiza rutas continuas de consolidación y entrega en todo el municipio de Silao:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {SILAO_COLONIAS.map((col) => (
              <span key={col} className="bg-white/80 border border-emerald-200 px-2.5 py-1 rounded-md text-slate-700 font-medium">
                📍 {col}
              </span>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
};
