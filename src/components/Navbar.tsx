import React from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Store, 
  ClipboardList, 
  History, 
  RefreshCw, 
  Cloud,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Settings,
  Scan,
  User,
  ShieldCheck,
  FileText,
  DollarSign,
  Building2,
  Truck,
  Tag,
  HelpCircle,
  X,
  Package,
  Sparkles,
  LogOut,
  BookOpen
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PriceTier } from '../types/inventory';
import { SilaoEmblem } from './SilaoEmblem';

export const Navbar: React.FC = () => {
  const [isPricingRulesOpen, setIsPricingRulesOpen] = React.useState(false);
  const { 
    activeTab, 
    setActiveTab, 
    cartCount, 
    setIsCartOpen,
    priceTier, 
    setPriceTier,
    syncStatus,
    setIsSyncModalOpen,
    setIsSettingsModalOpen,
    openScanner,
    userRole,
    loggedMerchant,
    setIsAuthModalOpen,
    setIsBrochureModalOpen,
    setIsManualModalOpen,
    setIsMerchantManagerOpen,
    logoutRole,
    registeredCustomer,
    logoutCustomer
  } = useInventory();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Zone 1: Wordmark & Sync Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setActiveTab('tienda')}
              className="flex items-center gap-2.5 group cursor-pointer text-left shrink-0"
            >
              <div className="relative group-hover:scale-105 transition-transform shrink-0">
                <img 
                  src="/images/silaomarket_logo.jpg" 
                  alt="Silaomarket Logo" 
                  className="w-10 h-10 rounded-xl object-contain bg-white shadow-xs border border-slate-200 p-0.5" 
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors leading-none">
                    Silaomarket
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow-xs">
                    on line
                  </span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold mt-0.5 hidden xs:block">
                  ⛰️ Silao de la Victoria · Gto
                </span>
              </div>
            </button>

            {/* Cloud Sync Status Indicator - Visible solo para Negocios y Administrador */}
            {userRole !== 'cliente' && (
              <button
                onClick={() => setIsSyncModalOpen(true)}
                title={`Sincronización en la nube: ${syncStatus}. Clic para ver opciones de sincronización PC y Celular.`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                    <span className="text-emerald-600 font-semibold">Sincronizando...</span>
                  </>
                ) : syncStatus === 'synced' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-700 font-semibold">En Línea</span>
                    <Cloud className="w-3 h-3 text-emerald-500 ml-0.5" />
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-700">Sin conexión</span>
                  </>
                )}
              </button>
            )}

            {/* Badge de Entrega Local en Silao (Aporta valor y confianza para clientes) */}
            {userRole === 'cliente' && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hub Silao · 1 Solo Envío Multitienda</span>
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs lg:text-sm font-medium">
            <button
              onClick={() => setActiveTab('tienda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'tienda'
                  ? 'text-emerald-700 bg-emerald-50 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Tienda Silao</span>
            </button>

            {/* Acceso Directo a Ofertas de Supermercados */}
            <button
              onClick={() => {
                setActiveTab('tienda');
                setTimeout(() => {
                  const el = document.getElementById('seccion-ofertas-supermercados');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 80);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold shadow-2xs"
            >
              <span>🛒</span>
              <span>Ofertas de Súper</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* Negocio Tab (Solo si es rol negocio o admin) */}
            {(userRole === 'negocio' || userRole === 'admin') && (
              <button
                onClick={() => setActiveTab('mi_negocio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'mi_negocio'
                    ? 'text-amber-700 bg-amber-50 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-amber-600" />
                <span>Mi Negocio</span>
              </button>
            )}

            {/* Finanzas Tab (Solo admin) */}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('finanzas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'finanzas'
                    ? 'text-emerald-800 bg-emerald-100/70 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Finanzas Hub</span>
              </button>
            )}

            {/* Hub Despacho / Drivers Tab (Solo admin) */}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('hub_pedidos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'hub_pedidos'
                    ? 'text-indigo-800 bg-indigo-100/80 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Hub Despacho</span>
              </button>
            )}

            {/* Comercios Afiliados (Solo admin) */}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsMerchantManagerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Comercios</span>
              </button>
            )}

            {/* Inventario Tab (Solo Negocio y Admin - Confidencial para clientes) */}
            {(userRole === 'negocio' || userRole === 'admin') && (
              <button
                onClick={() => setActiveTab('inventario')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'inventario'
                    ? 'text-emerald-700 bg-emerald-50 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{userRole === 'negocio' ? 'Mi Inventario' : 'Inventario'}</span>
              </button>
            )}

            {/* Pedidos Tab */}
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'text-blue-700 bg-blue-50 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{userRole === 'negocio' ? 'Mis Ventas / Pedidos' : userRole === 'cliente' ? 'Mis Pedidos' : 'Pedidos'}</span>
            </button>
          </nav>

          {/* Zone 3: Role Selector Badge, Brochure, Tariff, Scanner, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Folleto para Negocios Button (Solo visible para Negocios y Administrador) */}
            {userRole !== 'cliente' && (
              <button
                onClick={() => setIsBrochureModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Ver Folleto Oficial de Afiliación (0% Entrada, 8-18% Comisión, 7 Días Liquidación)"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden sm:inline">Folleto Negocios</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400 text-emerald-950 font-black">
                  0%
                </span>
              </button>
            )}

            {/* Role Access Indicator / Switcher */}
            {userRole !== 'cliente' ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-slate-900 text-amber-300 border-slate-800'
                    : 'bg-emerald-700 text-white border-emerald-600'
                }`}
                title="Cambiar rol o sesión"
              >
                {userRole === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Admin Hub</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="hidden sm:inline max-w-[100px] truncate">{loggedMerchant?.name || 'Mi Negocio'}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                {registeredCustomer ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab('pedidos')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title={`Cliente Registrado: ${registeredCustomer.name || 'Cliente'} (${registeredCustomer.phone || ''}). Clic para ver tus pedidos.`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="hidden sm:inline font-extrabold text-emerald-800">Registrado:</span>
                      <span className="max-w-[100px] truncate">{((registeredCustomer.name || 'Cliente').split(' ')[0])}</span>
                    </button>
                    <button
                      onClick={() => logoutCustomer()}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Cerrar sesión de cliente"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Regístrate para obtener estatus de Cliente Registrado y rastrear pedidos"
                  >
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Registrarme</span>
                  </button>
                )}
                {/* Enlace discreto para comercios que deseen iniciar sesión sin saturar la barra del cliente */}
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                  title="Acceso para Negocios Afiliados y Administración Central"
                >
                  <Store className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Acceso Negocios</span>
                </button>
              </div>
            )}

            {/* Logout button if logged as merchant or admin */}
            {userRole !== 'cliente' && (
              <button
                onClick={logoutRole}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Cerrar sesión y volver a la selección de perfiles"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}

            {/* Pricing Rules & Policies Trigger (Solo Negocio y Admin - No aporta valor al cliente) */}
            {userRole !== 'cliente' && (
              <button
                type="button"
                onClick={() => setIsPricingRulesOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                title="Conoce cómo operan los Precios Comerciales estándar, Mayoreo por piezas y Ofertas de cada tienda"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reglas de Precios</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  PVP / Mayoreo
                </span>
              </button>
            )}

            {/* Scanner Trigger (Solo Negocios y Admin para control interno) */}
            {userRole !== 'cliente' && (
              <button
                onClick={() => openScanner('store')}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                title="Lector de código de barras y QR"
              >
                <Scan className="w-4 h-4 text-blue-600" />
              </button>
            )}

            {/* Settings Trigger - Exclusivo para Administración Central */}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Configuración de Pedidos y Entregas (Hub Silao)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Manual de Usuario / Operaciones Trigger */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Consultar y Descargar Manual de Usuario y Operación (PDF)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">Manual (PDF)</span>
            </button>

            {/* Cart Trigger - Primordial para Clientes */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-xs font-semibold text-xs"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingBag className="w-4 h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="ml-1 sm:ml-1.5 bg-amber-400 text-emerald-950 text-[11px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('tienda')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'tienda' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Store className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Tienda</span>
        </button>

        {/* Acceso Directo Móvil a Ofertas de Supermercados */}
        <button
          onClick={() => {
            setActiveTab('tienda');
            setTimeout(() => {
              const el = document.getElementById('seccion-ofertas-supermercados');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 80);
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer text-amber-800 font-bold"
        >
          <span className="text-sm mb-0.5">🛒</span>
          <span className="text-[10px]">Súper</span>
        </button>

        {/* Inventario Tab (Solo Negocio y Admin - NUNCA para clientes) */}
        {(userRole === 'negocio' || userRole === 'admin') && (
          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'inventario' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Inventario</span>
          </button>
        )}

        {userRole === 'negocio' && (
          <button
            onClick={() => setActiveTab('mi_negocio')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'mi_negocio' ? 'text-amber-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Building2 className="w-4 h-4 mb-0.5 text-amber-600" />
            <span className="text-[10px]">Mi Negocio</span>
          </button>
        )}

        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('finanzas')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'finanzas' ? 'text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <DollarSign className="w-4 h-4 mb-0.5 text-emerald-600" />
            <span className="text-[10px]">Finanzas</span>
          </button>
        )}

        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('hub_pedidos')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'hub_pedidos' ? 'text-indigo-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Truck className="w-4 h-4 mb-0.5 text-indigo-600" />
            <span className="text-[10px]">Despacho</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'pedidos' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{userRole === 'cliente' ? 'Mis Pedidos' : 'Pedidos'}</span>
        </button>

        {/* Botón Carrito en Navegación Móvil para Clientes (Alto valor) */}
        {userRole === 'cliente' && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors text-emerald-700 font-bold relative cursor-pointer"
            aria-label="Abrir Carrito"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 mb-0.5 text-emerald-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-emerald-950 text-[9px] font-black h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Carrito</span>
          </button>
        )}

        {/* Manual de Usuario Móvil */}
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-xs transition-colors text-emerald-800 cursor-pointer"
          title="Ver o descargar manual de usuario"
        >
          <BookOpen className="w-4 h-4 mb-0.5 text-emerald-700" />
          <span className="text-[10px]">Manual</span>
        </button>

        {/* Acceso para negocios y administración */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors text-slate-500 cursor-pointer"
          title={userRole === 'cliente' ? 'Acceso para negocios afiliados' : 'Cambiar perfil'}
        >
          {userRole === 'admin' ? (
            <ShieldCheck className="w-4 h-4 mb-0.5 text-amber-500" />
          ) : userRole === 'negocio' ? (
            <Store className="w-4 h-4 mb-0.5 text-emerald-600" />
          ) : (
            <Store className="w-4 h-4 mb-0.5 text-slate-400" />
          )}
          <span className="text-[10px]">{userRole === 'admin' ? 'Admin' : userRole === 'negocio' ? 'Negocio' : 'Negocios'}</span>
        </button>
      </nav>

      {/* Modal Explicativo de Reglas de Precios */}
      {isPricingRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Estructura y Reglas de Precios</h3>
                  <p className="text-xs text-slate-300">SilaoMarket On Line · Comercio Justo y Consolidado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingRulesOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Regla 1: Precio Comercial */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono">1</span>
                  <span>Estándar Inicial: Precio Comercial (PVP)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Para todos los clientes y comercios afiliados de Silao, el precio base inicial al consultar o comprar por pieza individual es el <strong>Precio Comercial estándar</strong> fijado por cada comercio.
                </p>
              </div>

              {/* Regla 2: Mayoreo Opcional y Piezas Mínimas */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-mono">2</span>
                  <span>Precios a Mayoreo (Opcional por Tienda)</span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed pl-8">
                  El mayoreo es <strong>opcional</strong> para cada tienda. Cada negocio configura si lo habilita y el <strong>número de piezas mínimas</strong> requerido (ej. a partir de 3 o más piezas). Al alcanzar ese número en tu carrito o pedido, el precio de mayoreo se activa automáticamente.
                </p>
              </div>

              {/* Regla 3: Ofertas Ya Declaradas */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-mono">3</span>
                  <span>Ofertas Ya Declaradas (Vigentes desde 1 pieza)</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed pl-8">
                  Los productos con <strong>ofertas ya declaradas</strong> (folletos digitales oficiales de Bodega Aurrera, Soriana, Tiendas 3B, Super Bara y descuentos directos de temporada) aplican su precio de oferta <strong>desde la primera pieza</strong>.
                </p>
              </div>

              {/* Regla 4: Promociones Especiales */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-mono">4</span>
                  <span>Promociones Especiales por Negocio</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed pl-8">
                  Cada comercio local puede habilitar promociones especiales de temporada o por volumen según sus propios términos comerciales.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPricingRulesOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
