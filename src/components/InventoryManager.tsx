import React, { useState, useMemo } from 'react';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit3, 
  Trash2, 
  Printer, 
  CheckCircle, 
  X,
  Layers,
  LayoutGrid,
  List,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, Brand, Category, MovementType } from '../types/inventory';
import { ProductVisual } from './ProductVisual';

export const InventoryManager: React.FC = () => {
  const { 
    products, 
    quickAdjustStock, 
    addStockMovement, 
    deleteProduct, 
    resetToInitial,
    openProductModal,
    syncStatus,
    refreshFromServer,
    setActiveTab
  } = useInventory();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<MovementType>('entrada');
  const [movementQuantity, setMovementQuantity] = useState<number>(5);
  const [movementReason, setMovementReason] = useState<string>('Reabastecimiento de proveedor');
  const [movementReference, setMovementReference] = useState<string>('FACT-2026-');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // KPIs Calculations
  const totalPieces = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock, 0);
  }, [products]);

  const totalCommercialValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.commercialPrice * p.stock, 0);
  }, [products]);

  const totalWholesaleValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.wholesalePrice * p.stock, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stock === 0).length;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.presentation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchBrand =
        brandFilter === 'all' ||
        p.brand.toLowerCase() === brandFilter.toLowerCase() ||
        (brandFilter === 'Aquaphor' && p.brand.includes('Aquaphor')) ||
        (brandFilter === 'Eucerin' && p.brand.includes('Eucerin'));

      const matchStock =
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'out' && p.stock === 0) ||
        (stockStatusFilter === 'low' && p.stock > 0 && p.stock <= p.minStockAlert) ||
        (stockStatusFilter === 'normal' && p.stock > p.minStockAlert);

      return matchSearch && matchBrand && matchStock;
    });
  }, [products, searchTerm, brandFilter, stockStatusFilter]);

  // Movement Submit
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMovement) return;

    const success = addStockMovement(
      selectedProductForMovement.id,
      movementType,
      movementQuantity,
      movementReason,
      movementReference
    );

    if (success) {
      showToast(
        `Movimiento registrado: ${movementType === 'entrada' ? '+' : '-'}${movementQuantity} pzas para ${selectedProductForMovement.name}`
      );
      setMovementModalOpen(false);
      setSelectedProductForMovement(null);
    }
  };

  const openMovementForProduct = (prod: Product, type: MovementType) => {
    setSelectedProductForMovement(prod);
    setMovementType(type);
    setMovementQuantity(type === 'entrada' ? 5 : 1);
    setMovementReason(
      type === 'entrada'
        ? 'Recepción de pedido de compra'
        : 'Salida de almacén / Venta directa'
    );
    setMovementModalOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Producto y Presentación',
      'Categoría / Marca',
      'Precio Comercial (MXN)',
      'Precio Mayorista (-40%)',
      'Precio Promoción (-60%)',
      'Stock Actual',
      'Alerta Stock',
      'Valor Inventario Comercial',
    ];

    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name} - ${p.presentation}"`,
      `"${p.brand}"`,
      p.commercialPrice.toFixed(2),
      p.wholesalePrice.toFixed(2),
      p.promoPrice.toFixed(2),
      p.stock,
      p.stock <= p.minStockAlert ? 'BAJO' : 'OK',
      (p.commercialPrice * p.stock).toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Inventario_DermoStock_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reporte CSV de inventario generado.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-sm animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            Panel de Control de Inventarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de stock, control de existencias, precios y movimientos del catálogo oficial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              await refreshFromServer();
              showToast('Datos sincronizados correctamente con la nube.');
            }}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Sincronizar datos y fotos con el servidor para que coincidan en PC y Celular"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            <span>{syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar Nube'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className="flex items-center gap-1.5 py-2 px-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Ver panel de control con gráficas Recharts de ventas por marca y stock crítico"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Ver Reportes</span>
          </button>

          <button
            onClick={() => openProductModal(null)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Exportar inventario a Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Imprimir reporte de existencias"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Deseas restablecer el inventario al estado original exacto del archivo inicial (18 productos y 58 piezas)?'
                )
              ) {
                resetToInitial();
                showToast('Inventario restablecido al estado original del archivo.');
              }
            }}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Restablecer a datos del archivo PDF"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Archivo</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Piezas en Existencia */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total en Existencia</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1 block">
              {totalPieces} <span className="text-xs font-normal text-slate-500">piezas</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              En {products.length} productos catalogados
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Valor Comercial */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Valor a Precio Comercial</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1 block">
              ${totalCommercialValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">PVP Al Público (MXN)</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Valor Mayorista */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Valor a Precio Mayorista</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1 block">
              ${totalWholesaleValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Costo Mayorista (-40%)</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Alertas de Stock Bajo */}
        <div 
          onClick={() => setActiveTab('reportes')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
          title="Ver diagnóstico gráfico de Stock Crítico en el panel de reportes"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 block">Stock Crítico o Agotado</span>
              <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">Ver Gráfica →</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
                {lowStockCount}
              </span>
              <span className="text-xs text-amber-600 font-medium">bajos</span>
              {outOfStockCount > 0 && (
                <span className="text-xs text-rose-600 font-bold">
                  / {outOfStockCount} agotados
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Requieren reorden</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-100 transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Critical Stock Alert Banner if any */}
      {lowStockCount + outOfStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Atención: Hay {lowStockCount + outOfStockCount} productos con nivel de inventario bajo o en cero.
              </h4>
              <p className="text-xs text-amber-700">
                Varios productos del archivo cuentan con 1 pieza restante (ej. Nivea Familiar 650ml, Eucerin Advanced Repair 1000ml, Eucerin pH5). Se recomienda generar orden de compra a proveedor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('reportes')}
              className="py-1.5 px-3 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              📊 Ver Gráfica de Stock Crítico
            </button>
            <button
              onClick={() => {
                setStockStatusFilter(stockStatusFilter === 'low' ? 'all' : 'low');
              }}
              className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              {stockStatusFilter === 'low' ? 'Ver Todos' : 'Filtrar Productos'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            key="inventory-search-input"
            type="text"
            placeholder="Buscar por producto, presentación, SKU..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Marca:</span>
            <select
              value={brandFilter ?? 'all'}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Marcas</option>
              <option value="Nivea">Nivea</option>
              <option value="Eucerin">Eucerin</option>
              <option value="Aquaphor">Aquaphor</option>
              <option value="Nivea Men">Nivea Men</option>
              <option value="Aquaphor Baby">Aquaphor Baby</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Estado:</span>
            <select
              value={stockStatusFilter ?? 'all'}
              onChange={(e: any) => setStockStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todo el Inventario</option>
              <option value="normal">Stock Normal (&gt;2)</option>
              <option value="low">Stock Crítico (≤2)</option>
              <option value="out">Agotados (0)</option>
            </select>
          </div>

          {/* View Mode Switcher (Tabla vs Tarjetas para Celular) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en Tabla Completa (ideal para monitores y PC)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabla (PC)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en Tarjetas Adaptables (ideal para celular)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas (Celular)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Display: Cards Mode or Table Mode */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between px-1">
            <span>Mostrando {filteredProducts.length} productos en modo tarjetas</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">Ideal para pantalla táctil y celular</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              No se encontraron productos coincidentes con los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Card Header: Photo + Info */}
                  <div className="flex gap-3 items-start">
                    <button
                      type="button"
                      onClick={() => openProductModal(prod)}
                      className="group relative w-16 h-16 shrink-0 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500 flex items-center justify-center p-1 overflow-hidden transition-all shadow-xs cursor-pointer"
                      title="Clic para cambiar fotografía o editar producto"
                    >
                      <ProductVisual product={prod} size="sm" className="h-14 w-14 border-0" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Edit3 className="w-4 h-4" />
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {prod.brand}
                        </span>
                        {prod.stock === 0 ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Agotado
                          </span>
                        ) : prod.stock <= prod.minStockAlert ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Crítico ({prod.stock})
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Stock OK
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm mt-1 leading-snug line-clamp-2">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {prod.sku} · {prod.presentation}
                      </p>
                    </div>
                  </div>

                  {/* 3 Price Tiers Grid */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 grid grid-cols-3 gap-1 text-center">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-medium">PVP Com.</span>
                      <span className="block text-xs font-bold text-slate-900 font-mono mt-0.5">
                        ${prod.commercialPrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-blue-600 font-medium">Mayoreo (-40%)</span>
                      <span className="block text-xs font-bold text-blue-700 font-mono mt-0.5">
                        ${prod.wholesalePrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-600 font-medium">Promo (-60%)</span>
                      <span className="block text-xs font-bold text-emerald-700 font-mono mt-0.5">
                        ${prod.promoPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Stock Stepper & Quick Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-600">Stock:</span>
                      <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (prod.stock > 0) quickAdjustStock(prod.id, -1);
                          }}
                          disabled={prod.stock <= 0}
                          className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-sm font-bold cursor-pointer"
                          title="Restar 1 pieza"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm text-slate-900 px-2 min-w-[32px] text-center tabular-nums">
                          {prod.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => quickAdjustStock(prod.id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-emerald-600 hover:bg-slate-100 font-mono text-sm font-bold cursor-pointer"
                          title="Sumar 1 pieza"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openMovementForProduct(prod, 'entrada')}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg border border-slate-200 cursor-pointer"
                        title="Registrar Entrada (+)"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openMovementForProduct(prod, 'salida')}
                        disabled={prod.stock <= 0}
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg border border-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Registrar Salida (-)"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openProductModal(prod)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-slate-200 cursor-pointer"
                        title="Editar Producto y Foto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar "${prod.name}" del catálogo?`)) {
                            deleteProduct(prod.id);
                            showToast(`Producto ${prod.name} eliminado.`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Main Inventory Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="sm:hidden px-3 py-2 bg-blue-50 border-b border-blue-100 text-[11px] text-blue-800 flex items-center justify-between">
            <span>Desliza a la derecha para ver todas las columnas →</span>
            <button 
              onClick={() => setViewMode('cards')}
              className="font-bold underline cursor-pointer ml-2"
            >
              Cambiar a Tarjetas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Producto y Presentación</th>
                  <th className="py-3 px-4">Categoría / Marca</th>
                  <th className="py-3 px-4 text-right">P. Comercial</th>
                  <th className="py-3 px-4 text-right">Mayoreo (-40%)</th>
                  <th className="py-3 px-4 text-right">Promo (-60%)</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No se encontraron productos coincidentes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Visual / Foto con botón de edición rápida */}
                      <td className="py-2.5 px-4 w-16">
                        <button
                          type="button"
                          onClick={() => openProductModal(prod)}
                          className="group relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500 flex items-center justify-center p-0.5 overflow-hidden transition-all shadow-xs cursor-pointer"
                          title="Clic para cambiar fotografía o editar producto"
                        >
                          <ProductVisual product={prod} size="sm" className="h-10 w-10 border-0" />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      </td>

                      {/* Product Name & SKU */}
                      <td className="py-2.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-600">{prod.sku}</span>
                          <span>·</span>
                          <span>{prod.presentation}</span>
                        </div>
                      </td>

                      {/* Brand / Category */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 block">{prod.brand}</span>
                        <span className="text-[10px] text-slate-500 block">{prod.category}</span>
                      </td>

                      {/* Commercial Price */}
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        ${prod.commercialPrice.toFixed(2)}
                      </td>

                      {/* Wholesale (-40%) */}
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-blue-700 tabular-nums whitespace-nowrap">
                        ${prod.wholesalePrice.toFixed(2)}
                      </td>

                      {/* Promo (-60%) */}
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-700 tabular-nums whitespace-nowrap">
                        ${prod.promoPrice.toFixed(2)}
                      </td>

                      {/* Stock with quick adjusters */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white shadow-xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (prod.stock > 0) quickAdjustStock(prod.id, -1);
                            }}
                            disabled={prod.stock <= 0}
                            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold cursor-pointer"
                            title="Restar 1 pieza"
                          >
                            -
                          </button>

                          <span className="font-mono font-bold text-sm text-slate-900 px-2 min-w-[28px] text-center tabular-nums">
                            {prod.stock}
                          </span>

                          <button
                            type="button"
                            onClick={() => quickAdjustStock(prod.id, 1)}
                            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-emerald-600 hover:bg-slate-100 font-mono text-xs font-bold cursor-pointer"
                            title="Sumar 1 pieza"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        {prod.stock === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Agotado
                          </span>
                        ) : prod.stock <= prod.minStockAlert ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Crítico ({prod.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Óptimo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openMovementForProduct(prod, 'entrada')}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Registrar Entrada de Mercancía (+)"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openMovementForProduct(prod, 'salida')}
                            disabled={prod.stock <= 0}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Registrar Salida / Merma (-)"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openProductModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Editar Producto, Precios y Fotografía"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar "${prod.name}" del catálogo?`)) {
                                deleteProduct(prod.id);
                                showToast(`Producto ${prod.name} eliminado.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Eliminar Producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MOVIMIENTO (ENTRADA / SALIDA) */}
      {movementModalOpen && selectedProductForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-base">
                Registrar Movimiento de Inventario
              </h3>
              <button
                onClick={() => setMovementModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="p-6 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Producto:</span>
                <span className="font-semibold text-slate-900 text-sm block">
                  {selectedProductForMovement.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Stock actual: {selectedProductForMovement.stock} piezas
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('entrada');
                      setMovementReason('Recepción de pedido de compra');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-medium cursor-pointer ${
                      movementType === 'entrada'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Entrada (Reabastecer)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('salida');
                      setMovementReason('Salida de almacén / Ajuste');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-medium cursor-pointer ${
                      movementType === 'salida'
                        ? 'bg-amber-50 border-amber-600 text-amber-800 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Salida (Venta/Merma)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cantidad de Piezas *
                </label>
                <input
                  key="movement-quantity-input"
                  type="number"
                  min="1"
                  max={movementType === 'salida' ? selectedProductForMovement.stock : 9999}
                  required
                  value={Number.isFinite(movementQuantity) ? movementQuantity : ''}
                  onChange={(e) => setMovementQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Motivo / Concepto
                </label>
                <input
                  key="movement-reason-input"
                  type="text"
                  required
                  value={movementReason || ''}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  No. de Factura / Remisión / Referencia
                </label>
                <input
                  key="movement-reference-input"
                  type="text"
                  value={movementReference || ''}
                  onChange={(e) => setMovementReference(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovementModalOpen(false)}
                  className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Aplicar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
