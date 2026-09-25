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

export const OrdersHistory: React.FC = () => {
  const { orders, setActiveTab } = useInventory();
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
              Historial de Pedidos y Ventas
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Registro de todas las órdenes procesadas en la tienda, con detalles del cliente, desglose de artículos y comprobantes.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('reportes')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>Ver Panel de Reportes</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Sin pedidos registrados todavía</h3>
          <p className="text-xs text-slate-500 mt-1">
            Realiza una compra desde la Tienda en Línea para ver aquí el registro y comprobante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900 block">
                      {order.id}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.date).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                    {order.appliedTier}
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
                      ? `Envío a Domicilio ${order.customerAddress ? `· ${order.customerAddress}` : ''}`
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
                    Artículos ({order.items.reduce((s, i) => s + i.quantity, 0)} pzas)
                  </span>
                  <ul className="text-xs space-y-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex justify-between text-[11px]">
                        <span className="truncate pr-2 text-slate-700">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-mono text-slate-900 tabular-nums font-medium">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-[10px] text-slate-400 italic">
                        +{order.items.length - 3} producto(s) más...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Pagado</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    ${order.total.toFixed(2)} MXN
                  </span>
                </div>

                <button
                  onClick={() => setSelectedOrderForReceipt(order)}
                  className="flex items-center gap-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ticket</span>
                </button>
              </div>
            </div>
          ))}
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
