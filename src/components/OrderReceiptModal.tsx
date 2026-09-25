import React from 'react';
import { X, Printer, CheckCircle2, MessageCircle } from 'lucide-react';
import { Order } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface OrderReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useInventory();
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDeliveryDomicilio = order.deliveryType === 'domicilio' || order.deliveryType === 'envio';
  const deliveryLabel = isDeliveryDomicilio ? 'Entrega a Domicilio' : 'En un Punto Fijo a Definir';
  const deliveryDetail = isDeliveryDomicilio 
    ? (order.customerAddress || 'Domicilio proporcionado')
    : (order.deliveryPoint || 'Punto fijo a coordinar');

  const generateWhatsAppLink = () => {
    let phone = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = '52' + phone;
    }

    const itemsText = order.items
      .map(
        (i) => `• ${i.quantity}x ${i.product.name} ($${i.unitPrice.toFixed(2)} c/u)`
      )
      .join('\n');

    const msg = `¡Hola ${settings.businessName || 'DermoStock'}! Confirmo mi pedido:\n\n` +
      `*No. Pedido:* #${order.id}\n` +
      `*Cliente:* ${order.customerName}\n` +
      `*Teléfono:* ${order.customerPhone}\n` +
      `*Modalidad:* ${deliveryLabel}\n` +
      `*Detalle Entrega:* ${deliveryDetail}\n` +
      `*Método de Pago:* ${order.paymentMethod.replace('_', ' ')}\n` +
      `*Tarifa:* ${order.appliedTier.toUpperCase()}\n\n` +
      `*Productos:* \n${itemsText}\n\n` +
      `*Total a Pagar:* $${order.total.toFixed(2)} MXN\n` +
      (order.discountSavings > 0 ? `*Ahorro Total:* $${order.discountSavings.toFixed(2)} MXN\n\n` : '\n') +
      `¡Muchas gracias!`;

    const encoded = encodeURIComponent(msg);
    return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Comprobante de Venta</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto print:p-0" id="printable-receipt">
          {/* Brand header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-xl font-bold font-serif tracking-tight text-slate-900">
              {settings.businessName || 'DermoStock México'}
            </h2>
            <p className="text-xs text-slate-500">Distribución de Dermocosméticos Originales</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Nivea · Eucerin · Aquaphor</p>
          </div>

          {/* Order Details */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Folio:</span>
              <span className="font-mono font-bold text-slate-900">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha:</span>
              <span className="text-slate-700">{new Date(order.date).toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-semibold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Teléfono:</span>
              <span className="text-slate-700">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entrega:</span>
              <span className="text-slate-700 font-medium">
                {deliveryLabel}
              </span>
            </div>
            {(order.customerAddress || order.deliveryPoint) && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {isDeliveryDomicilio ? 'Dirección:' : 'Punto Fijo:'}
                </span>
                <span className="text-slate-700 max-w-[240px] text-right truncate">
                  {isDeliveryDomicilio ? order.customerAddress : order.deliveryPoint}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Método de pago:</span>
              <span className="text-slate-700 capitalize">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Régimen de Precio:</span>
              <span className="font-semibold text-blue-700 uppercase">{order.appliedTier}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-dashed border-slate-300">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 font-medium text-left border-b border-slate-200">
                  <th className="pb-1">Cant.</th>
                  <th className="pb-1">Descripción</th>
                  <th className="pb-1 text-right">P. Unit</th>
                  <th className="pb-1 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 font-mono font-bold text-slate-700">{item.quantity}x</td>
                    <td className="py-1.5 pr-2">
                      <span className="font-medium text-slate-800 block line-clamp-1">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.product.sku}</span>
                    </td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-slate-600">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-1.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="pt-3 pb-2 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Precio Regular):</span>
              <span className="font-mono tabular-nums">${order.subtotal.toFixed(2)} MXN</span>
            </div>

            {order.discountSavings > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Descuento Aplicado ({order.appliedTier}):</span>
                <span className="font-mono tabular-nums">-${order.discountSavings.toFixed(2)} MXN</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Pagado / Por Cobrar:</span>
              <span className="font-mono tabular-nums text-lg">${order.total.toFixed(2)} MXN</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
            <p>¡Gracias por su compra en DermoStock!</p>
            <p className="mt-0.5">El inventario físico ha sido descontado automáticamente del almacén.</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
