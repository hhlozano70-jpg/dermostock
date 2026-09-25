import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  MapPin,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { DeliveryType } from '../types/inventory';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartSubtotal, 
    cartSavings, 
    cartTotal,
    priceTier,
    setPriceTier,
    createOrder,
    settings,
    setIsSettingsModalOpen
  } = useInventory();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryPoint, setDeliveryPoint] = useState(settings.defaultPickupPoint || '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('domicilio');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega'>('transferencia');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setCheckoutStep('cart');
    setErrorMsg('');
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    if (!deliveryPoint && settings.defaultPickupPoint) {
      setDeliveryPoint(settings.defaultPickupPoint);
    }
    setCheckoutStep('checkout');
  };

  const handleClearAll = () => {
    if (cart.length === 0) return;
    if (window.confirm('¿Estás seguro de que deseas vaciar todos los productos del carrito?')) {
      clearCart();
    }
  };

  const processOrderSubmission = (sendWhatsApp: boolean) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y teléfono de contacto.');
      return;
    }

    if (deliveryType === 'domicilio' && !customerAddress.trim()) {
      setErrorMsg('Por favor ingresa la dirección completa para la entrega a domicilio.');
      return;
    }

    if (deliveryType === 'punto_fijo' && !deliveryPoint.trim()) {
      setErrorMsg('Por favor especifica el punto fijo de entrega o encuentro.');
      return;
    }

    const created = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: deliveryType === 'domicilio' ? customerAddress.trim() : undefined,
      deliveryPoint: deliveryType === 'punto_fijo' ? deliveryPoint.trim() : undefined,
      deliveryType,
      paymentMethod,
      items: cart,
      subtotal: cartSubtotal,
      discountSavings: cartSavings,
      total: cartTotal,
      appliedTier: priceTier,
    });

    if (sendWhatsApp) {
      // Build WhatsApp message
      const paymentLabels: Record<string, string> = {
        transferencia: 'Transferencia Electrónica (SPEI)',
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta de Débito/Crédito',
        contra_entrega: 'Pago Contra Entrega',
      };

      const itemsText = cart
        .map((i) => `• ${i.quantity}x ${i.product.name} ($${i.unitPrice.toFixed(2)} c/u)`)
        .join('\n');

      const deliveryInfo = deliveryType === 'domicilio'
        ? `*Modalidad:* Entrega a Domicilio\n*Dirección:* ${customerAddress.trim()}`
        : `*Modalidad:* En un Punto Fijo a Definir\n*Punto de Encuentro:* ${deliveryPoint.trim() || 'A acordar por WhatsApp'}`;

      const message = `¡Hola ${settings.businessName}! Deseo confirmar el siguiente pedido:\n\n` +
        `*Folio de Pedido:* #${created.id}\n` +
        `*Cliente:* ${customerName.trim()}\n` +
        `*Teléfono:* ${customerPhone.trim()}\n` +
        `${deliveryInfo}\n` +
        `*Método de Pago:* ${paymentLabels[paymentMethod] || paymentMethod}\n` +
        `*Tarifa Aplicada:* ${priceTier.toUpperCase()}\n\n` +
        `*Productos:* \n${itemsText}\n\n` +
        `*Total a Pagar:* $${cartTotal.toFixed(2)} MXN\n` +
        (cartSavings > 0 ? `*Ahorro Total:* $${cartSavings.toFixed(2)} MXN\n\n` : '\n') +
        `¿Me confirman disponibilidad y los datos para pago/entrega? ¡Gracias!`;

      let targetPhone = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');
      if (targetPhone.length === 10) {
        targetPhone = '52' + targetPhone;
      }

      const waUrl = targetPhone 
        ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;

      window.open(waUrl, '_blank');
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900">
                {checkoutStep === 'cart' ? 'Carrito de Compras' : 'Finalizar Pedido'}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                title="Configuración de WhatsApp y entregas"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            
            {checkoutStep === 'cart' ? (
              <>
                {/* Active Tier Switcher in Cart */}
                <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Tarifa Aplicada:</span>
                    <span className="text-xs font-mono font-bold uppercase text-blue-700">
                      {priceTier}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPriceTier('comercial')}
                      className={`py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer ${
                        priceTier === 'comercial'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Comercial
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceTier('mayorista')}
                      className={`py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer ${
                        priceTier === 'mayorista'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Mayoreo (-40%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceTier('promocion')}
                      className={`py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer ${
                        priceTier === 'promocion'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Promo (-60%)
                    </button>
                  </div>
                </div>

                {/* Items Header & "Vaciar Carrito" Action */}
                {cart.length > 0 && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'artículo' : 'artículos'}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                      title="Eliminar todos los productos del carrito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar Carrito</span>
                    </button>
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ShoppingBag className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
                    <p className="text-base font-medium text-slate-600">Tu carrito está vacío</p>
                    <p className="text-xs text-slate-400 mt-1">Explora nuestro catálogo y agrega productos.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <li key={item.product.id} className="py-4 flex gap-3 items-center">
                        {/* Mini preview thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-full h-full object-contain p-0.5" 
                            />
                          ) : (
                            <span className="font-bold text-[10px] text-slate-500">
                              {item.product.brand.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                            {priceTier !== 'comercial' && (
                              <span className="text-[10px] text-slate-400 line-through font-mono">
                                ${item.product.commercialPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              (Stock: {item.product.stock})
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper (Partial modification / deletion) */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeFromCart(item.product.id);
                              } else {
                                updateCartQuantity(item.product.id, item.quantity - 1);
                              }
                            }}
                            className="px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-slate-50 font-mono text-xs cursor-pointer transition-colors"
                            title={item.quantity <= 1 ? "Eliminar artículo" : "Reducir cantidad"}
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-xs font-mono font-bold text-slate-800 tabular-nums min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= item.product.stock}
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs cursor-pointer transition-colors"
                            title="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete single item (Borrado individual) */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              /* Checkout Form */
              <div className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* WhatsApp destination indicator */}
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp receptor: <strong>{settings.whatsappNumber || 'Sin configurar'}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono de Contacto (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 55 1234 5678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* EXCLUSIVE DELIVERY OPTIONS: ONLY 'domicilio' OR 'punto_fijo' */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Modalidad de Entrega Exclusiva *
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('domicilio')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                        deliveryType === 'domicilio'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>Entrega a Domicilio</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">Envío directo a tu casa u oficina</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('punto_fijo')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                        deliveryType === 'punto_fijo'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>Punto Fijo a Definir</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">Estación, plaza o lugar acordado</span>
                    </button>
                  </div>
                </div>

                {/* Field based on delivery mode */}
                {deliveryType === 'domicilio' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dirección de Entrega a Domicilio *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Calle, número ext/int, colonia, código postal, alcaldía o municipio y referencias de entrega"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Punto Fijo de Entrega / Encuentro a Definir *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Estación Metro Zapata / Plaza Galerías / Por coordinar"
                      value={deliveryPoint}
                      onChange={(e) => setDeliveryPoint(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Puedes especificar el punto exacto o indicar que se coordinará por WhatsApp.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Método de Pago Preferido
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="transferencia">Transferencia Electrónica (SPEI)</option>
                    <option value="efectivo">Efectivo contra Entrega</option>
                    <option value="tarjeta">Terminal / Tarjeta de Débito o Crédito</option>
                    <option value="contra_entrega">Pago Contra Entrega</option>
                  </select>
                </div>
              </div>
            )}

          </div>

          {/* Footer & Financial Totals */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal regular:</span>
                  <span className="font-mono tabular-nums">${cartSubtotal.toFixed(2)} MXN</span>
                </div>
                {cartSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Ahorro aplicado ({priceTier}):</span>
                    <span className="font-mono tabular-nums">-${cartSavings.toFixed(2)} MXN</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total a Pagar:</span>
                  <span className="font-mono tabular-nums text-lg">${cartTotal.toFixed(2)} MXN</span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Continuar con la Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2">
                  {/* Primary WhatsApp Order Button */}
                  <button
                    type="button"
                    onClick={() => processOrderSubmission(true)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Pedir por WhatsApp</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="py-2.5 px-3 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Regresar
                    </button>
                    <button
                      type="button"
                      onClick={() => processOrderSubmission(false)}
                      className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Registrar en inventario sin abrir WhatsApp"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solo Registrar en Sistema</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
