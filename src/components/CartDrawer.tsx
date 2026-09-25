import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  AlertCircle 
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PriceTier } from '../types/inventory';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartSavings, 
    cartTotal,
    priceTier,
    setPriceTier,
    createOrder
  } = useInventory();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'envio' | 'sucursal'>('envio');
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
    setCheckoutStep('checkout');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor ingresa nombre y teléfono de contacto.');
      return;
    }
    if (deliveryType === 'envio' && !customerAddress.trim()) {
      setErrorMsg('Por favor ingresa la dirección de entrega para el envío.');
      return;
    }

    createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: deliveryType === 'envio' ? customerAddress.trim() : undefined,
      deliveryType,
      paymentMethod,
      items: cart,
      subtotal: cartSubtotal,
      discountSavings: cartSavings,
      total: cartTotal,
      appliedTier: priceTier,
    });

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
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900">
                {checkoutStep === 'cart' ? 'Carrito de Compras' : 'Finalizar Pedido'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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
                        {/* Mini preview */}
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                          {item.product.brand.slice(0, 3).toUpperCase()}
                        </div>

                        {/* Title & Price */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">
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

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-md bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 text-slate-500 hover:text-slate-800 font-mono text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-xs font-mono font-bold text-slate-800 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= item.product.stock}
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar del carrito"
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
              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    key="customer-name-input"
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={customerName || ''}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    key="customer-phone-input"
                    type="tel"
                    required
                    placeholder="Ej. 55 1234 5678"
                    value={customerPhone || ''}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Modalidad de Entrega
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('envio')}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                        deliveryType === 'envio'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Envío a Domicilio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('sucursal')}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                        deliveryType === 'sucursal'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Retiro en Sucursal</span>
                    </button>
                  </div>
                </div>

                {deliveryType === 'envio' && (
                  <div key="delivery-address-container">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Dirección de Entrega *
                    </label>
                    <textarea
                      key="customer-address-textarea"
                      required
                      rows={2}
                      placeholder="Calle, número, colonia, código postal y ciudad"
                      value={customerAddress || ''}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    key="customer-payment-select"
                    value={paymentMethod || 'transferencia'}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="transferencia">Transferencia Electrónica (SPEI)</option>
                    <option value="efectivo">Efectivo contra Entrega</option>
                    <option value="tarjeta">Terminal / Tarjeta de Débito o Crédito</option>
                  </select>
                </div>
              </form>
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
                  <span>Continuar al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="py-2.5 px-3 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Regresar
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Confirmar Compra</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
