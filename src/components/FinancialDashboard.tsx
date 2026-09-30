import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  Truck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  FileText, 
  ArrowUpRight, 
  PlusCircle,
  Building2,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Merchant } from '../types/inventory';

export const FinancialDashboard: React.FC = () => {
  const { 
    merchants, 
    orders, 
    settlements, 
    recordSettlement, 
    markSettlementPaid,
    userRole,
    setIsAuthModalOpen,
    setIsMerchantManagerOpen
  } = useInventory();

  const [filterPeriod, setFilterPeriod] = useState<string>('todos');
  const [selectedMerchantForSettlement, setSelectedMerchantForSettlement] = useState<Merchant | null>(null);
  const [settlementPeriodNote, setSettlementPeriodNote] = useState<string>('Semana en Curso - Septiembre 2026');
  const [paymentRefInput, setPaymentRefInput] = useState<{ [id: string]: string }>({});

  // Verificación de acceso
  if (userRole !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Panel Financiero Restringido</h2>
        <p className="text-sm text-slate-600">
          Esta sección es de acceso exclusivo para la Administración Central de SILAOMARKET ON LINE. Requiere autenticación con PIN maestro.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          Ingresar PIN de Administrador
        </button>
      </div>
    );
  }

  // Cálculos globales de plataforma
  let totalGMV = 0;
  let totalCommissionsEarned = 0;
  let totalDeliveryFund = 0;

  // Mapa de ventas brutas por negocio
  const merchantSalesMap: { [id: string]: { gross: number; items: number; orderIds: string[] } } = {};
  merchants.forEach(m => {
    merchantSalesMap[m.id] = { gross: 0, items: 0, orderIds: [] };
  });

  orders.forEach(order => {
    // Fondo de envíos: $25 por orden consolidada
    totalDeliveryFund += order.deliveryFee || 25;

    order.items.forEach(item => {
      const lineTotal = item.product.price * item.quantity;
      totalGMV += lineTotal;

      const mId = item.product.merchantId;
      if (mId && merchantSalesMap[mId]) {
        merchantSalesMap[mId].gross += lineTotal;
        merchantSalesMap[mId].items += item.quantity;
        if (!merchantSalesMap[mId].orderIds.includes(order.id)) {
          merchantSalesMap[mId].orderIds.push(order.id);
        }
      }
    });
  });

  // Calcular comisiones ganadas por comercio
  merchants.forEach(m => {
    const rate = m.commissionRate || 10;
    const gross = merchantSalesMap[m.id]?.gross || 0;
    totalCommissionsEarned += gross * (rate / 100);
  });

  const totalMerchantNetPayable = totalGMV - totalCommissionsEarned;

  // Liquidaciones totales pagadas vs pendientes
  const totalSettlementsPaid = settlements
    .filter(s => s.status === 'pagado')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const totalSettlementsPending = settlements
    .filter(s => s.status === 'pendiente')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const handleCreateSettlement = (merchant: Merchant) => {
    const data = merchantSalesMap[merchant.id] || { gross: 0, orderIds: [] };
    const rate = merchant.commissionRate || 10;
    const gross = data.gross;
    const commission = gross * (rate / 100);
    const net = gross - commission;

    recordSettlement(
      merchant.id,
      settlementPeriodNote,
      gross,
      rate,
      commission,
      net,
      data.orderIds,
      `Liquidación semanal generada para ${merchant.name}.`
    );

    setSelectedMerchantForSettlement(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Comercio', 'Periodo', 'Ventas_Brutas', 'Tasa_Comision', 'Comision_Hub', 'Neto_Comercio', 'Estado', 'Fecha_Liquidacion', 'Referencia_Bancaria'];
    const rows = settlements.map(s => [
      s.id,
      s.merchantName,
      `"${s.period}"`,
      s.grossSales.toFixed(2),
      `${s.commissionRate}%`,
      s.commissionAmount.toFixed(2),
      s.netAmount.toFixed(2),
      s.status,
      s.settledDate || 'Pendiente',
      `"${s.paymentReference || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SILAOMARKET_Liquidaciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header Hub Central */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Administración Financiera & Control Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Finanzas y Liquidaciones a Negocios
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Control de comisiones (8% al 18%), fondo de envíos ($25/pedido) y pagos semanales directos a comercios de Silao de la Victoria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMerchantManagerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
          >
            Gestionar Comercios
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Imprimir balance"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Grandes Tarjetas Financieras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* GMV Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ventas Plataforma (GMV)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              $
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">${totalGMV.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">{orders.length} pedidos consolidados</p>
          </div>
        </div>

        {/* Comisiones Ganadas por Silaomarket */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase">Comisiones SILAOMARKET</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-700">${totalCommissionsEarned.toFixed(2)}</span>
            <p className="text-xs text-emerald-800 font-medium mt-1">Margen del 8% al 18%</p>
          </div>
        </div>

        {/* Fondo de Envíos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Fondo de Envíos Hub</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-700">${totalDeliveryFund.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">$25.00 por orden a repartidores</p>
          </div>
        </div>

        {/* Liquidaciones a Negocios */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Neto Comercios</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-700">${totalMerchantNetPayable.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">Pagado: ${totalSettlementsPaid.toFixed(2)}</p>
          </div>
        </div>

      </div>

      {/* SECCIÓN 1: ESTADO Y CORTE SEMANAL POR COMERCIO AFILIADO */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">Estado de Cuenta por Comercio Afiliado (Corte 7 Días)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calcula la retención según la tasa de folleto (8% al 18%) y genera la liquidación semanal para cada tienda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={settlementPeriodNote}
              onChange={e => setSettlementPeriodNote(e.target.value)}
              placeholder="Nombre del Periodo"
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-black">
                <th className="py-3 px-3">Negocio / Contacto</th>
                <th className="py-3 px-3">Giro Comercial</th>
                <th className="py-3 px-3 text-center">Tasa Folleto</th>
                <th className="py-3 px-3 text-right">Venta Bruta</th>
                <th className="py-3 px-3 text-right">Comisión SILAOMARKET</th>
                <th className="py-3 px-3 text-right">Neto a Pagar</th>
                <th className="py-3 px-3 text-center">Cuenta Bancaria</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {merchants.map((merchant) => {
                const data = merchantSalesMap[merchant.id] || { gross: 0, items: 0, orderIds: [] };
                const rate = merchant.commissionRate || 10;
                const gross = data.gross;
                const commission = gross * (rate / 100);
                const net = gross - commission;

                return (
                  <tr key={merchant.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3 px-3">
                      <strong className="text-slate-900 block">{merchant.name}</strong>
                      <span className="text-[10px] text-slate-400">{merchant.ownerName || 'Propietario no asignado'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {merchant.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      ${gross.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-amber-700">
                      -${commission.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-700 text-sm">
                      ${net.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center text-[11px] text-slate-500 font-mono">
                      {merchant.bankAccount || 'Por registrar'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleCreateSettlement(merchant)}
                        disabled={gross === 0}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gross > 0 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Generar Corte (7d)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: HISTORIAL DE LIQUIDACIONES Y REGISTRO DE PAGOS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">Registro Oficial de Liquidaciones Emitidas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historial de comprobantes de pago generados por el Hub Central para transferir a las cuentas bancarias de los negocios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Total emitidas: <strong>{settlements.length}</strong>
            </span>
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No hay liquidaciones generadas aún. Utiliza el botón "Generar Corte (7d)" en la tabla superior cuando se cumpla el ciclo semanal de ventas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-black">
                  <th className="py-3 px-3">Folio</th>
                  <th className="py-3 px-3">Comercio</th>
                  <th className="py-3 px-3">Periodo</th>
                  <th className="py-3 px-3 text-right">Ventas Brutas</th>
                  <th className="py-3 px-3 text-right">Retención (%)</th>
                  <th className="py-3 px-3 text-right">Neto a Transferir</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3">Referencia Transferencia</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3 px-3 font-mono font-bold text-slate-600">{s.id}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{s.merchantName}</td>
                    <td className="py-3 px-3 text-slate-600">{s.period}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">${s.grossSales.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-amber-700 font-bold">
                      -${s.commissionAmount.toFixed(2)} ({s.commissionRate}%)
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-700 text-sm">
                      ${s.netAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {s.status === 'pagado' ? (
                        <div>
                          <span className="font-mono text-[11px] text-slate-800 font-bold">{s.paymentReference}</span>
                          <span className="block text-[10px] text-slate-400">
                            {s.settledDate ? new Date(s.settledDate).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={paymentRefInput[s.id] || ''}
                          onChange={(e) => setPaymentRefInput({ ...paymentRefInput, [s.id]: e.target.value })}
                          placeholder="Folio SPEI BBVA..."
                          className="px-2 py-1 rounded-lg border border-slate-300 text-xs w-36 font-mono"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {s.status === 'pendiente' ? (
                        <button
                          onClick={() => markSettlementPaid(s.id, paymentRefInput[s.id])}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          Marcar Pagado
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Liquidado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
