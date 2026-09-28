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
    scannerMode
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
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-serif font-bold text-slate-900 text-sm">Silaomarket on line</span>
            <span className="mx-2">·</span>
            <span>Comercios Locales de Silao, Guanajuato · Hub Central de Consolidación</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Rastreo de Pedidos con Código QR 📱</span>
            <span>·</span>
            <span>Cadena de Frío Garantizada ❄️</span>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} Silaomarket on line · Silao, Guanajuato.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainContent />
    </InventoryProvider>
  );
}
