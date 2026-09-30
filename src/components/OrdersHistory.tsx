import React, { useState } from 'react';
import { 
  ClipboardList, 
  Eye, 
  Printer, 
  MessageCircle, 
  Calendar, 
  User, 
  CreditCard,
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Order } from '../types/inventory';
import { OrderReceiptModal } from './OrderReceiptModal';
import { QrCode, Snowflake } from 'lucide-react';

export const OrdersHistory: React.FC = () => {
  const { 
    orders, 
    setActiveTab, 
    openTrackingModal,
    userRole,
    loggedMerchantId,
    loggedMerchant
  } = useInventory();
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Scoped orders
  const displayedOrders = userRole === 'negocio' && loggedMerchantId
    ? orders.filter((o) => o.items.some((i) => i.product.merchantId === loggedMerchantId))
    : orders;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
              {userRole === 'negocio'
                ? `Pedidos con Productos de ${loggedMerchant?.name || 'Mi Negocio'}`
                : 'Historial de Pedidos y Ventas'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {userRole === 'negocio'
              ? 'Listado de órdenes donde se solicitaron productos de tu tienda. Solo se muestran tus artículos y subtotales correspondientes.'
              : 'Registro de todas las órdenes procesadas en la tienda, con detalles del cliente, desglose de artículos y comprobantes.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('reportes')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Ver Panel de Reportes</span>
          </button>
        )}
      </div>

      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
          <h3 className="text-base font-semibold text-slate-700">
            {userRole === 'negocio'
              ? 'Aún no hay pedidos recibidos con artículos de tu tienda'
              : 'Sin pedidos registrados todavía'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {userRole === 'negocio'
              ? 'En cuanto un cliente ordene productos de tu comercio, aparecerán aquí para empaque y recolección.'
              : 'Realiza una compra desde la Tienda en Línea para ver aquí el registro y comprobante.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedOrders.map((order) => {
            const isMerchant = userRole === 'negocio' && loggedMerchantId;
            const relevantItems = isMerchant
              ? order.items.filter((i) => i.product.merchantId === loggedMerchantId)
              : order.items;
            const merchantSubtotal = relevantItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Header card */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-slate-900 block">
                          {order.id}
                        </span>
                        {order.hasColdChain && (
                          <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                            ❄️ Frío
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-semibold text-slate-500">
                          {order.trackingCode || 'SLO-TRK'}
                        </span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.date).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                      order.trackingStatus === 'entregado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : order.trackingStatus === 'en_camino'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {order.trackingStatus ? order.trackingStatus.replace('_', ' ') : 'recibido'}
                    </span>
                  </div>

                  {/* Customer detail */}
                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 pl-5">
                      Tel: {order.customerPhone}
                    </div>
                    <div className="text-[11px] text-slate-500 pl-5 truncate" title={order.customerAddress || order.deliveryPoint || ''}>
                      {order.deliveryType === 'domicilio' || order.deliveryType === 'envio'
                        ? `Envío a Domicilio (${order.deliveryColonia || 'Silao'}) ${order.customerAddress ? `· ${order.customerAddress}` : ''}`
                        : `Punto Fijo a Definir ${order.deliveryPoint ? `· ${order.deliveryPoint}` : ''}`}
                    </div>
                    <div className="text-[11px] text-slate-500 pl-5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-3">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {isMerchant
                        ? `Tus Productos (${relevantItems.reduce((s, i) => s + i.quantity, 0)} pzas)`
                        : `Artículos (${order.items.reduce((s, i) => s + i.quantity, 0)} pzas de ${order.merchantsCount || 1} comercio/s)`}
                    </span>
                    <ul className="text-xs space-y-1">
                      {relevantItems.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex justify-between text-[11px]">
                          <span className="truncate pr-2 text-slate-700">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-mono text-slate-900 tabular-nums font-medium">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                      {relevantItems.length > 3 && (
                        <li className="text-[10px] text-slate-400 italic">
                          +{relevantItems.length - 3} producto(s) más...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Total & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {isMerchant ? 'Venta para Tu Negocio' : `Total Pagado ${order.deliveryFee ? `(Inc. envío $${order.deliveryFee.toFixed(2)})` : ''}`}
                    </span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      ${(isMerchant ? merchantSubtotal : order.total).toFixed(2)} MXN
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openTrackingModal(order)}
                      className="flex items-center gap-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                      title="Ver código QR de rastreo y estatus del traslado en tiempo real"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR & Rastreo</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrderForReceipt(order)}
                      className="flex items-center gap-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
                      title="Ver comprobante de compra"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for ticket preview */}
      <OrderReceiptModal
        order={selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
      />

    </div>
  );
};
