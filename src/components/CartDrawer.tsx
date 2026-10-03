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
  AlertTriangle,
  Upload,
  FileText,
  Paperclip,
  Sparkles,
  Plus,
  Boxes
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { DeliveryType, CartItem, Product } from '../types/inventory';
import { SILAO_COLONIAS } from '../data/silaoMarketData';
import { calculateDynamicDeliveryFee } from '../utils/deliveryFee';
import { 
  checkOperatingHours, 
  checkHourCapacity, 
  validateCartMerchantsSchedule, 
  checkMerchantOperatingStatus,
  MerchantOperatingStatus 
} from '../utils/operatingHours';
import { calculateCollectionLeadTime } from '../utils/collectionTime';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    merchants,
    addToCart,
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
    setIsSettingsModalOpen,
    setIsCustomOrderModalOpen,
    registeredCustomer
  } = useInventory();

  // Validación de horario de pedidos del Hub (8:00 AM a 8:00 PM)
  const operatingHours = useMemo(() => {
    return checkOperatingHours(settings);
  }, [settings]);

  // Validación de horarios de servicio específicos de cada comercio en el carrito (restricción por apertura)
  const merchantsScheduleValidation = useMemo(() => {
    return validateCartMerchantsSchedule(cart, merchants);
  }, [cart, merchants]);

  // Validación de capacidad anti-saturación
  const capacityStatus = useMemo(() => {
    return checkHourCapacity(orders, settings.maxOrdersPerHour || 12);
  }, [orders, settings.maxOrdersPerHour]);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState(() => registeredCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(() => registeredCustomer?.phone || '');
  const [selectedColonia, setSelectedColonia] = useState(() => registeredCustomer?.colonia || SILAO_COLONIAS[0]);
  const [customerStreet, setCustomerStreet] = useState(() => registeredCustomer?.address || '');
  const [deliveryPoint, setDeliveryPoint] = useState(settings.defaultPickupPoint || '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('domicilio');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega'>('efectivo');
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill si el cliente inicia sesión o se actualiza
  useEffect(() => {
    if (registeredCustomer) {
      if (!customerName) setCustomerName(registeredCustomer.name);
      if (!customerPhone) setCustomerPhone(registeredCustomer.phone);
      if (!customerStreet && registeredCustomer.address) setCustomerStreet(registeredCustomer.address);
      if (registeredCustomer.colonia) setSelectedColonia(registeredCustomer.colonia);
    }
  }, [registeredCustomer]);

  // Estados para Servicio de Traslado / Camioneta de Carga
  const [freightDetails, setFreightDetails] = useState('');
  const [needsLoadingHelp, setNeedsLoadingHelp] = useState(false);

  // Estados para Encargo Especial / Fuera de Catálogo
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customMerchantId, setCustomMerchantId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [customPriceEst, setCustomPriceEst] = useState('');
  const [customFile, setCustomFile] = useState<{ name: string; type: string; dataUrl?: string } | null>(null);

  // Archivos adjuntos para ítems del carrito
  const [itemAttachments, setItemAttachments] = useState<Record<string, { fileName: string; type: string; notes?: string }>>({});

  // Group cart items by merchant with operating hours status
  const groupedCartByMerchant = useMemo(() => {
    const map = new Map<string, { 
      merchantId: string;
      merchantName: string; 
      merchantAddress?: string; 
      isColdChain?: boolean; 
      scheduleStatus: MerchantOperatingStatus;
      items: CartItem[] 
    }>();

    cart.forEach((item) => {
      const mName = item.product.merchantName || 'Comercio Local de Silao';
      const mId = item.product.merchantId || mName;
      const mAddress = item.product.merchantAddress || 'Silao, Gto.';
      const isCold = Boolean(item.product.isColdChain);
      const merchantObj = merchants.find(m => m.id === item.product.merchantId || m.name === item.product.merchantName);
      const scheduleStatus = checkMerchantOperatingStatus(merchantObj);

      if (!map.has(mId)) {
        map.set(mId, {
          merchantId: mId,
          merchantName: mName,
          merchantAddress: mAddress,
          isColdChain: isCold,
          scheduleStatus,
          items: [],
        });
      }

      const entry = map.get(mId)!;
      entry.items.push(item);
      if (isCold) entry.isColdChain = true;
    });

    return Array.from(map.values());
  }, [cart, merchants]);

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

  // Cálculo del tiempo de recolección previa (1 a 2 horas) según comercios y productos
  const collectionLeadTime = useMemo(() => {
    return calculateCollectionLeadTime({
      merchantsCount: groupedCartByMerchant.length,
      items: cart,
      hasColdChain: hasColdChainItems,
    });
  }, [groupedCartByMerchant.length, cart, hasColdChainItems]);

  const freightTransferCost = settings.freightTransferCost || 150;
  const isLargeVolumeSuggested = totalItemsQuantity >= (settings.largeVolumeThresholdPieces || 20);

  const deliveryFee = deliveryType === 'domicilio' 
    ? deliveryFeeCalc.fee 
    : deliveryType === 'traslado_carga'
      ? freightTransferCost
      : 0;
  const finalOrderTotal = cartTotal + deliveryFee;

  const handleCreateCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      alert('Por favor ingresa qué producto o servicio necesitas solicitar.');
      return;
    }
    const targetMerchant = merchants.find(m => m.id === customMerchantId);
    const parsedPrice = parseFloat(customPriceEst) || 0;

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      sku: `ENCARGO-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `[Encargo Especial] ${customTitle.trim()}`,
      presentation: customDetails.trim() || 'Producto / servicio solicitado fuera de catálogo',
      brand: targetMerchant ? targetMerchant.name : 'Comercio Local de Silao',
      category: 'Servicios Personalizados',
      merchantId: targetMerchant ? targetMerchant.id : (merchants[0]?.id || 'merch-cerrajeria-silao'),
      merchantName: targetMerchant ? targetMerchant.name : 'Hub Central Silao (Encargo Abierto)',
      merchantCategory: 'Servicios Personalizados',
      merchantAddress: targetMerchant?.address || 'Silao Centro',
      isColdChain: false,
      commercialPrice: parsedPrice,
      wholesalePrice: parsedPrice,
      promoPrice: parsedPrice,
      stock: 999,
      minStockAlert: 1,
      packagingType: 'service',
      description: customDetails.trim(),
      isCustomRequest: true,
      requiresCustomerFile: Boolean(customFile),
    };

    addToCart(customProduct, 1);
    if (customFile) {
      setItemAttachments(prev => ({
        ...prev,
        [customProduct.id]: {
          fileName: customFile.name,
          type: customFile.type,
          notes: customDetails.trim(),
        }
      }));
    }

    setCustomTitle('');
    setCustomDetails('');
    setCustomPriceEst('');
    setCustomFile(null);
    setIsCustomModalOpen(false);
  };

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
    // Restricción de horario: no se puede pedir tan temprano si algún negocio aún no abre
    if (merchantsScheduleValidation.hasEarlyMerchants) {
      setErrorMsg(
        merchantsScheduleValidation.restrictionReason || 
        'No es posible realizar el pedido tan temprano porque hay comercios que aún no han abierto sus puertas.'
      );
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y número de teléfono.');
      return;
    }

    if ((deliveryType === 'domicilio' || deliveryType === 'traslado_carga') && !customerStreet.trim()) {
      setErrorMsg('Por favor ingresa la calle, número y referencias para la entrega o traslado en Silao.');
      return;
    }

    const fullAddress = (deliveryType === 'domicilio' || deliveryType === 'traslado_carga')
      ? `${customerStreet.trim()}, ${selectedColonia}, Silao, Gto.` 
      : undefined;

    const scheduledTime = !operatingHours.isOpen
      ? `Programado (${operatingHours.nextOpenTimeStr})`
      : capacityStatus.isSaturated
        ? 'Siguiente Franja Disponible'
        : 'Despacho Inmediato';

    const uploadedFilesArray = Object.entries(itemAttachments).map(([pId, att]) => {
      const itemFound = cart.find(i => i.product.id === pId);
      return {
        itemName: itemFound ? itemFound.product.name : 'Servicio',
        fileName: att.fileName,
        type: att.type,
        notes: att.notes
      };
    });

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
      isLargeVolumeOrder: isLargeVolumeSuggested || deliveryType === 'traslado_carga',
      requiresFreightOrTransfer: deliveryType === 'traslado_carga',
      freightDetails: freightDetails.trim(),
      freightCost: deliveryType === 'traslado_carga' ? freightTransferCost : 0,
      customerUploadedFiles: uploadedFilesArray,
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
          const isCustom = item.product.isCustomRequest ? ' ✨ [ENCARGO ESPECIAL]' : '';
          merchantsText += `   • ${item.quantity}x ${item.product.name}${isCustom} - $${(item.unitPrice * item.quantity).toFixed(2)}\n`;
        });
      });

      let deliveryInfo = '';
      if (deliveryType === 'traslado_carga') {
        deliveryInfo = `🚚 *MODALIDAD: SERVICIO DE TRASLADO / CAMIONETA DE CARGA (GRAN VOLUMEN)*\n` +
          `📍 *Destino en Silao:*\n   ${fullAddress}\n` +
          (freightDetails ? `📦 *Detalles de Carga:* ${freightDetails.trim()}\n` : '') +
          (needsLoadingHelp ? `💪 *Requiere chofer de apoyo para maniobra de carga/descarga*\n` : '') +
          `*Costo Flete Traslado:* $${freightTransferCost.toFixed(2)} MXN`;
      } else if (deliveryType === 'domicilio') {
        deliveryInfo = `📍 *Entrega a Domicilio en Silao:*\n   ${fullAddress}\n` +
          `*Envío Consolidado Hub:* $${deliveryFee.toFixed(2)} MXN (${deliveryFeeCalc.description})`;
      } else {
        deliveryInfo = `🏢 *Punto de Entrega / Recolección en Hub:*\n   ${deliveryPoint.trim() || 'Hub Central Silao - 5 de Mayo #45'}\n` +
          `*Envío:* GRATIS (Recolección en Hub)`;
      }

      let attachedFilesText = '';
      if (uploadedFilesArray.length > 0) {
        attachedFilesText = `\n📎 *ARCHIVOS / DOCUMENTOS SUBIDOS POR EL CLIENTE:*\n` +
          uploadedFilesArray.map(f => `   • Para: ${f.itemName} -> Archivo: ${f.fileName} (${f.type})`).join('\n') +
          `\n   *(El cliente enviará el documento/foto por este chat si se requiere reconfirmar)*\n`;
      }

      const message = `🛒 *NUEVO PEDIDO CONSOLIDADO - SILAOMARKET ON LINE (SILAO, GTO)*\n\n` +
        `*Folio:* #${created.id}\n` +
        `*Cliente:* ${customerName.trim()}\n` +
        `*WhatsApp:* ${customerPhone.trim()}\n` +
        `${deliveryInfo}\n` +
        `*Método de Pago:* ${paymentLabels[paymentMethod] || paymentMethod}\n` +
        `*Comercios involucrados:* ${groupedCartByMerchant.length} negocios de Silao\n` +
        `⏱️ *Tiempo de Recolección Previa:* ${collectionLeadTime.hoursFormatted} (${collectionLeadTime.minutes} min antes de entrega)\n` +
        `📋 *Logística Hub Silao:* ${collectionLeadTime.breakdown}\n` +
        (hasColdChainItems ? `❄️ *ATENCIÓN HUB:* Este pedido incluye productos de Cadena Fría (Aguas/Helados/Paletas/Cerveza). Despachar con hielera térmica.\n` : '') +
        (isLargeVolumeSuggested ? `📦 *AVISO GRAN VOLUMEN:* Pedido de ${totalItemsQuantity} piezas.\n` : '') +
        (orderNotes ? `📝 *Notas del cliente:* ${orderNotes.trim()}\n` : '') +
        attachedFilesText +
        `\n*DETALLE DE COMPRA:*${merchantsText}\n` +
        `*Subtotal Productos:* $${cartTotal.toFixed(2)} MXN\n` +
        `*Envío / Flete:* $${deliveryFee.toFixed(2)} MXN\n` +
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
              <div className="space-y-4">
                {/* Alerta de Gran Volumen (si >= 20 piezas) */}
                {isLargeVolumeSuggested && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <strong>Gran Volumen Detectado ({totalItemsQuantity} piezas):</strong>
                        <p className="text-[11px] text-amber-900">
                          Te sugerimos seleccionar el <strong>Servicio de Traslado / Camioneta de Carga</strong> en el siguiente paso para transportar tu pedido de forma segura en Silao.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón para Encargo Especial Fuera de Catálogo */}
                <button
                  type="button"
                  onClick={() => setIsCustomOrderModalOpen(true)}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>¿No encuentras lo que buscas? Pide un Producto o Servicio por Encargo</span>
                </button>

                {/* Alerta de Comercios que aún no han abierto */}
                {merchantsScheduleValidation.hasEarlyMerchants && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Atención: Hay comercios que aún no han abierto</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900">
                      No es posible procesar pedidos tan temprano antes de que los negocios abran. Podrás pedir a partir de las <strong>{merchantsScheduleValidation.latestOpeningTime12h}</strong> o puedes retirar sus productos para pedir de los que ya están abiertos.
                    </p>
                  </div>
                )}

                {/* Grouped Items by Merchant */}
                {groupedCartByMerchant.map((group) => (
                  <div key={group.merchantName} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                    
                    {/* Merchant Header Bar */}
                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {group.merchantName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {group.scheduleStatus && (
                          <span 
                            title={`Horario de servicio: ${group.scheduleStatus.scheduleText}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                              group.scheduleStatus.isOpen 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : group.scheduleStatus.isBeforeOpening 
                                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{group.scheduleStatus.statusLabel}</span>
                          </span>
                        )}

                        {group.isColdChain && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 shrink-0 flex items-center gap-0.5">
                            <Snowflake className="w-2.5 h-2.5" />
                            <span>Cadena Fría</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notice if this merchant has not opened yet */}
                    {group.scheduleStatus?.isBeforeOpening && (
                      <div className="mx-2 mt-2 p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-950 text-[11px] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">
                            <strong>Aún cerrado:</strong> Abre a las {group.scheduleStatus.openingTime12h}. Horario: {group.scheduleStatus.scheduleText}.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            group.items.forEach(i => removeFromCart(i.product.id));
                          }}
                          className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0 cursor-pointer shadow-2xs hover:bg-rose-50"
                          title="Quitar productos de este comercio que aún no abre"
                        >
                          Quitar tienda
                        </button>
                      </div>
                    )}

                    {/* Merchant Items List */}
                    <div className="divide-y divide-slate-100 p-2 space-y-1">
                      {group.items.map((item) => {
                        const targetMerchant = merchants.find(m => m.id === item.product.merchantId || m.name === item.product.merchantName);
                        const requiresFile = item.product.requiresCustomerFile || targetMerchant?.requiresCustomerFile || item.product.isCustomRequest;
                        const attached = itemAttachments[item.product.id];

                        return (
                          <div key={item.product.id} className="py-2.5 px-1 space-y-2">
                            <div className="flex items-center gap-3">
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
                                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span className="text-[11px] font-mono font-bold text-slate-800">
                                    ${item.unitPrice.toFixed(2)} c/u
                                  </span>
                                  {item.isDeclaredOffer && (
                                    <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                                      🏷️ Oferta
                                    </span>
                                  )}
                                  {item.isWholesaleApplied && (
                                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                                      📦 Mayoreo ({item.quantity} pzas)
                                    </span>
                                  )}
                                  {!item.isDeclaredOffer && !item.isWholesaleApplied && item.minPiecesWholesale && item.quantity < item.minPiecesWholesale && (
                                    <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-medium">
                                      💡 Lleva {item.minPiecesWholesale - item.quantity} más para mayoreo (${item.product.wholesalePrice.toFixed(2)})
                                    </span>
                                  )}
                                </div>
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

                            {/* Subida de Archivo si el producto o servicio lo requiere */}
                            {requiresFile && (
                              <div className="ml-14 p-2 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-blue-950 text-[11px] flex items-center gap-1">
                                    <Paperclip className="w-3 h-3 text-blue-600" />
                                    <span>Requiere archivo / foto del cliente:</span>
                                  </span>
                                  {attached && (
                                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Adjunto listo</span>
                                    </span>
                                  )}
                                </div>

                                <div className="text-[10px] text-blue-900/90 leading-tight">
                                  {item.product.fileInstructions || targetMerchant?.fileRequirementsInstructions || 'Sube una foto clara o el documento para realizar este servicio.'}
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 font-bold rounded-lg border border-blue-300 cursor-pointer text-[10px] flex items-center gap-1 transition-colors">
                                    <Upload className="w-3 h-3" />
                                    <span>{attached ? 'Cambiar archivo' : 'Seleccionar foto / documento'}</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setItemAttachments(prev => ({
                                            ...prev,
                                            [item.product.id]: {
                                              fileName: file.name,
                                              type: file.type || 'documento',
                                            }
                                          }));
                                        }
                                      }}
                                    />
                                  </label>
                                  {attached && (
                                    <span className="text-[11px] text-slate-700 truncate max-w-[170px]" title={attached.fileName}>
                                      {attached.fileName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">Tu carrito de SilaoMarket está vacío</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Agrega productos de abarrotes, cerrajería, tintorería, farmacia o supermercados, o solicita un encargo especial si no lo encuentras en los catálogos.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCustomOrderModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Llenar Formato de Pedido por Encargo</span>
                  </button>
                </div>
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

              {/* Restricción de Negocios que aún no han abierto (No se puede pedir tan temprano) */}
              {merchantsScheduleValidation.hasEarlyMerchants && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-950 space-y-2.5 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 font-black text-rose-900 text-sm">
                    <Clock className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>⛔ Restricción: No se puede pedir tan temprano</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-800">
                    Tu orden contiene artículos de negocios locales que <strong>aún no han abierto sus puertas</strong>. Por política del servicio de envíos del Hub Silao, no se pueden realizar pedidos a comercios cerrados:
                  </p>
                  <div className="bg-white/90 p-3 rounded-xl border border-rose-200 space-y-2">
                    {merchantsScheduleValidation.earlyMerchants.map((em) => (
                      <div key={em.merchantId} className="flex items-center justify-between text-[11px] gap-2">
                        <div className="truncate">
                          <strong className="text-slate-800 block truncate">🏪 {em.merchantName}</strong>
                          <span className="text-[10px] text-slate-500">Horario oficial: {em.scheduleText}</span>
                        </div>
                        <span className="font-mono font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px] shrink-0 border border-rose-200">
                          Abre a las {em.openingTime12h}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>⏰ Horario habilitado a partir de:</span>
                      <span className="font-mono font-black text-rose-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                        {merchantsScheduleValidation.latestOpeningTime12h}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-900 leading-tight">
                      Espera a que todos los negocios abran sus puertas o regresa a tu carrito para retirar los productos de estas tiendas y solicitar tu pedido de inmediato.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Volver al carrito para modificar productos</span>
                  </button>
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
                  Modalidad de Entrega en Silao
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('domicilio')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      deliveryType === 'domicilio'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>A Domicilio</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Ruta consolidada Hub: <strong className="text-slate-800">${deliveryFeeCalc.fee.toFixed(2)} MXN</strong> ($25 a $40 según comercios y piezas)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('traslado_carga')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      deliveryType === 'traslado_carga'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                      <Boxes className="w-4 h-4 text-amber-700" />
                      <span>Traslado / Camioneta de Carga</span>
                    </div>
                    <span className="text-[10px] text-amber-900">
                      Gran volumen, mudanzas ligeras y mayoreo: <strong className="text-amber-950">${freightTransferCost.toFixed(2)} MXN</strong>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('punto_fijo')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      deliveryType === 'punto_fijo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Recoger en Hub Silao</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Sin costo de envío en 5 de Mayo #45, Silao Centro
                    </span>
                  </button>
                </div>
              </div>

              {/* Especificaciones adicionales si eligió Traslado / Camioneta de Carga */}
              {deliveryType === 'traslado_carga' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2.5 animate-fade-in text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <Boxes className="w-4 h-4 text-amber-700" />
                    <span>Detalles del Traslado en Camioneta de Carga:</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      ¿Qué tipo de carga o volumen trasladarás?
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Cajas de mayoreo, edredones voluminosos, bultos de comida para mascotas..."
                      value={freightDetails}
                      onChange={(e) => setFreightDetails(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={needsLoadingHelp}
                      onChange={(e) => setNeedsLoadingHelp(e.target.checked)}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-bold text-amber-950">
                      Requiere apoyo de chofer para maniobra de carga / descarga
                    </span>
                  </label>
                </div>
              )}

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

                {(deliveryType === 'domicilio' || deliveryType === 'traslado_carga') ? (
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

                {/* Tiempo de Recolección en Comercios (1h a 2h) */}
                <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-indigo-950">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recolección previa en comercios:</span>
                    </span>
                    <span className="font-mono font-black text-indigo-900 bg-indigo-200/60 px-2 py-0.5 rounded-md">
                      {collectionLeadTime.hoursFormatted} ({collectionLeadTime.minutes} min)
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    El chofer inicia recolección {collectionLeadTime.hoursLabel} para visitar los <strong>{groupedCartByMerchant.length} comercios</strong> y verificar tus <strong>{totalItemsQuantity} piezas</strong> antes de la entrega.
                  </p>
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

              {checkoutStep === 'checkout' && deliveryType === 'traslado_carga' && (
                <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-300 space-y-1">
                  <div className="flex justify-between items-center text-amber-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-amber-700" />
                      <span>Flete Traslado / Camioneta de Carga:</span>
                    </span>
                    <span className="font-mono font-black text-amber-900 text-sm">${deliveryFee.toFixed(2)} MXN</span>
                  </div>
                  <div className="text-[10px] text-amber-800 flex items-center justify-between">
                    <span>Servicio especial para gran volumen o mudanzas en Silao:</span>
                    <span className="font-bold">Tarifa Base Flete</span>
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
                  disabled={merchantsScheduleValidation.hasEarlyMerchants}
                  onClick={() => processOrderSubmission(true)}
                  className={`w-full py-3 px-4 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    merchantsScheduleValidation.hasEarlyMerchants
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none border border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {merchantsScheduleValidation.hasEarlyMerchants
                      ? `🚫 Bloqueado: Abre hasta las ${merchantsScheduleValidation.latestOpeningTime12h}`
                      : 'Enviar Pedido al Hub Silao por WhatsApp'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={merchantsScheduleValidation.hasEarlyMerchants}
                  onClick={() => processOrderSubmission(false)}
                  className={`w-full py-2 px-4 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 ${
                    merchantsScheduleValidation.hasEarlyMerchants
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${merchantsScheduleValidation.hasEarlyMerchants ? 'text-slate-400' : 'text-emerald-600'}`} />
                  <span>
                    {merchantsScheduleValidation.hasEarlyMerchants
                      ? 'Restricción de Apertura de Negocios Activa'
                      : 'Registrar Pedido sin abrir WhatsApp'}
                  </span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL DE ENCARGO ESPECIAL / PEDIDO FUERA DE CATÁLOGO */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Solicitar Producto o Servicio por Encargo</h3>
                  <p className="text-xs text-emerald-300">Pide algo que no esté en el catálogo o un servicio a tu medida</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomRequest} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Comercio o Proveedor de Silao:
                </label>
                <select
                  value={customMerchantId}
                  onChange={(e) => setCustomMerchantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                >
                  <option value="">🏢 Hub Central Silao (Asignar comercio correspondiente)</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ¿Qué producto o trabajo necesitas encargar? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Duplicado de llave automotriz codificada Ford / Vestido de fiesta tintorería / Impresión de planos"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detalles específicos, especificaciones o medidas:
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe color, talla, modelo, número de hojas, material o cualquier detalle para realizarlo exactamente como lo necesitas..."
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Precio Estimado ($ MXN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0.00 (o a cotizar)"
                    value={customPriceEst}
                    onChange={(e) => setCustomPriceEst(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    * Puedes dejar en $0 para cotizar con el encargado en WhatsApp
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Adjuntar Archivo o Foto de Muestra:
                  </label>
                  <label className="w-full px-3 py-2 border border-dashed border-emerald-400 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/50 flex items-center justify-center gap-1.5 cursor-pointer text-emerald-900 font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[150px]">{customFile ? customFile.name : 'Subir foto o documento'}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCustomFile({
                            name: file.name,
                            type: file.type || 'archivo',
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <strong>¿Cómo funciona el Encargo Especial?</strong>
                <p>
                  Se sumará a tu pedido y viajará en la misma entrega consolidada del Hub Silao. El comercio validará el trabajo o cotización antes de recolectarlo.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Encargo a Mi Carrito</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
