import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShoppingBag, 
  SlidersHorizontal, 
  Search, 
  Download, 
  History,
  FileSpreadsheet
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const MovementsHistory: React.FC = () => {
  const { movements } = useInventory();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchType = filterType === 'all' || m.type === filterType;
      const matchSearch =
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.reference && m.reference.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [movements, filterType, searchTerm]);

  const handleExportCSV = () => {
    const headers = [
      'Fecha y Hora',
      'Tipo de Movimiento',
      'Producto',
      'Cantidad',
      'Stock Anterior',
      'Nuevo Stock',
      'Concepto / Razón',
      'Referencia',
    ];

    const rows = movements.map((m) => [
      `"${new Date(m.timestamp).toLocaleString('es-MX')}"`,
      `"${m.type.toUpperCase()}"`,
      `"${m.productName}"`,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.reason}"`,
      `"${m.reference || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Kardex_Movimientos_DermoStock_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
              Kardex y Registro de Movimientos
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Trazabilidad completa de auditoría: entradas por compra, ventas en tienda y ajustes manuales.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Kardex (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            key="movements-search-input"
            type="text"
            placeholder="Buscar por producto, concepto o referencia..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({movements.length})
          </button>
          <button
            onClick={() => setFilterType('entrada')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'entrada'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Entradas (+)
          </button>
          <button
            onClick={() => setFilterType('venta')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'venta'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ventas en Tienda
          </button>
          <button
            onClick={() => setFilterType('salida')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'salida'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Salidas / Mermas
          </button>
          <button
            onClick={() => setFilterType('ajuste')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'ajuste'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ajustes
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Operación</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4 text-center">Variación</th>
                <th className="py-3 px-4 text-center">Stock Previo</th>
                <th className="py-3 px-4 text-center">Nuevo Saldo</th>
                <th className="py-3 px-4">Motivo / Concepto</th>
                <th className="py-3 px-4">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No hay movimientos registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(m.timestamp).toLocaleString('es-MX')}
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {m.type === 'entrada' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowDownLeft className="w-3 h-3" />
                          Entrada
                        </span>
                      )}
                      {m.type === 'venta' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <ShoppingBag className="w-3 h-3" />
                          Venta
                        </span>
                      )}
                      {m.type === 'salida' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <ArrowUpRight className="w-3 h-3" />
                          Salida
                        </span>
                      )}
                      {m.type === 'ajuste' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <SlidersHorizontal className="w-3 h-3" />
                          Ajuste
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {m.productName}
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono font-bold tabular-nums">
                      <span
                        className={
                          m.quantity > 0
                            ? 'text-emerald-700'
                            : m.quantity < 0
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono text-slate-500 tabular-nums">
                      {m.previousStock}
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {m.newStock}
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                      {m.reason}
                    </td>

                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {m.reference || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
