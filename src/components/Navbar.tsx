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
  Truck
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PriceTier } from '../types/inventory';
import { SilaoEmblem } from './SilaoEmblem';

export const Navbar: React.FC = () => {
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
    setIsMerchantManagerOpen
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

            {/* Cloud Sync Status Indicator */}
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

            {/* Inventario / Gestión Tab */}
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
                <span>Inventario</span>
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
              <span>Pedidos</span>
            </button>
          </nav>

          {/* Zone 3: Role Selector Badge, Brochure, Tariff, Scanner, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Folleto para Negocios Button */}
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

            {/* Role Access Indicator / Switcher */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-slate-900 text-amber-300 border-slate-800'
                  : userRole === 'negocio'
                    ? 'bg-emerald-700 text-white border-emerald-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title="Cambiar rol (Cliente, Comercio Afiliado o Administrador)"
            >
              {userRole === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Hub</span>
                </>
              ) : userRole === 'negocio' ? (
                <>
                  <Store className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{loggedMerchant?.name || 'Mi Negocio'}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Cliente</span>
                </>
              )}
            </button>

            {/* Tariff Selector (Desktop) */}
            <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setPriceTier('comercial')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap text-[11px] cursor-pointer ${
                  priceTier === 'comercial'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PVP
              </button>
              <button
                onClick={() => setPriceTier('mayorista')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap text-[11px] cursor-pointer ${
                  priceTier === 'mayorista'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                -40%
              </button>
              <button
                onClick={() => setPriceTier('promocion')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap text-[11px] cursor-pointer ${
                  priceTier === 'promocion'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                -60%
              </button>
            </div>

            {/* Scanner Trigger */}
            <button
              onClick={() => openScanner('store')}
              className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
              title="Lector de código de barras y QR"
            >
              <Scan className="w-4 h-4 text-blue-600" />
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Configuración de WhatsApp y entregas"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[11px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs tabular-nums">
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
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'tienda' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Store className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Tienda</span>
        </button>

        {(userRole === 'negocio' || userRole === 'admin') && (
          <button
            onClick={() => setActiveTab('mi_negocio')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
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
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
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
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'hub_pedidos' ? 'text-indigo-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Truck className="w-4 h-4 mb-0.5 text-indigo-600" />
            <span className="text-[10px]">Despacho</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'pedidos' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Pedidos</span>
        </button>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors text-slate-500 cursor-pointer"
        >
          <User className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{userRole === 'admin' ? 'Admin' : userRole === 'negocio' ? 'Negocio' : 'Rol'}</span>
        </button>
      </nav>
    </>
  );
};
