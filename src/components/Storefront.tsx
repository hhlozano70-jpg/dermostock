import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Truck, 
  Store, 
  Snowflake, 
  ShieldCheck, 
  Plus, 
  Scan,
  MapPin,
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductCard } from './ProductCard';
import { SILAO_COLONIAS } from '../data/silaoMarketData';
import { SilaoEmblem } from './SilaoEmblem';
import { SilaoLandmarksShowcase } from './SilaoLandmarksShowcase';

export const Storefront: React.FC = () => {
  const { 
    products, 
    merchants,
    selectedMerchantId,
    setSelectedMerchantId,
    priceTier, 
    setPriceTier, 
    openProductModal, 
    openScanner 
  } = useInventory();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyColdChain, setOnlyColdChain] = useState<boolean>(false);

  const categories = [
    'all',
    'Abarrotes y Cremería',
    'Cadena Fría (Aguas, Paletas, Cervezas)',
    'Refaccionaria y Automotriz',
    'Farmacia y Salud',
    'Ferretería y Tlapalería',
    'Mascotas y Veterinaria',
    'Flores y Regalos',
    'Servicios Personalizados',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.presentation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory || p.merchantCategory === selectedCategory;

      const matchMerchant =
        selectedMerchantId === 'all' || p.merchantId === selectedMerchantId;

      const matchCold = !onlyColdChain || Boolean(p.isColdChain);

      return matchSearch && matchCategory && matchMerchant && matchCold;
    });
  }, [products, searchTerm, selectedCategory, selectedMerchantId, onlyColdChain]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Background Image of Cerro del Cubilete & Cristo Rey Silao with dark gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 pointer-events-none transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg/1280px-Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950/98 pointer-events-none" />

        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          {/* Header pill with Silao Emblem */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-md">
            <SilaoEmblem size={26} />
            <span className="text-white">Silao de la Victoria, Guanajuato</span>
            <span className="text-amber-500" aria-hidden="true">·</span>
            <span className="text-emerald-400">Corazón del Bajío</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Todos los Comercios de Silao en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">un Solo Carrito</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Pide en la tienda de abarrotes, refaccionaria, farmacia, ferretería, flores y negocios de cadena fría (aguas frescas, helados, paletas y cervezas bien frías). <strong>Pagas una sola vez</strong> y nuestro <strong>Hub Central en Silao</strong> (Calle 5 de Mayo #45, Silao Centro) consolida tu pedido y te lo entrega en una sola vuelta a tu domicilio.
          </p>

          {/* Silao Landmark Badges Ribbon */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 shadow-xs">
              <span>⛰️</span>
              <strong className="text-amber-300">Cerro del Cubilete</strong>
              <span className="text-slate-400">(Cristo Rey 2,579m)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 shadow-xs">
              <span>⛪</span>
              <strong className="text-emerald-300">Santiago Apóstol</strong>
              <span className="text-slate-400">(Silao Centro)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 shadow-xs">
              <span>❄️</span>
              <strong className="text-cyan-300">Cadena Fría</strong>
              <span className="text-slate-400">(Hielera Activa)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 shadow-xs">
              <span>🚚</span>
              <strong className="text-white">Rastreo QR</strong>
              <span className="text-slate-400">(Envío Local)</span>
            </span>
          </div>

          {/* Hub Logistics Step-by-Step Banner */}
          <div className="pt-3 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                  1
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Arma Tu Carrito Mixto</h4>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Elige de varios comercios locales de Silao sin restricciones en una misma orden.
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                  2
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <span>Hub Silao + Cadena Fría</span>
                  <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                El Hub Silao recolecta todo. Paletas, aguas y cervezas viajan con hielera térmica.
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  3
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">1 Solo Pago y Vuelta</h4>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Recibe todos tus paquetes juntos en tu puerta con entrega rápida garantizada.
              </p>
            </div>
          </div>

          {/* Price Tier Switcher */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="bg-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl grid grid-cols-3 gap-1.5">
              
              <button
                type="button"
                onClick={() => setPriceTier('comercial')}
                className={`py-2.5 px-3 rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                  priceTier === 'comercial'
                    ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Menudeo</span>
                  {priceTier === 'comercial' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <span className="text-[11px] opacity-80 mt-0.5">Precio Público Regular</span>
              </button>

              <button
                type="button"
                onClick={() => setPriceTier('mayorista')}
                className={`py-2.5 px-3 rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                  priceTier === 'mayorista'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Comercio</span>
                  <span className="text-[10px] font-extrabold bg-blue-800/80 px-1.5 py-0.5 rounded">
                    -40%
                  </span>
                </div>
                <span className="text-[11px] opacity-80 mt-0.5">Tarifa Mayorista</span>
              </button>

              <button
                type="button"
                onClick={() => setPriceTier('promocion')}
                className={`py-2.5 px-3 rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                  priceTier === 'promocion'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Promoción</span>
                  <span className="text-[10px] font-extrabold bg-emerald-800/80 px-1.5 py-0.5 rounded">
                    -60%
                  </span>
                </div>
                <span className="text-[11px] opacity-80 mt-0.5">Remates y Temporada</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* SECTION: Lugares Emblemáticos & Orgullo de Silao */}
        <SilaoLandmarksShowcase />

        {/* SECTION: Comercios Afiliados en Silao (Cards Carousel / Grid) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>Comercios Locales en Silao Guanajuato</span>
              </h2>
              <p className="text-xs text-slate-500">
                Filtra por negocio para ver exclusivamente sus productos o selecciona "Ver Todos"
              </p>
            </div>

            {selectedMerchantId !== 'all' && (
              <button
                onClick={() => setSelectedMerchantId('all')}
                className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Ver todos los comercios
              </button>
            )}
          </div>

          {/* Merchants Horizontal Scroll / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <button
              onClick={() => setSelectedMerchantId('all')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedMerchantId === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-base">🏪</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedMerchantId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {products.length} arts
                </span>
              </div>
              <div>
                <strong className="text-xs block line-clamp-1">Todos los Comercios</strong>
                <span className={`text-[10px] block line-clamp-1 ${selectedMerchantId === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Catálogo unificado Silao
                </span>
              </div>
            </button>

            {merchants.map((m) => {
              const isSelected = selectedMerchantId === m.id;
              const merchantItemCount = products.filter(p => p.merchantId === m.id).length;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMerchantId(isSelected ? 'all' : m.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">
                      {m.isColdChain ? '❄️' : m.category.includes('Refaccionaria') ? '🔧' : m.category.includes('Farmacia') ? '💊' : m.category.includes('Ferretería') ? '🔨' : m.category.includes('Flores') ? '💐' : m.category.includes('Mascotas') ? '🐾' : '🛒'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {merchantItemCount} arts
                    </span>
                  </div>
                  <div>
                    <strong className="text-xs block line-clamp-1">{m.name}</strong>
                    <span className={`text-[10px] block line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {m.silaoZone}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION: Search & Category Filters */}
        <section className="space-y-4">
          
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
              <span>Solo Cadena Fría (Aguas, Helados, Cervezas)</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
                {cat === 'all' ? '✨ Todas las Categorías' : cat}
              </button>
            ))}
          </div>

        </section>

        {/* Results Info & Action Bar */}
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
                · Solo productos refrigerados/congelados
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

        {/* Product Cards Grid */}
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
