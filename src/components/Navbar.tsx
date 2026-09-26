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
  Scan
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PriceTier } from '../types/inventory';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    cartCount, 
    setIsCartOpen,
    priceTier, 
    setPriceTier,
    syncStatus,
    lastSyncTime,
    refreshFromServer,
    setIsSyncModalOpen,
    setIsSettingsModalOpen,
    openScanner
  } = useInventory();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Zone 1: Wordmark & Sync Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('tienda')}
              className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 hover:text-blue-900 transition-colors cursor-pointer text-left font-serif"
            >
              DermoStock
            </button>

            {/* Cloud Sync Status Indicator */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              title={`Sincronización en la nube: ${syncStatus}. Clic para ver opciones de sincronización PC y Celular.`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                  <span className="hidden sm:inline text-blue-600 font-semibold">Sincronizando...</span>
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline text-slate-700 font-semibold">Sincronizado</span>
                  <Cloud className="w-3 h-3 text-blue-500 ml-0.5" />
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline text-amber-700">Sin conexión</span>
                </>
              )}
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('tienda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'tienda'
                  ? 'text-blue-700 bg-blue-50 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Tienda</span>
            </button>

            <button
              onClick={() => setActiveTab('inventario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'inventario'
                  ? 'text-blue-700 bg-blue-50 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Inventario</span>
            </button>

            <button
              onClick={() => setActiveTab('reportes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'reportes'
                  ? 'text-blue-700 bg-blue-50 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reportes</span>
            </button>

            <button
              onClick={() => setActiveTab('movimientos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'movimientos'
                  ? 'text-blue-700 bg-blue-50 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Movimientos</span>
            </button>

            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'text-blue-700 bg-blue-50 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Pedidos</span>
            </button>
          </nav>

          {/* Zone 3: Tariff selector & Cart button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tariff Selector (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setPriceTier('comercial')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap font-medium cursor-pointer ${
                  priceTier === 'comercial'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Precio Comercial Estándar PVP"
              >
                Comercial
              </button>
              <button
                onClick={() => setPriceTier('mayorista')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap font-medium cursor-pointer ${
                  priceTier === 'mayorista'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Descuento Mayorista del 40%"
              >
                Mayoreo (-40%)
              </button>
              <button
                onClick={() => setPriceTier('promocion')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap font-medium cursor-pointer ${
                  priceTier === 'promocion'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Precio Promoción con 60% de descuento"
              >
                Promo (-60%)
              </button>
            </div>

            {/* Barcode / QR Scanner Trigger */}
            <button
              onClick={() => openScanner('store')}
              className="flex items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              title="Lector de código de barras y QR (Cámara o Pistola USB)"
              aria-label="Abrir lector de código de barras"
            >
              <Scan className="w-5 h-5 text-blue-600" />
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              title="Configuración de WhatsApp para pedidos y entregas"
              aria-label="Abrir configuración de pedidos"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile secondary bar: Tariff Switcher for small screens */}
        <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500 text-[11px]">Tarifa:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPriceTier('comercial')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                priceTier === 'comercial'
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PVP
            </button>
            <button
              onClick={() => setPriceTier('mayorista')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                priceTier === 'mayorista'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mayoreo (-40%)
            </button>
            <button
              onClick={() => setPriceTier('promocion')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                priceTier === 'promocion'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Promo (-60%)
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Guarantees all views match and are easily accessible on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('tienda')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'tienda'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Tienda</span>
        </button>

        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'inventario'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Inventario</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'reportes'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Reportes</span>
        </button>

        <button
          onClick={() => setActiveTab('movimientos')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'movimientos'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Kardex</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs transition-colors cursor-pointer ${
            activeTab === 'pedidos'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Pedidos</span>
        </button>
      </nav>
    </>
  );
};
