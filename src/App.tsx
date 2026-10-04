import React, { lazy, Suspense, useEffect } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { ProductQuickView } from './components/ProductQuickView';
import { ProductEditModal } from './components/ProductEditModal';
import { AuthModal } from './components/AuthModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { OrdersHistory } from './components/OrdersHistory';
import { InitialAccessGate } from './components/InitialAccessGate';
import { ErrorBoundary } from './components/ErrorBoundary';

// Dynamic lazy imports for dashboards and modals to split chunks and speed up initial load
const ReportsDashboard = lazy(() => import('./components/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })));
const FinancialDashboard = lazy(() => import('./components/FinancialDashboard').then(m => ({ default: m.FinancialDashboard })));
const BarcodeScannerModal = lazy(() => import('./components/BarcodeScannerModal').then(m => ({ default: m.BarcodeScannerModal })));
const BrochureModal = lazy(() => import('./components/BrochureModal').then(m => ({ default: m.BrochureModal })));
const UserManualModal = lazy(() => import('./components/UserManualModal').then(m => ({ default: m.UserManualModal })));
const MerchantsManager = lazy(() => import('./components/MerchantsManager').then(m => ({ default: m.MerchantsManager })));
const HubOrdersManager = lazy(() => import('./components/HubOrdersManager').then(m => ({ default: m.HubOrdersManager })));
const InventoryManager = lazy(() => import('./components/InventoryManager').then(m => ({ default: m.InventoryManager })));
const MerchantPortal = lazy(() => import('./components/MerchantPortal').then(m => ({ default: m.MerchantPortal })));
const MovementsHistory = lazy(() => import('./components/MovementsHistory').then(m => ({ default: m.MovementsHistory })));
const DeviceSyncModal = lazy(() => import('./components/DeviceSyncModal').then(m => ({ default: m.DeviceSyncModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const CustomOrderModal = lazy(() => import('./components/CustomOrderModal').then(m => ({ default: m.CustomOrderModal })));
const OrderTrackingModal = lazy(() => import('./components/OrderTrackingModal').then(m => ({ default: m.OrderTrackingModal })));

const ModalFallback: React.FC = () => null;

const MainContent: React.FC = () => {
  const { 
    orders,
    activeTab, 
    lastCompletedOrder, 
    setLastCompletedOrder,
    activeTrackingOrder,
    openTrackingModal,
    closeTrackingModal,
    isSyncModalOpen,
    setIsSyncModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isScannerOpen,
    closeScanner,
    scannerMode,
    isBrochureModalOpen,
    setIsBrochureModalOpen,
    isManualModalOpen,
    setIsManualModalOpen,
    isCustomOrderModalOpen,
    isMerchantManagerOpen,
    setIsAuthModalOpen,
    userRole,
    hasAccessSelected
  } = useInventory();

  // If page was loaded via QR scan link (e.g., /?rastreo=SLO-TRK-101), open tracking modal automatically
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const trackingParam = params.get('rastreo');
      if (trackingParam && orders.length > 0) {
        const found = orders.find(o => 
          (o.trackingCode && o.trackingCode.toLowerCase() === trackingParam.trim().toLowerCase()) ||
          (o.id && o.id.toLowerCase() === trackingParam.trim().toLowerCase())
        );
        if (found) {
          openTrackingModal(found);
        }
      }
    }
  }, [orders, openTrackingModal]);

  // Initial access gateway before entering main application
  if (!hasAccessSelected) {
    return (
      <>
        <InitialAccessGate />
        <Suspense fallback={<ModalFallback />}>
          {isBrochureModalOpen && <BrochureModal />}
          {isManualModalOpen && <UserManualModal />}
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* Top Bar following contract */}
      <Navbar />

      {/* Main View Router with Strict Role Guards & Suspense */}
      <main className="flex-1 pb-16 md:pb-0">
        <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Cargando módulo...</div>}>
          {activeTab === 'tienda' && <Storefront />}
          {activeTab === 'inventario' && (userRole === 'cliente' ? <Storefront /> : <InventoryManager />)}
          {activeTab === 'mi_negocio' && (userRole === 'cliente' ? <Storefront /> : <MerchantPortal />)}
          {activeTab === 'finanzas' && (userRole === 'admin' ? <FinancialDashboard /> : <Storefront />)}
          {activeTab === 'hub_pedidos' && (userRole === 'admin' ? <HubOrdersManager /> : <Storefront />)}
          {activeTab === 'reportes' && (userRole === 'admin' ? <ReportsDashboard /> : <Storefront />)}
          {activeTab === 'movimientos' && (userRole === 'cliente' ? <Storefront /> : <MovementsHistory />)}
          {activeTab === 'pedidos' && <OrdersHistory />}
          {/* Router Fallback para evitar pantalla en blanco si no hay coincidencia */}
          {!['tienda', 'inventario', 'mi_negocio', 'finanzas', 'hub_pedidos', 'reportes', 'movimientos', 'pedidos'].includes(activeTab) && <Storefront />}
        </Suspense>
      </main>

      {/* Persistent lightweight slide-overs and core modals */}
      <CartDrawer />
      <ProductQuickView />
      <ProductEditModal />
      <AuthModal />

      {/* Heavy modals loaded on-demand via Suspense */}
      <Suspense fallback={<ModalFallback />}>
        {isSyncModalOpen && (
          <DeviceSyncModal 
            isOpen={isSyncModalOpen} 
            onClose={() => setIsSyncModalOpen(false)} 
          />
        )}
        {isSettingsModalOpen && (
          <SettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        )}
        {isScannerOpen && (
          <BarcodeScannerModal
            isOpen={isScannerOpen}
            onClose={closeScanner}
            initialMode={scannerMode}
          />
        )}
        {isCustomOrderModalOpen && <CustomOrderModal />}
        {isBrochureModalOpen && <BrochureModal />}
        {isManualModalOpen && <UserManualModal />}
        {isMerchantManagerOpen && <MerchantsManager />}
        {Boolean(activeTrackingOrder) && (
          <OrderTrackingModal
            order={activeTrackingOrder}
            isOpen={Boolean(activeTrackingOrder)}
            onClose={closeTrackingModal}
          />
        )}
        {Boolean(lastCompletedOrder) && (
          <OrderReceiptModal
            order={lastCompletedOrder}
            onClose={() => setLastCompletedOrder(null)}
          />
        )}
      </Suspense>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto py-10 relative overflow-hidden">
        {/* Cristo Rey background watermark in footer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none"
          style={{ backgroundImage: `url('/images/cristo_rey_silao.jpg')` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3 text-center md:text-left">
              <img 
                src="/images/silaomarket_logo.jpg" 
                alt="Silaomarket Logo" 
                className="w-12 h-12 rounded-xl object-contain bg-white p-0.5 border border-amber-400/40"
              />
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2 justify-center md:justify-start">
                  <span>Silaomarket on line</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Silao, Gto
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Plataforma municipal de consolidación multitienda · Hub Central Calle 5 de Mayo #45, Silao Centro
                </p>
                <p className="text-xs text-emerald-400 mt-0.5">
                  Afiliación oficial y soporte: <a href="mailto:hhlozano70@hotmail.com" className="underline font-bold text-amber-300">hhlozano70@hotmail.com</a>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>📖 Manual de Usuario (PDF)</span>
              </button>
              <button
                onClick={() => setIsBrochureModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold transition-all cursor-pointer"
              >
                📄 Ver Folleto para Negocios (0% Entrada)
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                🔐 Acceso Clientes y Negocios
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} Silaomarket on line · Silao de la Victoria, Guanajuato, México. Todos los derechos reservados.
            </p>
            <p className="text-amber-400/80 font-medium">
              Orgullo Silaoense · Corazón del Bajío · Cerro del Cubilete & Cristo Rey
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <InventoryProvider>
        <MainContent />
      </InventoryProvider>
    </ErrorBoundary>
  );
}

export default App;
