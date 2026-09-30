import React, { useState, useMemo } from 'react';
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
  Settings,
  Snowflake,
  Store,
  ChevronLeft,
  Building2,
  PackageCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { DeliveryType, CartItem } from '../types/inventory';
import { SILAO_COLONIAS } from '../data/silaoMarketData';
import { calculateDynamicDeliveryFee } from '../utils/deliveryFee';
import { checkOperatingHours, checkHourCapacity } from '../utils/operatingHours';

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
    createOrder,
    orders,
    settings,
    setIsSettingsModalOpen
  } = useInventory();

  // Validación de horario de pedidos (8:00 AM a 8:00 PM)
  const operatingHours = useMemo(() => {
    return checkOperatingHours(settings);
  }, [settings]);

  // Validación de capacidad anti-saturación
  const capacityStatus = useMemo(() => {
    return checkHourCapacity(orders, settings.maxOrdersPerHour || 12);
  }, [orders, settings.maxOrdersPerHour]);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedColonia, setSelectedColonia] = useState(SILAO_COLONIAS[0]);
  const [customerStreet, setCustomerStreet] = useState('');
  const [deliveryPoint, setDeliveryPoint] = useState(settings.defaultPickupPoint || '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('domicilio');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega'>('efectivo');
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Group cart items by merchant
  const groupedCartByMerchant = useMemo(() => {
    const map = new Map<string, { merchantName: string; merchantAddress?: string; isColdChain?: boolean; items: CartItem[] }>();

    cart.forEach((item) => {
      const mName = item.product.merchantName || 'Comercio Local de Silao';
      const mAddress = item.product.merchantAddress || 'Silao, Gto.';
      const isCold = Boolean(item.product.isColdChain);

      if (!map.has(mName)) {
        map.set(mName, {
          merchantName: mName,
          merchantAddress: mAddress,
          isColdChain: isCold,
          items: [],
        });
      }

      const entry = map.get(mName)!;
      entry.items.push(item);
      if (isCold) entry.isColdChain = true;
    });

    return Array.from(map.values());
  }, [cart]);

  // Check if any product requires cold chain
  const hasColdChainItems = useMemo(() => {
    return cart.some((i) => i.product.isColdChain);
  }, [cart]);

  // Total items quantity (piezas totales)
  const totalItemsQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Cálculo dinámico del envío consolidado de $25 a $40 pesos
  const deliveryFeeCalc = useMemo(() => {
    return calculateDynamicDeliveryFee(totalItemsQuantity, groupedCartByMerchant.length);
  }, [totalItemsQuantity, groupedCartByMerchant.length]);

  const deliveryFee = deliveryType === 'domicilio' ? deliveryFeeCalc.fee : 0;
  const finalOrderTotal = cartTotal + deliveryFee;

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
    if (window.confirm('¿Deseas vaciar todos los productos del carrito?')) {
      clearCart();
    }
  };

  const processOrderSubmission = (sendWhatsApp: boolean) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y número de teléfono.');
      return;
    }

    if (deliveryType === 'domicilio' && !customerStreet.trim()) {
      setErrorMsg('Por favor ingresa la calle, número y referencias para la entrega a domicilio en Silao.');
      return;
    }

    const fullAddress = deliveryType === 'domicilio' 
      ? `${customerStreet.trim()}, ${selectedColonia}, Silao, Gto.` 
      : undefined;

    const scheduledTime = !operatingHours.isOpen
      ? `Programado (${operatingHours.nextOpenTimeStr})`
      : capacityStatus.isSaturated
        ? 'Siguiente Franja Disponible'
        : 'Despacho Inmediato';

    const created = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: fullAddress,
      deliveryPoint: deliveryType === 'punto_fijo' ? deliveryPoint.trim() : undefined,
      deliveryColonia: selectedColonia,
      deliveryType,
      paymentMethod,
      items: cart,
      subtotal: cartSubtotal,
      discountSavings: cartSavings,
      deliveryFee,
      total: finalOrderTotal,
      appliedTier: priceTier,
      hasColdChain: hasColdChainItems,
      merchantsCount: groupedCartByMerchant.length,
      merchantsNames: groupedCartByMerchant.map((g) => g.merchantName),
      scheduledTime,
    });

    if (sendWhatsApp) {
      const paymentLabels: Record<string, string> = {
        transferencia: 'Transferencia SPEI',
        efectivo: 'Efectivo al recibir en Silao',
        tarjeta: 'Tarjeta de Débito/Crédito en entrega',
        contra_entrega: 'Pago Contra Entrega en Silao',
      };

      // Breakdown by merchant
      let merchantsText = '';
      groupedCartByMerchant.forEach((g) => {
        merchantsText += `\n🏪 *${g.merchantName}* ${g.isColdChain ? '❄️ [Cadena Fría]' : ''}\n`;
        g.items.forEach((item) => {
          merchantsText += `   • ${item.quantity}x ${item.product.name} - $${(item.unitPrice * item.quantity).toFixed(2)}\n`;
        });
      });

      const deliveryInfo = deliveryType === 'domicilio'
        ? `📍 *Entrega a Domicilio en Silao:*\n   ${fullAddress}`
        : `🏢 *Punto de Entrega / Recolección en Hub:*\n   ${deliveryPoint.trim() || 'Hub Central Silao - 5 de Mayo #45'}`;

      const message = `🛒 *NUEVO PEDIDO CONSOLIDADO - SILAOMARKET ON LINE (SILAO, GTO)*\n\n` +
        `*Folio:* #${created.id}\n` +
        `*Cliente:* ${customerName.trim()}\n` +
        `*WhatsApp:* ${customerPhone.trim()}\n` +
        `${deliveryInfo}\n` +
        `*Método de Pago:* ${paymentLabels[paymentMethod] || paymentMethod}\n` +
        `*Comercios involucrados:* ${groupedCartByMerchant.length} negocios de Silao\n` +
        (hasColdChainItems ? `❄️ *ATENCIÓN HUB:* Este pedido incluye productos de Cadena Fría (Aguas/Helados/Paletas/Cerveza). Despachar con hielera térmica.\n` : '') +
        (orderNotes ? `📝 *Notas del cliente:* ${orderNotes.trim()}\n` : '') +
        `\n*DETALLE DE COMPRA:*${merchantsText}\n` +
        `*Subtotal Productos:* $${cartTotal.toFixed(2)} MXN\n` +
        (deliveryFee > 0 ? `*Costo de Envío Consolidado Hub Silao:* $${deliveryFee.toFixed(2)} MXN (${deliveryFeeCalc.description})\n` : `*Envío:* GRATIS (Recolección en Hub)\n`) +
        `*TOTAL A PAGAR (UN SOLO PAGO):* $${finalOrderTotal.toFixed(2)} MXN\n\n` +
        `¿Me confirman de recibido en el Hub Silao para preparar el pedido? ¡Gracias!`;

      let targetPhone = (settings.whatsappNumber || '524721234567').replace(/[^0-9]/g, '');
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {checkoutStep === 'checkout' && (
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
                title="Volver a revisar productos"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>{checkoutStep === 'cart' ? 'Tu Carrito Multi-Comercio' : 'Finalizar Pedido Consolidado'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {checkoutStep === 'cart' 
                  ? `${cart.length} artículos de ${groupedCartByMerchant.length} comercios de Silao`
                  : 'Un solo pago y entrega centralizada desde el Hub Silao'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {checkoutStep === 'cart' && cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Vaciar todo el carrito"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cold Chain Alert Banner */}
        {hasColdChainItems && (
          <div className="px-4 py-2.5 bg-cyan-50 border-b border-cyan-200 flex items-center gap-2 text-cyan-950 text-xs shrink-0">
            <Snowflake className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>
              <strong>Cadena de frío activa:</strong> Tu pedido incluye helados, paletas, aguas o cervezas. El Hub Silao lo empaca con hielera térmica.
            </span>
          </div>
        )}

        {/* Hub Consolidation Notice */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hub Central Silao: <strong>1 solo pago y 1 sola vuelta</strong></span>
          </div>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            {groupedCartByMerchant.length} tiendas
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {checkoutStep === 'cart' ? (
            cart.length > 0 ? (
              <div className="space-y-5">
                {/* Grouped Items by Merchant */}
                {groupedCartByMerchant.map((group) => (
                  <div key={group.merchantName} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                    
                    {/* Merchant Header Bar */}
                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {group.merchantName}
                        </span>
                      </div>
                      {group.isColdChain && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 shrink-0 flex items-center gap-0.5">
                          <Snowflake className="w-2.5 h-2.5" />
                          <span>Cadena Fría</span>
                        </span>
                      )}
                    </div>

                    {/* Merchant Items List */}
                    <div className="divide-y divide-slate-100 p-2 space-y-1">
                      {group.items.map((item) => (
                        <div key={item.product.id} className="py-2 px-1 flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center p-1 overflow-hidden">
                            {item.product.imageUrl ? (
                              <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Silao</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              ${item.unitPrice.toFixed(2)} c/u
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer"
                            >
                              +
                            </button>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors ml-1 cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">Tu carrito de SilaoMarket está vacío</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Agrega productos de abarrotes, refacciones, farmacia, flores, helados, aguas o cerveza para comenzar tu pedido consolidado.
                </p>
              </div>
            )
          ) : (
            /* CHECKOUT STEP: Silao Delivery Info */
            <div className="space-y-4">
              
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Alerta de Horario de Pedidos (8:00 AM a 8:00 PM) */}
              {!operatingHours.isOpen && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Horario de Pedidos en Silao: 8:00 AM a 8:00 PM</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Actualmente el Hub Silao está fuera de horario de despacho ({operatingHours.currentHour}:{operatingHours.currentMinute.toString().padStart(2, '0')} hrs). Tu pedido quedará <strong>programado para despacharse {operatingHours.nextOpenTimeStr}</strong>.
                  </p>
                </div>
              )}

              {/* Alerta de Capacidad Anti-Saturación */}
              {capacityStatus.isSaturated && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Alta Demanda en esta Hora ({capacityStatus.currentHourOrders}/{capacityStatus.maxAllowed} envíos)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-red-800">
                    Para cuidar los tiempos de entrega, esta hora ha alcanzado el límite. Tu pedido se despachará en el siguiente turno disponible con prioridad.
                  </p>
                </div>
              )}

              {/* Delivery Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Modalidad de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('domicilio')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      deliveryType === 'domicilio'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>A Domicilio en Silao</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Ruta consolidada Hub: <strong className="text-slate-800">${deliveryFeeCalc.fee.toFixed(2)} MXN</strong> ($25 a $40 según comercios y piezas)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('punto_fijo')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      deliveryType === 'punto_fijo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Recoger en Hub Silao</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Sin costo de envío en 5 de Mayo #45, Centro
                    </span>
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Carlos López"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono WhatsApp (Silao) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 472 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {deliveryType === 'domicilio' ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Colonia o Fraccionamiento en Silao *
                      </label>
                      <select
                        value={selectedColonia}
                        onChange={(e) => setSelectedColonia(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {SILAO_COLONIAS.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Calle, Número Exterior / Interior y Referencias *
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Ej. Calle Hidalgo #45 entre Zaragoza y 5 de Mayo, fachada verde portón café..."
                        value={customerStreet}
                        onChange={(e) => setCustomerStreet(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Punto Fijo de Recolección en Silao
                    </label>
                    <input
                      type="text"
                      value={deliveryPoint || settings.defaultPickupPoint || 'Hub Central Silao - Calle 5 de Mayo #45, Silao Centro'}
                      onChange={(e) => setDeliveryPoint(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Método de Pago (1 Solo Pago para todo el pedido)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="efectivo">💵 Efectivo al recibir en Silao</option>
                    <option value="transferencia">📱 Transferencia SPEI / Banco</option>
                    <option value="tarjeta">💳 Tarjeta Débito / Crédito al entregar</option>
                    <option value="contra_entrega">🤝 Pago Contra Entrega</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indicaciones especiales para el repartidor o comercios
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Cerveza extra fría, tocar el timbre blanco..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer Summary & Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
            
            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal productos ({totalItemsQuantity} piezas en {groupedCartByMerchant.length} tienda{groupedCartByMerchant.length > 1 ? 's' : ''}):</span>
                <span className="font-mono font-medium">${cartTotal.toFixed(2)}</span>
              </div>

              {checkoutStep === 'checkout' && deliveryType === 'domicilio' && (
                <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex justify-between items-center text-slate-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Envío Consolidado Hub Silao:</span>
                    </span>
                    <span className="font-mono font-black text-emerald-800 text-sm">${deliveryFee.toFixed(2)} MXN</span>
                  </div>
                  <div className="text-[10px] text-slate-600 flex items-center justify-between">
                    <span>Ajuste por {groupedCartByMerchant.length} comercio(s) y {totalItemsQuantity} piezas:</span>
                    <span className="font-bold text-emerald-700">{deliveryFeeCalc.description}</span>
                  </div>
                </div>
              )}

              {checkoutStep === 'cart' && (
                <div className="flex justify-between items-center text-[11px] text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Envío a domicilio estimado ($25 a $40):</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">${deliveryFeeCalc.fee.toFixed(2)} MXN</span>
                </div>
              )}

              {cartSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Ahorro en comercios:</span>
                  <span className="font-mono">-${cartSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total a Pagar (1 solo pago):</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-slate-900">
                    ${(checkoutStep === 'checkout' ? finalOrderTotal : cartTotal).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">MXN</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceder a Domicilio y Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => processOrderSubmission(true)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Pedido al Hub Silao por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => processOrderSubmission(false)}
                  className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Registrar Pedido sin abrir WhatsApp</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
