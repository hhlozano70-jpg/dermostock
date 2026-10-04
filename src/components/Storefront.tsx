import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Truck, 
  Store, 
  Snowflake, 
  Plus, 
  Scan,
  FileText,
  Building2,
  Clock,
  ExternalLink,
  Sparkles,
  Paperclip,
  CheckCircle2,
  FileEdit,
  MapPin,
  Tag,
  ShieldCheck,
  User,
  UserCheck
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductCard } from './ProductCard';
import { SILAO_COLONIAS } from '../data/silaoMarketData';
import { SilaoLandmarksShowcase } from './SilaoLandmarksShowcase';
import { checkMerchantOperatingStatus } from '../utils/operatingHours';

export const Storefront: React.FC = () => {
  const { 
    products, 
    merchants,
    selectedMerchantId,
    setSelectedMerchantId,
    openProductModal, 
    openScanner,
    setIsBrochureModalOpen,
    setIsAuthModalOpen,
    setIsCustomOrderModalOpen,
    giros,
    registeredCustomer,
    userRole,
    setActiveTab
  } = useInventory();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyColdChain, setOnlyColdChain] = useState<boolean>(false);

  const categories = useMemo(() => {
    const base = [
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
    const customList = (giros || []).map(g => g.giro);
    const combined = new Set([...base, ...customList]);
    return Array.from(combined);
  }, [giros]);

  // Comercios de ejemplo asociados dinámicamente a la pestaña seleccionada
  const activeCategoryMerchants = useMemo(() => {
    if (selectedCategory === 'all') {
      return merchants;
    }
    if (selectedCategory === 'Supermercados y Ofertas') {
      return merchants.filter(m => 
        m.category.includes('Supermercados') || 
        m.id.includes('aurrera') || 
        m.id.includes('soriana') || 
        m.id.includes('tiendas-3b') || 
        m.id.includes('super-bara')
      );
    }
    if (selectedCategory === 'Abarrotes y Cremería') {
      return merchants.filter(m => m.category.includes('Abarrotes') || m.id === 'merch-abarrotes');
    }
    if (selectedCategory === 'Cadena Fría (Aguas, Paletas, Cervezas)') {
      return merchants.filter(m => m.isColdChain || m.category.includes('Cadena Fría') || m.id === 'merch-cadena-fria' || m.id === 'merch-cerveceria');
    }
    if (selectedCategory === 'Cuidado Personal y Belleza') {
      return merchants.filter(m => m.id === 'merch-maret-silao' || m.category.includes('Belleza') || m.category.includes('Cuidado Personal'));
    }
    if (selectedCategory === 'Farmacia y Salud') {
      return merchants.filter(m => m.category.includes('Farmacia') || m.id === 'merch-farmacia');
    }
    if (selectedCategory === 'Ferretería y Tlapalería') {
      return merchants.filter(m => m.category.includes('Ferretería') || m.id === 'merch-ferreteria');
    }
    if (selectedCategory === 'Refaccionaria y Automotriz') {
      return merchants.filter(m => m.category.includes('Refaccionaria') || m.category.includes('Automotriz') || m.id === 'merch-refacciones');
    }
    if (selectedCategory === 'Mascotas y Veterinaria') {
      return merchants.filter(m => m.category.includes('Mascotas') || m.category.includes('Veterinaria') || m.id === 'merch-mascotas');
    }
    if (selectedCategory === 'Flores y Regalos') {
      return merchants.filter(m => m.category.includes('Flores') || m.id === 'merch-flores');
    }
    if (selectedCategory === 'Servicios Personalizados') {
      return merchants.filter(m => 
        m.type === 'Servicio' ||
        m.category.includes('Servicio') ||
        m.category.includes('Cerrajería') ||
        m.category.includes('Tintorería') ||
        m.category.includes('Lavandería') ||
        m.category.includes('Trámites') ||
        m.category.includes('Impresiones') ||
        m.id === 'merch-cerrajeria-silao' ||
        m.id === 'merch-tintoreria-silao' ||
        m.id === 'merch-lavanderia-silao' ||
        m.id === 'merch-tramites-silao' ||
        m.id === 'merch-impresiones-tramites' ||
        m.id === 'merch-web-apps-silao'
      );
    }
    return merchants.filter(m => 
      m.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(m.category.toLowerCase()) ||
      (m.serviceTypeTag && m.serviceTypeTag.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }, [selectedCategory, merchants]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return (products || []).filter((p) => {
      if (!p) return false;

      const pName = (p.name || '').toLowerCase();
      const pPres = (p.presentation || '').toLowerCase();
      const pMerch = (p.merchantName || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();

      const matchSearch =
        !search ||
        pName.includes(search) ||
        pPres.includes(search) ||
        pMerch.includes(search) ||
        pCat.includes(search) ||
        pBrand.includes(search);

      const matchCategory =
        selectedCategory === 'all' || 
        p.category === selectedCategory || 
        p.merchantCategory === selectedCategory ||
        (selectedCategory === 'Supermercados y Ofertas' && (
          p.category === 'Supermercados y Ofertas' || 
          p.merchantCategory === 'Supermercados y Ofertas' ||
          Boolean(p.merchantId?.includes('aurrera') ||
          p.merchantId?.includes('soriana') ||
          p.merchantId?.includes('tiendas-3b') ||
          p.merchantId?.includes('super-bara'))
        )) ||
        (selectedCategory === 'Cuidado Personal y Belleza' && (
          p.merchantId === 'merch-maret-silao' || 
          (p.category && p.category.includes('Belleza')) ||
          (p.category && p.category.includes('Cuidado Personal'))
        )) ||
        (selectedCategory === 'Servicios Personalizados' && (
          p.type === 'Servicio' ||
          (p.category && p.category.includes('Servicio')) ||
          (p.category && p.category.includes('Cerrajería')) ||
          (p.category && p.category.includes('Tintorería')) ||
          (p.category && p.category.includes('Lavandería')) ||
          (p.category && p.category.includes('Trámites')) ||
          (p.category && p.category.includes('Impresiones')) ||
          (p.merchantCategory && p.merchantCategory.includes('Servicio')) ||
          (p.merchantCategory && p.merchantCategory.includes('Cerrajería')) ||
          (p.merchantCategory && p.merchantCategory.includes('Tintorería')) ||
          (p.merchantCategory && p.merchantCategory.includes('Lavandería')) ||
          (p.merchantCategory && p.merchantCategory.includes('Trámites')) ||
          (p.merchantCategory && p.merchantCategory.includes('Impresiones')) ||
          p.merchantId === 'merch-cerrajeria-silao' ||
          p.merchantId === 'merch-tintoreria-silao' ||
          p.merchantId === 'merch-lavanderia-silao' ||
          p.merchantId === 'merch-tramites-silao' ||
          p.merchantId === 'merch-impresiones-tramites' ||
          p.merchantId === 'merch-web-apps-silao'
        )) ||
        (selectedCategory === 'Cadena Fría (Aguas, Paletas, Cervezas)' && (
          p.isColdChain || 
          (p.category && p.category.includes('Cadena Fría')) || 
          (p.merchantCategory && p.merchantCategory.includes('Cadena Fría')) ||
          p.merchantId === 'merch-cadena-fria' ||
          p.merchantId === 'merch-cerveceria'
        ));

      const matchMerchant =
        selectedMerchantId === 'all' || p.merchantId === selectedMerchantId;

      const matchCold = !onlyColdChain || Boolean(p.isColdChain);

      return matchSearch && matchCategory && matchMerchant && matchCold;
    });
  }, [products, searchTerm, selectedCategory, selectedMerchantId, onlyColdChain]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner Limpio y Luminoso (Sin fondo negro masivo) */}
      <section className="bg-gradient-to-b from-white via-slate-50/90 to-emerald-50/40 text-slate-900 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          
          {/* Logo Principal SilaoMarket */}
          <div className="flex flex-col items-center justify-center">
            <div 
              className="relative group cursor-pointer inline-block" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              title="SILAOMARKET ON LINE · Silao, Gto"
            >
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 opacity-30 blur-md group-hover:opacity-60 transition-opacity"></div>
              <img 
                src="/images/silaomarket_logo.jpg" 
                alt="SILAOMARKET ON LINE Logo Oficial" 
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain shadow-lg border-2 border-white bg-white p-1 transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap border border-white">
                Silao · Gto
              </span>
            </div>
          </div>

          {/* Badge de Silao */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-amber-300 text-slate-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span>⛰️ Silao de la Victoria, Guanajuato</span>
            <span className="text-amber-500" aria-hidden="true">·</span>
            <span className="text-emerald-700 font-extrabold">Hub Central de Comercio Local</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Todos los Comercios de Silao en <span className="text-emerald-700">un Solo Carrito</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Compra de abarrotes, farmacias, ferreterías, tintorería, cerrajería, supermercados y cadena fría. Pagas un solo envío y nuestro <strong>Hub Central Silao</strong> consolida y entrega todo en tu puerta en una sola vuelta.
          </p>

          {/* 3 Pasos del Hub Logístico Limpio */}
          <div className="pt-2 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Arma Tu Carrito Mixto</h4>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Elige de varios comercios locales de Silao en una misma orden sin restricciones.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Hub Silao + Cadena Fría</span>
                  <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                El Hub recolecta tus compras. Bebidas y helados viajan con hielera térmica activa.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1 Solo Pago y Vuelta</h4>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Recibe todos tus paquetes juntos en tu domicilio con tarifa justa y despacho local.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ESTATUS DE CLIENTE: REGISTRADO vs INVITADO */}
        {userRole === 'cliente' && (
          registeredCustomer ? (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                      🛡️ Estatus: Cliente Registrado
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      ¡Bienvenido(a), {registeredCustomer.name}!
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                    <span>📱 WhatsApp: <strong className="text-white font-mono">{registeredCustomer.phone}</strong></span>
                    <span>•</span>
                    <span>📍 Entrega: <strong className="text-white">{registeredCustomer.address || 'Silao Centro'}</strong> ({registeredCustomer.colonia || 'Silao, Gto'})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('pedidos')}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Mis Pedidos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                  title="Ver o actualizar mis datos de cliente"
                >
                  <span>Mi Perfil</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-amber-900">
                    Estás navegando en modo Invitado
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Puedes consultar inventarios y armar tu carrito. Regístrate para guardar tu dirección y obtener el <strong>Estatus de Cliente Registrado</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow-xs transition-all cursor-pointer text-center"
              >
                Registrarme como Cliente
              </button>
            </div>
          )
        )}

        {/* SECTION: Search & Store Filters */}
        <section className="space-y-4 pt-1">
          
          {/* Search bar + Cold Chain Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar abarrotes, cerrajería, tintorería, refacciones, medicamentos, flores, helados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs text-slate-900"
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

          {/* Category Chips Bar (Todas las Pestañas) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Explorar por Categoría / Giro:</span>
              <span>{categories.length} categorías disponibles</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedMerchantId('all');
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'all' ? '✨ Todas las Categorías' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN: EJEMPLOS DE NEGOCIOS EN LA PESTAÑA SELECCIONADA */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedCategory === 'all' 
                    ? '🏪 Ejemplos de Negocios Afiliados en Silao:' 
                    : `🏪 Negocios de Ejemplo en "${selectedCategory}":`}
                </h3>
              </div>
              {selectedMerchantId !== 'all' && (
                <button
                  onClick={() => setSelectedMerchantId('all')}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  ✕ Ver todos los productos de la categoría
                </button>
              )}
            </div>

            {/* Grid de Tarjetas de Negocios de Ejemplo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategoryMerchants.slice(0, 9).map((m) => {
                const isSelected = selectedMerchantId === m.id;
                const schedule = checkMerchantOperatingStatus(m);
                const itemCount = products.filter(p => p.merchantId === m.id).length;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMerchantId(isSelected ? 'all' : m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer bg-white flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md bg-emerald-50/20'
                        : 'border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.logoUrl ? (
                          <img src={m.logoUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🏪</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <strong className="text-xs font-bold text-slate-900 block truncate" title={m.name}>
                          {m.name}
                        </strong>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{m.silaoZone || m.address}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            schedule.isOpen 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : schedule.isBeforeOpening 
                              ? 'bg-amber-100 text-amber-800 font-bold' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {schedule.isOpen ? '🟢 Abierto' : `⏰ Abre ${schedule.openingTime12h}`}
                          </span>
                          <span className="text-[9px] text-slate-500 font-semibold">
                            {itemCount} productos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badges de características del negocio */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-[10px]">
                      {m.requiresCustomerFile && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>Acepta archivos</span>
                        </span>
                      )}
                      {m.catalogPdfUrl && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                          <FileText className="w-2.5 h-2.5" />
                          <span>Catálogo digital</span>
                        </span>
                      )}
                      {m.isPhysicalLocation === false && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                          🏠 Sin local físico
                        </span>
                      )}
                      {m.canAccompanyOrders && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                          📦 Acompaña pedidos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {isSelected ? '✓ Seleccionado' : 'Click para filtrar tienda'}
                      </span>
                      {m.catalogPdfUrl && (
                        <a
                          href={m.catalogPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-purple-700 font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Ver Catálogo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        {/* Selected Merchant Details Header Banner */}
        {selectedMerchantId !== 'all' && (() => {
          const selMerchant = merchants.find(m => m.id === selectedMerchantId);
          if (!selMerchant) return null;
          const schedule = checkMerchantOperatingStatus(selMerchant);
          return (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {selMerchant.logoUrl ? (
                    <img src={selMerchant.logoUrl} alt={selMerchant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🏪</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{selMerchant.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      schedule.isOpen 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : schedule.isBeforeOpening 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {schedule.isOpen ? `🟢 Abierto ahora (Cierra ${schedule.closingTime12h})` : `⏰ ${schedule.statusLabel}`}
                    </span>
                    {selMerchant.isPhysicalLocation === false && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        🏠 Sin local físico · Independiente
                      </span>
                    )}
                    {selMerchant.canAccompanyOrders && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        📦 Acompaña pedidos del Hub
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selMerchant.category} · 📍 {selMerchant.address} ({selMerchant.silaoZone || 'Silao Centro'})
                  </p>

                  {/* Catálogo, Menú o Documentos del Comercio */}
                  {(selMerchant.catalogPdfUrl || (selMerchant.customDocuments && selMerchant.customDocuments.length > 0)) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selMerchant.catalogPdfUrl && (
                        <a
                          href={selMerchant.catalogPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Catálogo / Menú Digital Completo</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                        </a>
                      )}
                      {selMerchant.customDocuments?.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] border border-slate-200 transition-colors"
                          title={doc.description || doc.title}
                        >
                          <span>📄 {doc.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Requerimiento de Archivos para el Servicio */}
                  {selMerchant.requiresCustomerFile && (
                    <div className="mt-2 text-[11px] text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        <strong>Servicio que requiere archivo:</strong> {selMerchant.fileRequirementsInstructions || 'Puedes subir tu foto, PDF, Word o Excel en el formulario de encargo.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Horario de Servicio Oficial */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs shrink-0 space-y-1 w-full md:w-auto">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Horario de Servicio:</span>
                  <span className="font-mono text-emerald-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                    {schedule.scheduleText}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between gap-3">
                  <span>Días: <strong>{selMerchant.serviceDays || 'Lunes a Domingo'}</strong></span>
                  {schedule.isBeforeOpening && (
                    <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                      Restricción: Abre {schedule.openingTime12h}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Banner para Pedido por Encargo / Formato Fuera de Catálogo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <FileEdit className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <strong className="text-sm sm:text-base block font-bold text-white">
                ¿Buscas un producto o servicio que no está en los catálogos?
              </strong>
              <p className="text-xs text-slate-200">
                Pide por encargo duplicados de llaves, limpieza en seco, impresiones, refacciones específicas o fletes con el formulario oficial.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCustomOrderModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shrink-0 shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-900" />
            <span>Hacer Pedido por Encargo</span>
          </button>
        </div>

        {/* SECTION: Catalog Results */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div>
              <span>Mostrando <strong>{filteredProducts.length}</strong> productos disponibles en Silao</span>
              {selectedCategory !== 'all' && (
                <span className="ml-1 text-emerald-800 font-bold">
                  · Categoría: {selectedCategory}
                </span>
              )}
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-2xs transition-colors cursor-pointer"
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
                Intenta cambiar la categoría o el comercio seleccionado, o bien realiza un encargo especial si buscas algo fuera de catálogo.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedMerchantId('all');
                    setOnlyColdChain(false);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Restablecer Filtros
                </button>
                <button
                  onClick={() => setIsCustomOrderModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pedir por Encargo</span>
                </button>
              </div>
            </div>
          )}
        </section>

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
