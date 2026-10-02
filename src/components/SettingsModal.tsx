import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Phone, 
  Building2, 
  MapPin, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  MessageCircle, 
  Truck,
  Snowflake,
  Clock,
  Gauge
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, userRole } = useInventory();

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '524721234567');
  const [businessName, setBusinessName] = useState(settings.businessName || 'Silaomarket on line');
  const [hubAddress, setHubAddress] = useState(settings.hubAddress || 'Hub Central de Consolidación Silao, Calle 5 de Mayo #45, Silao Centro');
  const [defaultPickupPoint, setDefaultPickupPoint] = useState(settings.defaultPickupPoint || 'Hub Central Silao - Calle 5 de Mayo #45, Silao Centro');
  const [deliveryCost, setDeliveryCost] = useState<number>(settings.deliveryCost ?? 25);
  const [orderStartTime, setOrderStartTime] = useState(settings.orderStartTime || '08:00');
  const [orderEndTime, setOrderEndTime] = useState(settings.orderEndTime || '20:00');
  const [maxOrdersPerHour, setMaxOrdersPerHour] = useState<number>(settings.maxOrdersPerHour ?? 12);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWhatsappNumber(settings.whatsappNumber || '524721234567');
      setBusinessName(settings.businessName || 'Silaomarket on line');
      setHubAddress(settings.hubAddress || 'Hub Central de Consolidación Silao, Calle 5 de Mayo #45, Silao Centro');
      setDefaultPickupPoint(settings.defaultPickupPoint || 'Hub Central Silao - Calle 5 de Mayo #45, Silao Centro');
      setDeliveryCost(settings.deliveryCost ?? 25);
      setOrderStartTime(settings.orderStartTime || '08:00');
      setOrderEndTime(settings.orderEndTime || '20:00');
      setMaxOrdersPerHour(settings.maxOrdersPerHour ?? 12);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Acceso Exclusivo de Administración</h3>
          <p className="text-xs text-slate-600">
            La configuración de pedidos, rutas y WhatsApp de recepción solo puede ser gestionada por la Administración Central del Hub Silao.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      whatsappNumber: cleanPhone,
      businessName: businessName.trim() || 'Silaomarket on line',
      hubAddress: hubAddress.trim() || 'Hub Central Silao, Calle 5 de Mayo #45, Silao Centro',
      defaultPickupPoint: defaultPickupPoint.trim() || 'Hub Central Silao - Calle 5 de Mayo #45, Silao Centro',
      deliveryCost: Number(deliveryCost) || 25,
      orderStartTime: orderStartTime || '08:00',
      orderEndTime: orderEndTime || '20:00',
      maxOrdersPerHour: Number(maxOrdersPerHour) || 12,
      city: 'Silao',
      state: 'Guanajuato',
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
      `¡Hola! Este es un mensaje de prueba de Silaomarket on line (Hub Silao). Los pedidos consolidados de los comercios de Silao llegarán a este chat.`
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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">Ajustes de Pedidos & WhatsApp</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                  Admin Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">Recepción centralizada de pedidos consolidados y rutas Silao</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          {/* Badge informativo de exclusividad */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Panel Exclusivo de Administración:</strong> La configuración de pedidos es centralizada y no es editable desde los perfiles de los comercios.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">¡Ajustes de Silaomarket guardados correctamente!</span>
            </div>
          )}

          {/* WhatsApp Destination Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp de Recepción en Hub Silao *</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Silao, Gto</span>
            </div>

            <div className="relative">
              <input
                type="tel"
                required
                placeholder="Ej. 4721234567 o 524721234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full pl-3 pr-24 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-emerald-200 cursor-pointer"
                title="Abrir WhatsApp para probar este número"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Probar</span>
              </button>
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Nombre de la Plataforma / Marketplace</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Silaomarket on line"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Hub Silao Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Dirección del Hub Central de Consolidación (Silao)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Calle 5 de Mayo #45, Silao Centro, Silao, Gto."
              value={hubAddress}
              onChange={(e) => setHubAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Delivery Fee for Consolidated Delivery */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Costo Base de Envío Consolidado en Silao (MXN)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
              <input
                type="number"
                min="25"
                max="40"
                step="1"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(parseFloat(e.target.value) || 25)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Tarifa base de $25 pesos, la cual se ajusta de forma automática hasta $40 pesos en el carrito según la cantidad de comercios y piezas ordenadas.
            </p>
          </div>

          {/* Horario de Atención de Pedidos (8:00 AM a 8:00 PM) */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Horario de Atención de Envíos</span>
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                Silao Local
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Hora Inicio:</span>
                <input
                  type="time"
                  value={orderStartTime}
                  onChange={(e) => setOrderStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Hora Cierre:</span>
                <input
                  type="time"
                  value={orderEndTime}
                  onChange={(e) => setOrderEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Horario oficial: 8:00 AM a 8:00 PM. Fuera de este horario, los pedidos se programan automáticamente para las 8:00 AM del día siguiente.
            </p>
          </div>

          {/* Anti-Saturación: Máximo de Envíos por Hora */}
          <div className="space-y-1 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-700" />
                <span>Capacidad Máxima de Envíos por Hora (Anti-Saturación)</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                {maxOrdersPerHour} envíos/hr
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={maxOrdersPerHour}
                onChange={(e) => setMaxOrdersPerHour(parseInt(e.target.value) || 12)}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="50"
                value={maxOrdersPerHour}
                onChange={(e) => setMaxOrdersPerHour(parseInt(e.target.value) || 12)}
                className="w-16 px-2 py-1 text-xs border border-amber-300 rounded-lg text-center font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <p className="text-[10px] text-amber-800">
              Si la cantidad de pedidos en la hora en curso alcanza este tope, la app informa al cliente sobre saturación y agenda el pedido para el siguiente bloque de entrega disponible.
            </p>
          </div>

          {/* Model Explanatory Box */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Snowflake className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Modelo Hub Silao + Cadena Fría:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Los clientes agregan productos de diferentes negocios de Silao a un solo carrito. El pedido llega desglosado por tienda a tu WhatsApp y el Hub de Silao prepara los paquetes (con hieleras térmicas para helados, aguas y cervezas) y entrega en una sola visita.
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
