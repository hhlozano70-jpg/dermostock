import React, { useEffect } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { InventoryManager } from './components/InventoryManager';
import { MovementsHistory } from './components/MovementsHistory';
import { OrdersHistory } from './components/OrdersHistory';
import { ReportsDashboard } from './components/ReportsDashboard';
import { CartDrawer } from './components/CartDrawer';
import { ProductQuickView } from './components/ProductQuickView';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ProductEditModal } from './components/ProductEditModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SilaoEmblem } from './components/SilaoEmblem';
import { BrochureModal } from './components/BrochureModal';
import { AuthModal } from './components/AuthModal';
import { MerchantPortal } from './components/MerchantPortal';
import { FinancialDashboard } from './components/FinancialDashboard';
import { MerchantsManager } from './components/MerchantsManager';

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
    setIsBrochureModalOpen,
    setIsAuthModalOpen
  } = useInventory();

  // If page was loaded via QR scan link (e.g., /?rastreo=SLO-TRK-101), open tracking modal automatically
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const trackingParam = params.get('rastreo');
      if (trackingParam && orders.length > 0) {
        const found = orders.find(o => 
          o.trackingCode.toLowerCase() === trackingParam.trim().toLowerCase() ||
          o.id.toLowerCase() === trackingParam.trim().toLowerCase()
        );
        if (found) {
          openTrackingModal(found);
        }
      }
    }
  }, [orders, openTrackingModal]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* Top Bar following contract */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'tienda' && <Storefront />}
        {activeTab === 'inventario' && <InventoryManager />}
        {activeTab === 'mi_negocio' && <MerchantPortal />}
        {activeTab === 'finanzas' && <FinancialDashboard />}
        {activeTab === 'reportes' && <ReportsDashboard />}
        {activeTab === 'movimientos' && <MovementsHistory />}
        {activeTab === 'pedidos' && <OrdersHistory />}
      </main>

      {/* Persistent slide-overs and modals */}
      <CartDrawer />
      <ProductQuickView />
      <ProductEditModal />
      <DeviceSyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={closeScanner}
        initialMode={scannerMode}
      />

      {/* Role Access Control Modal */}
      <AuthModal />

      {/* Official 2-Page Business Brochure & Commission Table Modal */}
      <BrochureModal />

      {/* Affiliated Merchants Manager CRUD Modal */}
      <MerchantsManager />

      {/* Live Order Tracking Modal with QR Code */}
      <OrderTrackingModal
        order={activeTrackingOrder}
        isOpen={Boolean(activeTrackingOrder)}
        onClose={closeTrackingModal}
      />

      {/* Automatic receipt popup upon completing an order */}
      <OrderReceiptModal
        order={lastCompletedOrder}
        onClose={() => setLastCompletedOrder(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
    <InventoryProvider>
      <MainContent />
    </InventoryProvider>
  );
}

export default App;
