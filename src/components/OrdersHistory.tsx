import React, { useState } from 'react';
import { 
  ClipboardList, 
  Eye, 
  Calendar, 
  User, 
  CreditCard,
  ShoppingBag, 
  BarChart3,
  QrCode, 
  Snowflake,
  Lock,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Store,
  ShieldCheck,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Order } from '../types/inventory';
import { OrderReceiptModal } from './OrderReceiptModal';

export const OrdersHistory: React.FC = () => {
  const { 
    orders, 
    setActiveTab, 
    openTrackingModal,
    userRole,
    loggedMerchantId,
    loggedMerchant,
    registeredCustomer,
    loginCustomer,
    registerCustomer,
    logoutCustomer
  } = useInventory();

  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Form states for customer identification / registration
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Quick Tracking lookup
  const [trackingSearchCode, setTrackingSearchCode] = useState('');
  const [trackingLookupError, setTrackingLookupError] = useState<string | null>(null);

  // Normalization helper for 10-digit MX phone numbers
  const normalizePhone = (phoneStr: string) => phoneStr.replace(/\D/g, '').slice(-10);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const clean = normalizePhone(customerPhoneInput);
    if (!clean || clean.length < 8) {
      setAuthError('Por favor ingresa un número de teléfono válido (10 dígitos).');
      return;
    }

    const res = loginCustomer(customerPhoneInput.trim(), customerNameInput.trim());
    if (res.success) {
      setAuthSuccess('¡Sesión de cliente iniciada correctamente!');
    } else {
      setAuthError(res.message || 'Error al identificar tu número.');
    }
  };

  const handleQuickTrackingLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingLookupError(null);
    const code = trackingSearchCode.trim().toLowerCase();
    if (!code) {
      setTrackingLookupError('Por favor ingresa tu código de rastreo (ej. SLO-TRK-74921 o ORD-SLO-201).');
      return;
    }

    const found = orders.find(
      (o) =>
        (o.trackingCode && o.trackingCode.toLowerCase() === code) ||
        (o.id && o.id.toLowerCase() === code)
    );

    if (found) {
      openTrackingModal(found);
    } else {
      setTrackingLookupError('No encontramos ningún pedido con ese código de rastreo. Verifica los dígitos e intenta de nuevo.');
    }
  };

  // If user is client and is NOT registered, do not show any orders!
  if (userRole === 'cliente' && !registeredCustomer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Protected Access Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs mb-1">
            <Lock className="w-7 h-7 text-emerald-700" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Consulta Privada de <span className="text-emerald-700">Mis Pedidos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Por seguridad y confidencialidad comercial en Silao, los datos y compras solo están disponibles para los clientes que realizaron el pedido. Identifícate con tu número de teléfono registrado para consultar tu historial.
          </p>
        </div>

        {/* Customer Identification Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ingresa con tu Teléfono</h3>
              <p className="text-xs text-slate-500">
                Visualiza únicamente los pedidos y paquetes que has ordenado con tu número.
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Teléfono Celular (WhatsApp) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Ej. 472 123 4567"
                  value={customerPhoneInput}
                  onChange={(e) => setCustomerPhoneInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Ingresa el mismo teléfono con el que realizaste tus pedidos o deseas registrarte.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tu Nombre Completo (Opcional si ya eres cliente recurrente)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez / Dra. Elena Gómez"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Consultar Mis Pedidos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tienda')}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Store className="w-4 h-4 text-slate-500" />
                <span>Ir a la Tienda Silao</span>
              </button>
            </div>
          </form>
        </div>

        {/* Alternative: Direct Tracking Code Search */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>¿Tienes un Código de Rastreo Específico?</span>
          </div>
          <p className="text-xs text-slate-500">
            Si recibiste un código de rastreo (ej. de tu ticket o mensaje de WhatsApp), ingrésalo aquí para ver directamente el estado de ese paquete individual.
          </p>

          {trackingLookupError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{trackingLookupError}</span>
            </div>
          )}

          <form onSubmit={handleQuickTrackingLookup} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Código de rastreo ej. SLO-TRK-74921"
                value={trackingSearchCode}
                onChange={(e) => setTrackingSearchCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Rastrear Paquete
            </button>
          </form>
        </div>

      </div>
    );
  }

  // Scoped orders logic
  let displayedOrders: Order[] = [];
  if (userRole === 'admin') {
    displayedOrders = orders;
  } else if (userRole === 'negocio' && loggedMerchantId) {
    displayedOrders = orders.filter((o) => o.items.some((i) => i.product.merchantId === loggedMerchantId));
  } else if (userRole === 'cliente' && registeredCustomer) {
    const cleanCustPhone = normalizePhone(registeredCustomer.phone);
    displayedOrders = orders.filter((o) => {
      const orderPhoneClean = normalizePhone(o.customerPhone || '');
      const matchPhone = cleanCustPhone.length >= 8 && orderPhoneClean.length >= 8 && orderPhoneClean === cleanCustPhone;
      const matchName = o.customerName && registeredCustomer.name && (
        o.customerName.toLowerCase().trim() === registeredCustomer.name.toLowerCase().trim()
      );
      return matchPhone || matchName;
    });
  }

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
                : userRole === 'cliente'
                ? 'Mis Pedidos Anteriores'
                : 'Historial Central de Pedidos y Ventas (Admin Hub)'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {userRole === 'negocio'
              ? 'Listado de órdenes donde se solicitaron productos de tu tienda. Solo se muestran tus artículos y subtotales correspondientes.'
              : userRole === 'cliente'
              ? `Historial exclusivo de compras realizadas por ${registeredCustomer?.name} en Silao, Gto.`
              : 'Registro de todas las órdenes procesadas en la plataforma de Silao, con detalles y liquidaciones.'}
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

      {/* Customer Session Banner for Client */}
      {userRole === 'cliente' && registeredCustomer && (
        <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-950 text-sm">
                Cliente Registrado: {registeredCustomer.name}
              </p>
              <p className="text-emerald-800 mt-0.5">
                🔒 <strong>Privacidad activa:</strong> Mostrando únicamente los pedidos asociados a tu teléfono <strong>{registeredCustomer.phone}</strong>. Nadie más tiene acceso a tus compras.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('tienda')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Nueva Compra</span>
            </button>
            <button
              onClick={logoutCustomer}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold cursor-pointer flex items-center gap-1"
              title="Cerrar sesión de cliente o consultar con otro teléfono"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Cambiar Teléfono</span>
            </button>
          </div>
        </div>
      )}

      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
          <h3 className="text-base font-semibold text-slate-700">
            {userRole === 'negocio'
              ? 'Aún no hay pedidos recibidos con artículos de tu tienda'
              : userRole === 'cliente'
              ? 'No tienes pedidos anteriores registrados con este número'
              : 'Sin pedidos registrados todavía'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {userRole === 'negocio'
              ? 'En cuanto un cliente ordene productos de tu comercio, aparecerán aquí para empaque y recolección.'
              : userRole === 'cliente'
              ? `Realiza tu primera compra desde la Tienda Silao con tu teléfono ${registeredCustomer?.phone} para ver aquí tu historial y tickets de compra.`
              : 'Realiza una compra desde la Tienda en Línea para ver aquí el registro y comprobante.'}
          </p>
          {userRole === 'cliente' && (
            <div className="mt-5">
              <button
                onClick={() => setActiveTab('tienda')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Explorar Tienda Silao</span>
              </button>
            </div>
          )}
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
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
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
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-3">
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
