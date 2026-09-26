import React from 'react';
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
import { ProductEditModal } from './components/ProductEditModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    lastCompletedOrder, 
    setLastCompletedOrder,
    isSyncModalOpen,
    setIsSyncModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isScannerOpen,
    closeScanner,
    scannerMode
  } = useInventory();

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

      {/* Automatic receipt popup upon completing an order */}
      <OrderReceiptModal
        order={lastCompletedOrder}
        onClose={() => setLastCompletedOrder(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-serif font-bold text-slate-800 text-sm">DermoStock</span>
            <span className="mx-2">·</span>
            <span>Tienda en Línea y Sistema ERP de Inventarios</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Catálogo Nivea · Eucerin · Aquaphor</span>
            <span>·</span>
            <span>18 SKUs en Gestión</span>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} DermoStock. Todos los derechos reservados.
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
