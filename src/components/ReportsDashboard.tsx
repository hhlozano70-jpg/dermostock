import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Download, 
  Printer, 
  Filter, 
  ArrowUpRight, 
  PlusCircle, 
  CheckCircle2, 
  Layers, 
  Calendar,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, Order, PriceTier } from '../types/inventory';

// Brand colors
const BRAND_COLORS: Record<string, string> = {
  Nivea: '#1E40AF',     // Nivea blue
  Eucerin: '#DC2626',   // Eucerin red/crimson
  Aquaphor: '#0284C7',  // Aquaphor sky/cyan
  Otras: '#64748B',     // Slate gray for any other brand
};

export const normalizeBrandName = (brand: string): 'Nivea' | 'Eucerin' | 'Aquaphor' | 'Otras' => {
  const b = (brand || '').toLowerCase().trim();
  if (b.includes('nivea')) return 'Nivea';
  if (b.includes('aquaphor')) return 'Aquaphor';
  if (b.includes('eucerin')) return 'Eucerin';
  return 'Otras';
};

export const ReportsDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    quickAdjustStock, 
    setActiveTab, 
    openProductModal,
    createOrder 
  } = useInventory();

  // Dashboard state & filters
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30d' | '7d' | 'today'>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [viewMetric, setViewMetric] = useState<'revenue' | 'units'>('revenue');
  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'ventas_marca' | 'stock_critico'>('resumen');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Filter orders based on period and tier
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter((order) => {
      // Tier filter
      if (selectedTierFilter !== 'all' && order.appliedTier !== selectedTierFilter) {
        return false;
      }

      // Period filter
      const orderTime = new Date(order.date).getTime();
      if (selectedPeriod === 'today') {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        return orderTime >= startOfToday;
      }
      if (selectedPeriod === '7d') {
        return now - orderTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (selectedPeriod === '30d') {
        return now - orderTime <= 30 * 24 * 60 * 60 * 1000;
      }
      return true; // 'all'
    });
  }, [orders, selectedPeriod, selectedTierFilter]);

  // Aggregate Sales by Brand (Nivea, Eucerin, Aquaphor, Otras)
  const salesByBrand = useMemo(() => {
    const summary: Record<
      'Nivea' | 'Eucerin' | 'Aquaphor' | 'Otras',
      { 
        brand: string; 
        totalRevenue: number; 
        unitsSold: number; 
        ordersCount: number;
        topProduct: string;
        productUnits: Record<string, number>;
      }
    > = {
      Nivea: { brand: 'Nivea', totalRevenue: 0, unitsSold: 0, ordersCount: 0, topProduct: '', productUnits: {} },
      Eucerin: { brand: 'Eucerin', totalRevenue: 0, unitsSold: 0, ordersCount: 0, topProduct: '', productUnits: {} },
      Aquaphor: { brand: 'Aquaphor', totalRevenue: 0, unitsSold: 0, ordersCount: 0, topProduct: '', productUnits: {} },
      Otras: { brand: 'Otras', totalRevenue: 0, unitsSold: 0, ordersCount: 0, topProduct: '', productUnits: {} },
    };

    filteredOrders.forEach((order) => {
      const brandsInOrder = new Set<string>();

      order.items.forEach((item) => {
        const brandKey = normalizeBrandName(item.product.brand);
        const revenue = (item.unitPrice || 0) * (item.quantity || 0);
        const qty = item.quantity || 0;

        summary[brandKey].totalRevenue += revenue;
        summary[brandKey].unitsSold += qty;
        brandsInOrder.add(brandKey);

        const pName = item.product.name;
        summary[brandKey].productUnits[pName] = (summary[brandKey].productUnits[pName] || 0) + qty;
      });

      brandsInOrder.forEach((bKey) => {
        if (summary[bKey as keyof typeof summary]) {
          summary[bKey as keyof typeof summary].ordersCount += 1;
        }
      });
    });

    // Determine top product for each brand
    Object.keys(summary).forEach((key) => {
      const bData = summary[key as keyof typeof summary];
      let maxQty = 0;
      let topP = 'Sin ventas registradas';
      Object.entries(bData.productUnits).forEach(([pName, qty]) => {
        if (qty > maxQty) {
          maxQty = qty;
          topP = `${pName} (${qty} pzas)`;
        }
      });
      bData.topProduct = topP;
    });

    return summary;
  }, [filteredOrders]);

  // Overall KPIs
  const totalRevenueAll = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const totalUnitsSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      return sum + o.items.reduce((s, i) => s + (i.quantity || 0), 0);
    }, 0);
  }, [filteredOrders]);

  const totalSavingsGiven = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.discountSavings || 0), 0);
  }, [filteredOrders]);

  // Data format for Recharts Bar Chart (Ventas Totales por Marca)
  const chartSalesData = useMemo(() => {
    const list = [salesByBrand.Nivea, salesByBrand.Eucerin, salesByBrand.Aquaphor];
    if (salesByBrand.Otras.unitsSold > 0 || salesByBrand.Otras.totalRevenue > 0) {
      list.push(salesByBrand.Otras);
    }

    return list.map((item) => {
      const percentageOfRevenue = totalRevenueAll > 0 
        ? Math.round((item.totalRevenue / totalRevenueAll) * 100) 
        : 0;

      return {
        brand: item.brand,
        totalRevenue: Math.round(item.totalRevenue),
        unitsSold: item.unitsSold,
        share: percentageOfRevenue,
        fill: BRAND_COLORS[item.brand] || '#64748B',
      };
    });
  }, [salesByBrand, totalRevenueAll]);

  // Data format for Recharts Pie Chart (% Share de Ventas por Marca)
  const pieShareData = useMemo(() => {
    return chartSalesData
      .filter((d) => (viewMetric === 'revenue' ? d.totalRevenue > 0 : d.unitsSold > 0))
      .map((d) => ({
        name: d.brand,
        value: viewMetric === 'revenue' ? d.totalRevenue : d.unitsSold,
        color: d.fill,
        share: d.share,
      }));
  }, [chartSalesData, viewMetric]);

  // Critical Stock Analysis
  const criticalProducts = useMemo(() => {
    return products
      .filter((p) => p.stock <= p.minStockAlert)
      .sort((a, b) => {
        // Out of stock first, then lowest stock
        if (a.stock === 0 && b.stock !== 0) return -1;
        if (b.stock === 0 && a.stock !== 0) return 1;
        return a.stock - b.stock;
      });
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stock === 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert);
  }, [products]);

  // Critical Stock by Brand for Bar Chart
  const criticalStockByBrand = useMemo(() => {
    const brandCounts: Record<string, { brand: string; normal: number; critico: number; agotado: number }> = {
      Nivea: { brand: 'Nivea', normal: 0, critico: 0, agotado: 0 },
      Eucerin: { brand: 'Eucerin', normal: 0, critico: 0, agotado: 0 },
      Aquaphor: { brand: 'Aquaphor', normal: 0, critico: 0, agotado: 0 },
      Otras: { brand: 'Otras', normal: 0, critico: 0, agotado: 0 },
    };

    products.forEach((p) => {
      const b = normalizeBrandName(p.brand);
      if (!brandCounts[b]) {
        brandCounts[b] = { brand: b, normal: 0, critico: 0, agotado: 0 };
      }

      if (p.stock === 0) {
        brandCounts[b].agotado += 1;
      } else if (p.stock <= p.minStockAlert) {
        brandCounts[b].critico += 1;
      } else {
        brandCounts[b].normal += 1;
      }
    });

    const res = [brandCounts.Nivea, brandCounts.Eucerin, brandCounts.Aquaphor];
    if (brandCounts.Otras.normal > 0 || brandCounts.Otras.critico > 0 || brandCounts.Otras.agotado > 0) {
      res.push(brandCounts.Otras);
    }
    return res;
  }, [products]);

  // Top Critical Products for Comparison Bar Chart (Stock Actual vs Umbral Mínimo)
  const criticalComparisonData = useMemo(() => {
    return criticalProducts.slice(0, 10).map((p) => ({
      name: p.name.length > 22 ? p.name.slice(0, 22) + '...' : p.name,
      fullName: p.name,
      sku: p.sku,
      brand: normalizeBrandName(p.brand),
      stockActual: p.stock,
      umbralMinimo: p.minStockAlert,
      deficit: Math.max(0, p.minStockAlert - p.stock + 1),
    }));
  }, [criticalProducts]);

  // Sales Over Time Trend for Area Chart
  const salesTrendData = useMemo(() => {
    if (filteredOrders.length === 0) return [];

    // Group by date (day)
    const dayMap: Record<string, { dateLabel: string; Nivea: number; Eucerin: number; Aquaphor: number; total: number }> = {};

    // Sort orders chronologically
    const sorted = [...filteredOrders].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((order) => {
      const d = new Date(order.date);
      const dayKey = `${d.getDate()}/${d.getMonth() + 1}`;

      if (!dayMap[dayKey]) {
        dayMap[dayKey] = {
          dateLabel: dayKey,
          Nivea: 0,
          Eucerin: 0,
          Aquaphor: 0,
          total: 0,
        };
      }

      order.items.forEach((item) => {
        const b = normalizeBrandName(item.product.brand);
        const rev = (item.unitPrice || 0) * (item.quantity || 0);
        if (b === 'Nivea') dayMap[dayKey].Nivea += Math.round(rev);
        else if (b === 'Eucerin') dayMap[dayKey].Eucerin += Math.round(rev);
        else if (b === 'Aquaphor') dayMap[dayKey].Aquaphor += Math.round(rev);
        dayMap[dayKey].total += Math.round(rev);
      });
    });

    return Object.values(dayMap);
  }, [filteredOrders]);

  // Best selling brand
  const topBrandLeader = useMemo(() => {
    let topB = salesByBrand.Nivea;
    if (salesByBrand.Eucerin.totalRevenue > topB.totalRevenue) topB = salesByBrand.Eucerin;
    if (salesByBrand.Aquaphor.totalRevenue > topB.totalRevenue) topB = salesByBrand.Aquaphor;
    return topB;
  }, [salesByBrand]);

  // Quick Restock handler (+5 pieces)
  const handleQuickRestock = (productId: string, productName: string) => {
    const success = quickAdjustStock(productId, 5);
    if (success) {
      showFeedback(`Se reabastecieron +5 unidades a "${productName}". Stock actualizado.`);
    }
  };

  // Quick test purchase simulator
  const handleSimulateQuickOrder = (brandTarget: 'Nivea' | 'Eucerin' | 'Aquaphor') => {
    const brandProducts = products.filter((p) => normalizeBrandName(p.brand) === brandTarget && p.stock > 0);
    if (brandProducts.length === 0) {
      showFeedback(`No hay stock disponible para simular venta de ${brandTarget}`);
      return;
    }

    const prod = brandProducts[0];
    const qty = Math.min(2, prod.stock);

    createOrder({
      customerName: `Cliente Prueba ${brandTarget}`,
      customerPhone: '55 1234 5678',
      deliveryType: 'sucursal',
      paymentMethod: 'efectivo',
      appliedTier: 'comercial',
      items: [
        {
          product: prod,
          quantity: qty,
          appliedTier: 'comercial',
          unitPrice: prod.commercialPrice,
        },
      ],
      subtotal: prod.commercialPrice * qty,
      discountSavings: 0,
      total: prod.commercialPrice * qty,
    });

    showFeedback(`¡Venta rápida de prueba de ${brandTarget} registrada con éxito! Gráficas actualizadas.`);
  };

  // Export CSV Report
  const handleExportCSVReport = () => {
    const headers = [
      'Marca',
      'Ventas Totales (MXN)',
      'Piezas Vendidas',
      'Pedidos Asociados',
      'Producto Estrella',
      'SKUs en Catálogo',
      'SKUs en Stock Crítico',
    ];

    const rows = [salesByBrand.Nivea, salesByBrand.Eucerin, salesByBrand.Aquaphor].map((b) => {
      const brandProducts = products.filter((p) => normalizeBrandName(p.brand) === b.brand);
      const critCount = brandProducts.filter((p) => p.stock <= p.minStockAlert).length;
      return [
        `"${b.brand}"`,
        b.totalRevenue.toFixed(2),
        b.unitsSold,
        b.ordersCount,
        `"${b.topProduct}"`,
        brandProducts.length,
        critCount,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Reporte_Ventas_Marcas_DermoStock_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{actionFeedback}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
                Panel de Control y Reportes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Métricas de ventas por marca (Nivea, Eucerin, Aquaphor) y diagnóstico preventivo de stock crítico.
              </p>
            </div>
          </div>
        </div>

        {/* Global Dashboard Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>

          <button
            onClick={handleExportCSVReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Exportar reporte de marcas a Excel/CSV"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Segmentation Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Navigation Tabs inside Reports */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('resumen')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeSubTab === 'resumen'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visión General
          </button>
          <button
            onClick={() => setActiveSubTab('ventas_marca')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeSubTab === 'ventas_marca'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ventas por Marca
          </button>
          <button
            onClick={() => setActiveSubTab('stock_critico')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeSubTab === 'stock_critico'
                ? 'bg-white text-amber-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Stock Crítico</span>
            {criticalProducts.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {criticalProducts.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters: Period & Price Tier */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-transparent border-0 text-slate-700 font-medium focus:ring-0 cursor-pointer pr-4"
              aria-label="Filtrar por período"
            >
              <option value="all">Todo el Histórico</option>
              <option value="30d">Últimos 30 días</option>
              <option value="7d">Últimos 7 días</option>
              <option value="today">Ventas de Hoy</option>
            </select>
          </div>

          {/* Tier selector */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="bg-transparent border-0 text-slate-700 font-medium focus:ring-0 cursor-pointer pr-4"
              aria-label="Filtrar por tarifa"
            >
              <option value="all">Todas las Tarifas</option>
              <option value="comercial">Comercial (PVP)</option>
              <option value="mayorista">Mayoreo (-40%)</option>
              <option value="promocion">Promoción (-60%)</option>
            </select>
          </div>

          {/* Metric toggle for charts */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMetric('revenue')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                viewMetric === 'revenue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              $ MXN
            </button>
            <button
              onClick={() => setViewMetric('units')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                viewMetric === 'units'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Piezas
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ventas Totales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ventas Totales
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
              ${totalRevenueAll.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>En {filteredOrders.length} pedidos</span>
            {totalSavingsGiven > 0 && (
              <span className="text-emerald-700 font-semibold">
                -${totalSavingsGiven.toLocaleString('es-MX')} desc.
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Unidades Vendidas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Piezas Despachadas
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
              {totalUnitsSold} <span className="text-sm font-normal text-slate-500">pzas</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Promedio por orden:</span>
            <span className="font-semibold text-slate-700">
              {filteredOrders.length > 0 ? (totalUnitsSold / filteredOrders.length).toFixed(1) : 0} pzas/pedido
            </span>
          </div>
        </div>

        {/* KPI 3: Marca Líder */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Marca Líder en Ventas
              </span>
              <div 
                className="w-3.5 h-3.5 rounded-full" 
                style={{ backgroundColor: BRAND_COLORS[topBrandLeader.brand] || '#1E40AF' }} 
              />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 flex items-baseline gap-2">
              <span>{topBrandLeader.brand}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {totalRevenueAll > 0 ? Math.round((topBrandLeader.totalRevenue / totalRevenueAll) * 100) : 0}% share
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Facturación:</span>
            <span className="font-bold text-slate-800 font-mono">
              ${topBrandLeader.totalRevenue.toLocaleString('es-MX')}
            </span>
          </div>
        </div>

        {/* KPI 4: Stock Crítico */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Stock Crítico & Alertas
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-2 font-mono tabular-nums flex items-baseline gap-2">
              <span>{criticalProducts.length}</span>
              <span className="text-xs font-normal text-slate-500">SKUs en riesgo</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-rose-600 font-semibold">{outOfStockProducts.length} agotados</span>
            <span className="text-amber-700">{lowStockProducts.length} stock bajo</span>
          </div>
        </div>

      </div>

      {/* SECTION 1: Ventas Totales por Marca (Nivea, Eucerin, Aquaphor) */}
      {(activeSubTab === 'resumen' || activeSubTab === 'ventas_marca') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
                <span>Ventas Totales por Marca</span>
                <span className="text-xs font-sans font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Nivea · Eucerin · Aquaphor
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativo de volumen de ventas e ingresos netos facturados por cada línea dermatológica.
              </p>
            </div>

            {/* Quick interactive test sales helper */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium px-2">Probar venta:</span>
              <button
                onClick={() => handleSimulateQuickOrder('Nivea')}
                className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold transition-colors cursor-pointer text-[11px]"
                title="Generar venta rápida de Nivea para ver cómo reacciona la gráfica"
              >
                + Venta Nivea
              </button>
              <button
                onClick={() => handleSimulateQuickOrder('Eucerin')}
                className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 font-semibold transition-colors cursor-pointer text-[11px]"
                title="Generar venta rápida de Eucerin"
              >
                + Venta Eucerin
              </button>
              <button
                onClick={() => handleSimulateQuickOrder('Aquaphor')}
                className="px-2 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-semibold transition-colors cursor-pointer text-[11px]"
                title="Generar venta rápida de Aquaphor"
              >
                + Venta Aquaphor
              </button>
            </div>
          </div>

          {/* Grids with Recharts Charts: BarChart & PieChart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main BarChart of Sales by Brand */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {viewMetric === 'revenue' ? 'Facturación Neta por Marca ($ MXN)' : 'Unidades Totales Vendidas por Marca'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Distribución en {filteredOrders.length} órdenes registradas
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-700" />
                    <span className="text-slate-600 font-medium">Nivea</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-slate-600 font-medium">Eucerin</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-sky-600" />
                    <span className="text-slate-600 font-medium">Aquaphor</span>
                  </div>
                </div>
              </div>

              {/* Recharts BarChart */}
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartSalesData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="brand" 
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => 
                        viewMetric === 'revenue' 
                          ? `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}` 
                          : `${val} pz`
                      }
                    />
                    <Tooltip 
                      formatter={(value: any) => [
                        viewMetric === 'revenue' 
                          ? `$${Number(value).toLocaleString('es-MX')} MXN` 
                          : `${value} piezas`,
                        viewMetric === 'revenue' ? 'Ingresos' : 'Unidades'
                      ]}
                      labelFormatter={(label) => `Marca: ${label}`}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar 
                      dataKey={viewMetric === 'revenue' ? 'totalRevenue' : 'unitsSold'} 
                      radius={[6, 6, 0, 0]}
                    >
                      {chartSalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Quick stats footer under BarChart */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                {chartSalesData.slice(0, 3).map((item) => (
                  <div key={item.brand} className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {item.brand}
                    </span>
                    <span className="text-sm font-bold text-slate-800 font-mono block">
                      ${item.totalRevenue.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.unitsSold} pzas · {item.share}% share
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut PieChart of Brand Share */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Participación de Mercado (% Share)
                </h3>
                <span className="text-[11px] text-slate-400">
                  {viewMetric === 'revenue' ? 'Por ingresos facturados' : 'Por volumen de piezas'}
                </span>
              </div>

              {/* Recharts PieChart */}
              <div className="h-64 w-full flex items-center justify-center">
                {pieShareData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieShareData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any, name: any, item: any) => [
                          viewMetric === 'revenue' 
                            ? `$${Number(val).toLocaleString('es-MX')} MXN (${item?.payload?.share || 0}%)` 
                            : `${val} pzas (${item?.payload?.share || 0}%)`,
                          name
                        ]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-12">
                    Sin órdenes en el período seleccionado
                  </div>
                )}
              </div>

              {/* Custom Legend */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {chartSalesData.map((item) => (
                  <div key={item.brand} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="font-semibold text-slate-700">{item.brand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">
                        {viewMetric === 'revenue' ? `$${item.totalRevenue.toLocaleString('es-MX')}` : `${item.unitsSold} pz`}
                      </span>
                      <span className="font-bold text-slate-900 w-8 text-right font-mono">
                        {item.share}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Granular Brand Performance Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Desglose Comercial por Marca
                </h3>
                <p className="text-xs text-slate-500">
                  Rendimiento detallado de ingresos, pedidos y producto estrella por línea.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Moneda: MXN
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Marca</th>
                    <th className="py-3 px-4 text-right">Facturación Neta</th>
                    <th className="py-3 px-4 text-center">Unidades</th>
                    <th className="py-3 px-4 text-center">Órdenes</th>
                    <th className="py-3 px-4 text-center">% Share</th>
                    <th className="py-3 px-4">Producto Más Vendido</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[salesByBrand.Nivea, salesByBrand.Eucerin, salesByBrand.Aquaphor].map((item) => {
                    const share = totalRevenueAll > 0 
                      ? Math.round((item.totalRevenue / totalRevenueAll) * 100) 
                      : 0;
                    const brandColor = BRAND_COLORS[item.brand] || '#1E40AF';

                    return (
                      <tr key={item.brand} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2.5">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: brandColor }} 
                          />
                          <span className="font-bold text-sm">{item.brand}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                          ${item.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                          {item.unitsSold} pzas
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600">
                          {item.ordersCount}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ width: `${share}%`, backgroundColor: brandColor }} 
                              />
                            </div>
                            <span className="font-mono font-semibold text-slate-700 w-7 text-right">
                              {share}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={item.topProduct}>
                          {item.topProduct}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSimulateQuickOrder(item.brand as any)}
                            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            + Venta rápida
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Temporal Sales Trend using Recharts AreaChart */}
          {salesTrendData.length > 1 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Evolución Temporal de Ventas por Marca</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Ingresos acumulados en el tiempo
                  </span>
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="gradNivea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradEucerin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradAquaphor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="dateLabel" tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 11 }} 
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip 
                      formatter={(v: any) => [`$${Number(v).toLocaleString('es-MX')}`, '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Nivea" stroke="#1E40AF" fillOpacity={1} fill="url(#gradNivea)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Eucerin" stroke="#DC2626" fillOpacity={1} fill="url(#gradEucerin)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Aquaphor" stroke="#0284C7" fillOpacity={1} fill="url(#gradAquaphor)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SECTION 2: Diagnóstico y Monitor de Stock Crítico */}
      {(activeSubTab === 'resumen' || activeSubTab === 'stock_critico') && (
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Monitoreo de Stock Crítico y Alertas</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Productos con existencias iguales o por debajo del umbral mínimo configurado (requieren reabastecimiento urgente).
              </p>
            </div>

            <button
              onClick={() => setActiveTab('inventario')}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Ir al Gestor de Inventario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Critical Stock Recharts Charts: Comparison & By Brand */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recharts BarChart: Top Products with Critical Stock */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Nivel de Existencias vs Umbral Mínimo de Alerta
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Comparativo directo para los productos con menor stock
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500" />
                    <span className="text-slate-600 font-medium">Stock Actual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-slate-300" />
                    <span className="text-slate-600 font-medium">Umbral Mínimo</span>
                  </div>
                </div>
              </div>

              {/* Horizontal BarChart */}
              <div className="h-80 w-full pt-4">
                {criticalComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={criticalComparisonData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={140}
                        tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(val: any, name: any) => [
                          `${val} piezas`,
                          name === 'stockActual' ? 'Stock Actual' : 'Umbral Mínimo'
                        ]}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item ? `${item.fullName} (${item.sku})` : label;
                        }}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                        }}
                      />
                      <Bar 
                        dataKey="stockActual" 
                        name="stockActual" 
                        radius={[0, 4, 4, 0]}
                      >
                        {criticalComparisonData.map((entry, index) => (
                          <Cell 
                            key={`crit-cell-${index}`} 
                            fill={entry.stockActual === 0 ? '#EF4444' : '#F59E0B'} 
                          />
                        ))}
                      </Bar>
                      <Bar 
                        dataKey="umbralMinimo" 
                        name="umbralMinimo" 
                        fill="#CBD5E1" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 stroke-1" />
                    <p className="text-sm font-semibold text-slate-800">¡Inventario Saludable!</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No hay productos en nivel crítico ni agotados actualmente.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recharts BarChart: Critical Stock grouped by Brand */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Salud de Stock por Marca
                </h3>
                <span className="text-[11px] text-slate-400">
                  Conteo de SKUs Normales vs Críticos vs Agotados
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={criticalStockByBrand} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="brand" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [
                        `${val} productos`,
                        name === 'normal' ? 'Normal' : name === 'critico' ? 'Stock Bajo' : 'Agotado'
                      ]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="normal" name="Normal" fill="#10B981" stackId="a" />
                    <Bar dataKey="critico" name="Bajo" fill="#F59E0B" stackId="a" />
                    <Bar dataKey="agotado" name="Agotado" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 mt-2">
                <span className="font-bold">Diagnóstico: </span>
                {outOfStockProducts.length > 0 ? (
                  <span>Hay {outOfStockProducts.length} SKU(s) completamente agotados que requieren orden de reposición con proveedor.</span>
                ) : (
                  <span>Todos los productos tienen existencias físicas, pero {criticalProducts.length} están cerca del umbral mínimo de seguridad.</span>
                )}
              </div>
            </div>

          </div>

          {/* Interactive Critical Stock Action Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Productos en Estado Crítico ({criticalProducts.length})</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Haz clic en "+5 Reabastecer" para surtir directamente
                  </span>
                </h3>
              </div>

              <div className="text-xs text-slate-500">
                Prioridad de reposición: Inmediata
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Marca</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Mínimo</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Reabastecimiento Express</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        No hay productos en estado crítico actualmente.
                      </td>
                    </tr>
                  ) : (
                    criticalProducts.map((p) => {
                      const isZero = p.stock === 0;
                      const brandKey = normalizeBrandName(p.brand);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {p.sku}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">{p.name}</span>
                            <span className="text-[11px] text-slate-400">{p.presentation}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border"
                              style={{ 
                                borderColor: `${BRAND_COLORS[brandKey] || '#64748B'}40`,
                                color: BRAND_COLORS[brandKey] || '#64748B',
                                backgroundColor: `${BRAND_COLORS[brandKey] || '#64748B'}10`
                              }}
                            >
                              {p.brand}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-sm tabular-nums">
                            <span className={isZero ? 'text-rose-600' : 'text-amber-600'}>
                              {p.stock} pzas
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-500">
                            {p.minStockAlert} pzas
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isZero ? (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                                Agotado
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                                Crítico ({p.stock}/{p.minStockAlert})
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickRestock(p.id, p.name)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                                title="Añadir 5 piezas inmediatamente"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>+5 Reabastecer</span>
                              </button>
                              <button
                                onClick={() => openProductModal(p)}
                                className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                                title="Editar umbral o información"
                              >
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
