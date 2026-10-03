import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Store, 
  Paperclip, 
  Upload, 
  Truck, 
  Phone, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Send, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';

export const CustomOrderModal: React.FC = () => {
  const { 
    isCustomOrderModalOpen, 
    setIsCustomOrderModalOpen, 
    merchants, 
    addToCart, 
    setIsCartOpen,
    settings
  } = useInventory();

  const [title, setTitle] = useState('');
  const [selectedMerchantId, setSelectedMerchantId] = useState('cualquiera');
  const [details, setDetails] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [isHeavyTransfer, setIsHeavyTransfer] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [fileAttachment, setFileAttachment] = useState<{
    name: string;
    type: string;
    size: string;
    previewUrl?: string;
  } | null>(null);

  const [formError, setFormError] = useState('');

  if (!isCustomOrderModalOpen) return null;

  const handleClose = () => {
    setIsCustomOrderModalOpen(false);
    setFormError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileAttachment({
          name: file.name,
          type: file.type,
          size: `${sizeInMB} MB`,
          previewUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFileAttachment({
        name: file.name,
        type: file.type || 'documento',
        size: `${sizeInMB} MB`,
      });
    }
  };

  const handleRemoveFile = () => {
    setFileAttachment(null);
  };

  const selectedMerchant = selectedMerchantId !== 'cualquiera' 
    ? merchants.find(m => m.id === selectedMerchantId)
    : null;

  const handleSubmitToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Por favor escribe qué producto o servicio deseas solicitar.');
      return;
    }

    const budgetNum = parseFloat(estimatedBudget) || 0;

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      sku: `ENCARGO-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `[Encargo Especial] ${title.trim()}`,
      presentation: details.trim() ? details.trim() : 'Solicitud especial fuera de catálogo',
      brand: selectedMerchant ? selectedMerchant.name : 'Hub Central Silao',
      category: selectedMerchant ? selectedMerchant.category : 'Servicios Personalizados',
      merchantId: selectedMerchant ? selectedMerchant.id : 'merch-cerrajeria-silao',
      merchantName: selectedMerchant ? selectedMerchant.name : 'Comercio Local de Silao (Encargo)',
      merchantCategory: selectedMerchant ? selectedMerchant.category : 'Servicios Personalizados',
      merchantAddress: selectedMerchant?.address || 'Silao Centro, Gto.',
      isColdChain: false,
      commercialPrice: budgetNum,
      wholesalePrice: budgetNum,
      promoPrice: budgetNum,
      stock: 999,
      minStockAlert: 1,
      packagingType: 'service',
      description: `Encargo solicitado por cliente.${details ? ' Detalles: ' + details : ''}${customerPhone ? ' | Tel: ' + customerPhone : ''}${isHeavyTransfer ? ' | Requiere camioneta de carga / flete' : ''}`,
      isCustomRequest: true,
      requiresCustomerFile: Boolean(fileAttachment),
      fileInstructions: fileAttachment ? `Archivo adjunto: ${fileAttachment.name} (${fileAttachment.size})` : undefined,
    };

    addToCart(customProduct, 1);

    // Resetear formulario
    setTitle('');
    setDetails('');
    setEstimatedBudget('');
    setIsHeavyTransfer(false);
    setCustomerPhone('');
    setFileAttachment(null);
    setFormError('');

    // Cerrar modal de solicitud y abrir carrito de compras con el item ya listo
    setIsCustomOrderModalOpen(false);
    setIsCartOpen(true);
  };

  const handleSendViaWhatsApp = () => {
    if (!title.trim()) {
      setFormError('Escribe primero el nombre del producto o servicio que necesitas.');
      return;
    }

    const targetMerchantText = selectedMerchant 
      ? `${selectedMerchant.name} (${selectedMerchant.category})`
      : 'Cualquier negocio afiliado en Silao';

    const msg = 
`👋 *SOLICITUD DE PEDIDO POR ENCARGO - SILAOMARKET ON LINE*

📦 *Producto / Servicio Solicitado:* ${title.trim()}
🏪 *Comercio / Giro Preferido:* ${targetMerchantText}
📝 *Especificaciones / Detalles:* ${details.trim() || 'A cotizar'}
💰 *Presupuesto Estimado:* ${estimatedBudget ? '$' + estimatedBudget + ' MXN' : 'Por confirmar con el negocio'}
🚚 *Traslado de Carga / Flete:* ${isHeavyTransfer ? 'SÍ requiere camioneta de carga ($150 MXN)' : 'Ruta regular de entrega'}
📎 *Archivo de Referencia:* ${fileAttachment ? fileAttachment.name : 'No adjuntó archivo'}
📱 *Teléfono de Contacto:* ${customerPhone.trim() || 'El de este chat'}

📍 *Destino:* Silao de la Victoria, Guanajuato.
Por favor cotizar disponibilidad y tiempo estimado de entrega. ¡Gracias!`;

    const encoded = encodeURIComponent(msg);
    const waNumber = settings.whatsappNumber || '524721234567';
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden text-slate-800 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-snug">
                Formato de Pedido por Encargo
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                ¿No está en los catálogos? Lo buscamos y llevamos a tu puerta en Silao
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitToCart} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Giro o Comercio de Silao */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Comercio de Silao o Giro Comercial:</span>
            </label>
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="cualquiera">✨ Cualquier comercio afiliado en Silao (Hub Central busca la mejor opción)</option>
              <optgroup label="Comercios Locales de Silao">
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — ({m.category}) {m.silaoZone ? `· ${m.silaoZone}` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
            {selectedMerchant && (
              <p className="mt-1 text-[11px] text-slate-500">
                📍 {selectedMerchant.address} · Horario: {selectedMerchant.openingTime || '08:30'} a {selectedMerchant.closingTime || '20:00'}
              </p>
            )}
          </div>

          {/* Nombre del Producto o Servicio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. ¿Qué producto o trabajo necesitas comprar? *</span>
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">Obligatorio</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="Ej. Duplicado de llave forja de seguridad / Lavado en seco de traje sastre / Batería LTH / Copias de plano"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Especificaciones / Medidas / Instrucciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>3. Especificaciones, medidas, marcas o detalles:</span>
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe medidas, material, modelo del vehículo, número de piezas, color, o instrucciones específicas para el taller o tienda..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Presupuesto estimado y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>4. Presupuesto estimado ($ MXN):</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  placeholder="0 (o deja en $0 si no estás seguro)"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                El comercio o Hub confirmará el monto exacto antes de cobrar.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>5. Teléfono / WhatsApp de contacto:</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="472 123 4567"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Para avisarte cuando tu pedido esté listo o si hay dudas.
              </p>
            </div>
          </div>

          {/* Adjuntar Archivo o Fotografía */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                <span>6. Adjuntar foto, imagen, PDF, Word o Excel (opcional):</span>
              </span>
              <span className="text-[10px] text-slate-400">Hasta 15 MB</span>
            </label>

            {!fileAttachment ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/60 hover:bg-emerald-50/20">
                <Upload className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Subir foto de la llave/prenda/pieza o archivo a imprimir</span>
                <span className="text-[10px] text-slate-400">JPG, PNG, PDF, DOCX, XLSX</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 truncate">
                  {fileAttachment.previewUrl ? (
                    <img 
                      src={fileAttachment.previewUrl} 
                      alt="Vista previa" 
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      DOC
                    </div>
                  )}
                  <div className="truncate">
                    <strong className="text-xs text-slate-800 block truncate">{fileAttachment.name}</strong>
                    <span className="text-[10px] text-slate-500">{fileAttachment.size} · Adjunto listo</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Solicitud de Flete / Traslado en Camioneta de Carga */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="heavyTransferCheck"
              checked={isHeavyTransfer}
              onChange={(e) => setIsHeavyTransfer(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="heavyTransferCheck" className="text-xs text-slate-700 cursor-pointer select-none">
              <strong className="block text-slate-900 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>¿Es un pedido pesado o de gran volumen?</span>
              </strong>
              <span>
                Solicitar camioneta de carga / flete en Silao (tarifa base $150 MXN). Ideal para bultos, muebles o mayoreo.
              </span>
            </label>
          </div>

          {/* Botones de Envío */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Agregar a Mi Carrito</span>
            </button>

            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pedir Cotización por WhatsApp</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Tu solicitud será recibida por el Hub Central Silao. Puedes combinarla con otros productos del catálogo.
          </p>
        </form>
      </div>
    </div>
  );
};
