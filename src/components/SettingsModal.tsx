import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Phone, 
  Building2, 
  MapPin, 
  Check, 
  ExternalLink, 
  AlertCircle,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useInventory();

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [businessName, setBusinessName] = useState(settings.businessName || 'DermoStock México');
  const [defaultPickupPoint, setDefaultPickupPoint] = useState(settings.defaultPickupPoint || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWhatsappNumber(settings.whatsappNumber || '');
      setBusinessName(settings.businessName || 'DermoStock México');
      setDefaultPickupPoint(settings.defaultPickupPoint || '');
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      whatsappNumber: cleanPhone,
      businessName: businessName.trim() || 'DermoStock México',
      defaultPickupPoint: defaultPickupPoint.trim() || 'Punto de entrega a acordar',
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestWhatsApp = () => {
    if (!cleanPhone) {
      alert('Ingresa un número de WhatsApp primero.');
      return;
    }
    const testMsg = encodeURIComponent(
      `¡Hola! Este es un mensaje de prueba de configuración desde ${businessName}. Tus pedidos llegarán a este chat.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${testMsg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Configuración de Pedidos</h3>
              <p className="text-xs text-slate-400">Recepción de pedidos por WhatsApp y entregas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">¡Configuración guardada y sincronizada correctamente!</span>
            </div>
          )}

          {/* WhatsApp Destination Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Número de WhatsApp para Pedidos *</span>
              </label>
              <span className="text-[11px] text-slate-400">Requerido</span>
            </div>

            <div className="relative">
              <input
                type="tel"
                required
                placeholder="Ej. 5215512345678 o 5512345678"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full pl-3 pr-24 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-emerald-200 cursor-pointer"
                title="Abrir WhatsApp Web / App para probar este número"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Probar</span>
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <p className="flex items-center gap-1 font-medium text-slate-700">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Formato de número para México:</span>
              </p>
              <ul className="list-disc list-inside pl-1 text-slate-500 space-y-0.5">
                <li>Con código de país: <span className="font-mono text-slate-700 font-medium">5215512345678</span> (12 o 13 dígitos)</li>
                <li>O directo a 10 dígitos: <span className="font-mono text-slate-700 font-medium">5512345678</span> (se le añadirá el código automáticamente)</li>
              </ul>
            </div>
          </div>

          {/* Business / Store Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Nombre del Negocio o Distribuidora</span>
            </label>
            <input
              type="text"
              placeholder="Ej. DermoStock México"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400">
              Aparecerá en el encabezado de los comprobantes y en el saludo del mensaje de WhatsApp.
            </p>
          </div>

          {/* Default Fixed Delivery Point */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Punto Fijo de Entrega Habitual (Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Estación Metro Zapata / Plaza Galerías Insurgentes"
              value={defaultPickupPoint}
              onChange={(e) => setDefaultPickupPoint(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400">
              Sugerencia predeterminada cuando el cliente elija la modalidad de entrega en "Punto fijo a definir".
            </p>
          </div>

          {/* Information summary box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-blue-950">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>¿Cómo funciona el flujo de pedidos?</span>
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              1. El cliente agrega productos al carrito con su tarifa seleccionada.<br />
              2. Elige si desea <strong>Entrega a Domicilio</strong> o en un <strong>Punto Fijo a Definir</strong>.<br />
              3. Al dar clic en <strong>"Pedir por WhatsApp"</strong>, el sistema descuenta automáticamente el inventario del almacén y abre el chat directamente a este número con el desglose completo del pedido listo para enviar.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
