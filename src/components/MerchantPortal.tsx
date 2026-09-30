import React, { useState } from 'react';
import { 
  Store, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Printer, 
  ExternalLink, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Edit,
  Plus
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const MerchantPortal: React.FC = () => {
  const { 
    loggedMerchant, 
    products, 
    orders, 
    settlements, 
    userRole, 
    setIsAuthModalOpen, 
    openProductModal,
    setActiveTab,
    setIsBrochureModalOpen
  } = useInventory();

  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'liquidaciones' | 'pedidos' | 'catalogo'>('resumen');

  if (!loggedMerchant && userRole !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Portal de Comercios de Silao</h2>
        <p className="text-sm text-slate-600">
          Inicia sesión con tu comercio afiliado para consultar tus ventas, comisiones y liquidaciones semanales.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          Seleccionar Mi Negocio e Ingresar PIN
        </button>
      </div>
    );
  }

  // Si no hay merchant logueado pero es admin, tomar el primer comercio de demostración
  const merchant = loggedMerchant || {
    id: 'm1',
    name: 'Abarrotes y Minisuper El Centro',
    category: 'Abarrotes',
    commissionRate: 8,
    ownerName: 'Don Roberto Gómez',
    bankAccount: 'BBVA: 012 225 0154897210 4',
    phone: '472 101 2345',
    email: 'contacto@elcentro.com',
    status: 'active' as const
  };

  const commissionRate = merchant.commissionRate || 10;

  // Filtrar productos de este negocio
  const merchantProducts = products.filter(p => p.merchantId === merchant.id);

  // Calcular ventas brutas y pedidos del comercio
  let totalGrossSales = 0;
  let totalItemsSold = 0;
  const merchantOrders = orders.filter(order => {
    const itemsInOrder = order.items.filter(item => item.product.merchantId === merchant.id);
    if (itemsInOrder.length > 0) {
      itemsInOrder.forEach(item => {
        const itemPrice = item.unitPrice || item.product.commercialPrice || (item.product as any).price || 0;
        totalGrossSales += itemPrice * item.quantity;
        totalItemsSold += item.quantity;
      });
      return true;
    }
    return false;
  });

  // Comisión y Neto
  const commissionAmount = (totalGrossSales * commissionRate) / 100;
  const netEarnings = totalGrossSales - commissionAmount;

  // Liquidaciones de este negocio
  const merchantSettlements = settlements.filter(s => s.merchantId === merchant.id);
  const totalPaid = merchantSettlements
    .filter(s => s.status === 'pagado')
    .reduce((sum, s) => sum + s.netAmount, 0);
  const pendingSettlement = netEarnings - totalPaid > 0 ? netEarnings - totalPaid : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Banner Superior del Negocio */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Portal de Negocio Afiliado
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
                  Activo
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{merchant.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span><strong>Giro:</strong> {merchant.category}</span>
                <span>•</span>
                <span><strong>Propietario:</strong> {merchant.ownerName || 'Encargado General'}</span>
                <span>•</span>
                <span><strong>Comisión Pactada:</strong> <span className="text-amber-300 font-black">{commissionRate}%</span></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openProductModal()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>

            <button
              onClick={() => setIsBrochureModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Folleto</span>
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cambiar Cuenta
            </button>
          </div>
        </div>

        {/* Datos bancarios del negocio */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Cuenta para Liquidación (7 días): <strong>{merchant.bankAccount || 'Registrar CLABE interbancaria'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Próximo corte: Semanal (Lunes 10:00 AM)</span>
          </div>
        </div>
      </div>

      {/* 4 Métricas Clave de Negocio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Ventas Brutas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ventas Brutas</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">${totalGrossSales.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">{totalItemsSold} artículos vendidos</p>
          </div>
        </div>

        {/* Comisión SILAOMARKET */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Comisión Hub ({commissionRate}%)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-700">-${commissionAmount.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">Tarifa pactada en folleto oficial</p>
          </div>
        </div>

        {/* Saldo Neto */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase">Ganancia Neta</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-700">${netEarnings.toFixed(2)}</span>
            <p className="text-xs text-emerald-900 font-medium mt-1">Directo a tu cuenta</p>
          </div>
        </div>

        {/* Saldo Pendiente de Liquidar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pendiente Liquidación</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-700">${pendingSettlement.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">Corte cada 7 días</p>
          </div>
        </div>

      </div>

      {/* Subnavegación del Portal */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('resumen')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'resumen'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Estado de Cuenta
        </button>
        <button
          onClick={() => setActiveSubTab('liquidaciones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'liquidaciones'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          💵 Liquidaciones Semanales ({merchantSettlements.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pedidos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'pedidos'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📦 Pedidos Recibidos ({merchantOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('catalogo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'catalogo'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏷️ Mis Productos ({merchantProducts.length})
        </button>
      </div>

      {/* CONTENIDO DE TABS */}

      {/* TAB 1: RESUMEN / ESTADO DE CUENTA */}
      {activeSubTab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Explicación de Modelo Comercial */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Respaldo de Cobro y Liquidación a 7 Días
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                En <strong>SILAOMARKET ON LINE</strong> tus ventas están 100% protegidas. Los clientes pagan su carrito consolidado en línea o contra entrega al repartidor del Hub. Tú solo entregas el producto embalado cuando la orden llega.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Comisión por Giro ({merchant.category}):</span>
                  <strong className="text-slate-900">{commissionRate}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Costo de Envío al Cliente:</span>
                  <strong className="text-emerald-700">$25.00 a $40.00 (Cubierto por el cliente para el repartidor Hub según comercios y piezas)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Costo de Afiliación / Mensualidad:</span>
                  <strong className="text-emerald-700">$0.00 (0% Entrada)</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Frecuencia de Transferencia:</span>
                  <strong className="font-black text-slate-900">Cada 7 Días Calendario</strong>
                </div>
              </div>
            </div>

            {/* Desglose de Ventas por Producto */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-black text-slate-900 mb-4">Ventas por Producto en este Ciclo</h3>
              {merchantProducts.length === 0 ? (
                <p className="text-xs text-slate-500">Aún no tienes productos registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-black">
                        <th className="py-2">Producto</th>
                        <th className="py-2 text-center">Stock</th>
                        <th className="py-2 text-right">Precio Venta</th>
                        <th className="py-2 text-right">Neto Negocio ({100 - commissionRate}%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {merchantProducts.slice(0, 8).map(prod => {
                        const price = prod.commercialPrice || (prod as any).price || 0;
                        const net = price * (1 - commissionRate / 100);
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {prod.name}
                            </td>
                            <td className="py-2.5 text-center font-semibold text-slate-600">{prod.stock}</td>
                            <td className="py-2.5 text-right font-bold text-slate-900">${price.toFixed(2)}</td>
                            <td className="py-2.5 text-right font-black text-emerald-700">
                              ${net.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Columna Derecha: Tarjeta de Contacto y Soporte */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/60 rounded-2xl border border-emerald-200 p-6 space-y-4">
              <h3 className="text-base font-black text-emerald-950">Soporte del Hub Silao</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                ¿Necesitas actualizar tus datos bancarios, cambiar tu número de teléfono o resolver una duda con un pedido?
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Coordinación Silao</span>
                  <a href="mailto:hhlozano70@hotmail.com" className="font-bold text-emerald-700 hover:underline">
                    hhlozano70@hotmail.com
                  </a>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Teléfono Hub</span>
                  <span className="font-bold text-slate-800">472 100 8920</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Estado de Cuenta</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: LIQUIDACIONES SEMANALES */}
      {activeSubTab === 'liquidaciones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Historial de Liquidaciones Semanales</h3>
              <p className="text-xs text-slate-500">
                Cortes cada 7 días pagados vía transferencia bancaria por SILAOMARKET Hub Central.
              </p>
            </div>

            <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
              Total Cobrado Histórico: ${totalPaid.toFixed(2)}
            </div>
          </div>

          {merchantSettlements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              Aún no hay liquidaciones registradas para este comercio. Al completarse el ciclo de 7 días, Administración generará el comprobante correspondiente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-black">
                    <th className="py-2.5">Folio / Período</th>
                    <th className="py-2.5 text-right">Venta Bruta</th>
                    <th className="py-2.5 text-right">Comisión Retenida</th>
                    <th className="py-2.5 text-right">Neto Depositado</th>
                    <th className="py-2.5 text-center">Estado</th>
                    <th className="py-2.5">Referencia Bancaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {merchantSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">
                        {s.period}
                        <span className="block text-[10px] text-slate-400 font-normal">{s.id}</span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-700">${s.grossSales.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-amber-700">-${s.commissionAmount.toFixed(2)} ({s.commissionRate}%)</td>
                      <td className="py-3 text-right font-black text-emerald-700 text-sm">${s.netAmount.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-600 font-mono">
                        {s.paymentReference || 'En proceso de transferencia'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PEDIDOS RECIBIDOS */}
      {activeSubTab === 'pedidos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pedidos con Productos de Tu Tienda</h3>
              <p className="text-xs text-slate-500">
                Órdenes consolidadas donde clientes de Silao solicitaron artículos de tu inventario.
              </p>
            </div>
          </div>

          {merchantOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              No hay pedidos registrados recientemente con artículos de esta tienda.
            </div>
          ) : (
            <div className="space-y-4">
              {merchantOrders.map((order) => {
                const thisShopItems = order.items.filter(i => i.product.merchantId === merchant.id);
                const shopTotal = thisShopItems.reduce((acc, i) => {
                  const p = i.unitPrice || i.product.commercialPrice || (i.product as any).price || 0;
                  return acc + (p * i.quantity);
                }, 0);
                const shopNet = shopTotal * (1 - commissionRate / 100);

                return (
                  <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">Pedido #{order.id}</span>
                        <span className="text-xs text-slate-500">• {new Date(order.date || (order as any).createdAt || Date.now()).toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Cliente: <strong>{order.customerName}</strong></span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {thisShopItems.map((item, idx) => {
                        const itemPrice = item.unitPrice || item.product.commercialPrice || (item.product as any).price || 0;
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-800">
                              <strong>{item.quantity}x</strong> {item.product.name}
                            </span>
                            <span className="font-semibold text-slate-900">
                              ${(itemPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Subtotal Comercio: <strong>${shopTotal.toFixed(2)}</strong> | Comisión ({commissionRate}%): <span className="text-amber-700">-${(shopTotal * commissionRate / 100).toFixed(2)}</span>
                      </span>
                      <span className="text-emerald-700 font-black text-sm">
                        Tu Ganancia Neta: ${shopNet.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MIS PRODUCTOS EN VENTA */}
      {activeSubTab === 'catalogo' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Catálogo de Productos ({merchantProducts.length})</h3>
              <p className="text-xs text-slate-500">
                Productos disponibles en la tienda en línea para clientes de Silao.
              </p>
            </div>

            <button
              onClick={() => openProductModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {merchantProducts.map((prod) => {
              const price = prod.commercialPrice || (prod as any).price || 0;
              const netPrice = price * (1 - commissionRate / 100);

              return (
                <div key={prod.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-32 rounded-lg bg-slate-100 overflow-hidden mb-2 relative">
                      <img 
                        src={prod.imageUrl || (prod as any).image || '/images/products/placeholder.jpg'} 
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        Stock: {prod.stock}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{prod.name}</h4>
                    <span className="text-[10px] text-slate-500">{prod.category}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900">${price.toFixed(2)}</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">
                        Neto: ${netPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => openProductModal(prod)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-all cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
