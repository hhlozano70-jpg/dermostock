import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Truck, 
  Package, 
  Store, 
  Snowflake, 
  Share2, 
  ChevronRight,
  ShieldCheck,
  Navigation,
  MessageCircle,
  QrCode
} from 'lucide-react';
import { Order, TrackingStatus } from '../types/inventory';
import { OrderQRCode } from './OrderQRCode';
import { useInventory } from '../context/InventoryContext';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const TRACKING_STEPS: { status: TrackingStatus; title: string; subtitle: string; icon: any }[] = [
  {
    status: 'recibido',
    title: 'Pedido Recibido en Hub Silao',
    subtitle: 'Registrado en Hub Central (Calle 5 de Mayo #45, Silao Centro)',
    icon: Package,
  },
  {
    status: 'en_recoleccion',
    title: 'Recolectando con Comercios',
    subtitle: 'Nuestros recolectores visitan los comercios de Silao',
    icon: Store,
  },
  {
    status: 'consolidado',
    title: 'Consolidado en Hub Silao',
    subtitle: 'Paquete unificado y asegurado (con hielera si lleva cadena fría)',
    icon: ShieldCheck,
  },
  {
    status: 'en_camino',
    title: 'En Traslado a Domicilio',
    subtitle: 'Repartidor en ruta directa hacia tu dirección en Silao',
    icon: Truck,
  },
  {
    status: 'entregado',
    title: 'Entregado al Cliente',
    subtitle: 'Entrega completada y verificada mediante escaneo de QR',
    icon: CheckCircle2,
  },
];

const STATUS_ORDER: TrackingStatus[] = ['recibido', 'en_recoleccion', 'consolidado', 'en_camino', 'entregado'];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { updateOrderTrackingStatus } = useInventory();

  if (!isOpen || !order) return null;

  const currentStatusIndex = STATUS_ORDER.indexOf(order.trackingStatus || 'recibido');

  const handleAdvanceStatus = (nextStatus: TrackingStatus) => {
    updateOrderTrackingStatus(order.id, nextStatus);
  };

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?rastreo=${order.trackingCode}`
    : `https://silaomarket.online/?rastreo=${order.trackingCode}`;

  const shareWhatsAppMessage = () => {
    const text = `🛵 *Seguimiento de tu Pedido Silaomarket Hub*\n` +
      `*Código de Rastreo:* ${order.trackingCode}\n` +
      `*Estado actual:* ${order.trackingStatus ? order.trackingStatus.toUpperCase() : 'RECIBIDO'}\n` +
      `*Destino:* ${order.deliveryColonia || 'Silao Centro'}, Silao, Gto.\n` +
      `*Total:* $${order.total.toFixed(2)} MXN\n\n` +
      `Puedes seguir tu pedido y ver tu código QR aquí:\n${trackingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Seguimiento de Pedido en Traslado
                </h2>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-700">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pedido <span className="font-mono text-slate-200">{order.id}</span> · Código QR oficial de entrega
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: QR Code & Courier Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* The QR Code Component */}
            <OrderQRCode order={order} size={190} showActions={true} />

            {/* Courier Info Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Repartidor Asignado
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Hub Silao
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Repartidor:</span>
                  <span className="font-semibold text-slate-900">{order.courierName || 'Repartidor Hub Silao (Moto 03)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Unidad:</span>
                  <span className="font-medium text-slate-800">{order.courierVehicle || 'Motocicleta con Hielera Térmica'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contacto:</span>
                  <a href={`tel:${order.courierPhone || '4727221234'}`} className="font-mono text-blue-600 hover:underline">
                    {order.courierPhone || '472-722-1234'}
                  </a>
                </div>
              </div>

              {order.hasColdChain && (
                <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-900 text-xs flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>
                    <strong>Cadena Fría Activada:</strong> Este pedido viaja protegido en hielera térmica con hielo refrigerante.
                  </span>
                </div>
              )}
            </div>

            {/* Status Change Simulator for Couriers & Staff */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  Control de Estatus (Repartidor / Hub)
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-tight">
                Simula el avance del pedido en Silao para verificar la actualización en tiempo real del QR:
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {STATUS_ORDER.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAdvanceStatus(st)}
                    className={`py-1 px-2 text-[10px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
                      order.trackingStatus === st
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {st === 'recibido' && '1. Recibido'}
                    {st === 'en_recoleccion' && '2. Recolectando'}
                    {st === 'consolidado' && '3. Consolidado'}
                    {st === 'en_camino' && '4. En Camino'}
                    {st === 'entregado' && '5. Entregado'}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Live Tracking Timeline & Order Details (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Live Visual Timeline */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Estatus del Traslado en Tiempo Real
                </h3>
                <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
                  {order.trackingStatus ? order.trackingStatus.toUpperCase().replace('_', ' ') : 'RECIBIDO'}
                </span>
              </div>

              {/* Steps Vertical Timeline */}
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                {TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.status} className="relative group">
                      {/* Step Circle Indicator */}
                      <div 
                        className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isCurrent
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-2.5 h-2.5" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded animate-pulse">
                              En progreso
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Destino de Entrega en Silao
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cliente</span>
                  <span className="font-bold text-slate-900 block">{order.customerName}</span>
                  <span className="text-slate-600 font-mono">{order.customerPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Colonia / Zona</span>
                  <span className="font-bold text-blue-700 block">{order.deliveryColonia || 'Silao Centro'}</span>
                  <span className="text-slate-600 block line-clamp-1">{order.customerAddress || 'Entrega en domicilio local'}</span>
                </div>
              </div>
            </div>

            {/* Merchant Breakdown & Items */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-indigo-600" />
                  Comercios Consolidados ({order.merchantsCount || 1})
                </h4>
                <span className="text-xs font-mono font-bold text-slate-900">
                  Total: ${order.total.toFixed(2)} MXN {order.deliveryFee ? `(Envío Hub: $${order.deliveryFee.toFixed(2)})` : ''}
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-900 block truncate">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        🏪 {item.product.merchantName || 'Comercio Local'}
                        {item.product.isColdChain && ' · ❄️ Cadena Fría'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 shrink-0">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>📍 <strong>Hub Silao:</strong> Calle 5 de Mayo #45, Silao Centro · Tel: 472-722-1234</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={shareWhatsAppMessage}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartir Rastreo por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
