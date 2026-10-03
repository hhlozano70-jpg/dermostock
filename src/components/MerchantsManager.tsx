import React, { useState } from 'react';
import { 
  Store, 
  Trash2, 
  X, 
  Eye, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Lock,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Search,
  ShieldCheck,
  FileText,
  Clock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Merchant } from '../types/inventory';
import { formatTime12h } from '../utils/operatingHours';

export const MerchantsManager: React.FC = () => {
  const { 
    merchants, 
    deleteMerchant, 
    isMerchantManagerOpen, 
    setIsMerchantManagerOpen,
    userRole,
    setIsAuthModalOpen
  } = useInventory();

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isMerchantManagerOpen) return null;

  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-black text-slate-900">Acceso Exclusivo de Administrador</h3>
          <p className="text-xs text-slate-600">
            Debes iniciar sesión con las credenciales maestras de Administrador para consultar o dar de baja comercios.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                setIsMerchantManagerOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Iniciar como Administrador
            </button>
            <button
              onClick={() => setIsMerchantManagerOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    deleteMerchant(id);
    setConfirmDeleteId(null);
    if (selectedMerchant?.id === id) {
      setSelectedMerchant(null);
    }
  };

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.ownerName && m.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.silaoZone && m.silaoZone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Panel de Administrador
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Solo Lectura / Baja
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Consulta y Supervisión de Comercios
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMerchantManagerOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación informativa del rol de Administrador */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Política de Seguridad:</strong> Como administrador puedes consultar todos los datos de los comercios y eliminar negocios cuando se requiera. No puedes modificar sus datos ni visualizar sus contraseñas (cada encargado gestiona su propio perfil).
            </span>
          </div>
        </div>

        {/* Buscador de comercios */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, giro, encargado o zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total registrados: <strong>{merchants.length} negocios</strong>
          </span>
        </div>

        {/* Contenido dividido: Lista de Comercios vs Ficha de Detalle de Solo Lectura */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50">
          
          {/* Columna Izquierda: Tabla / Lista de Comercios */}
          <div className={`${selectedMerchant ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">
                Red de Comercios Afiliados en Silao ({filteredMerchants.length})
              </h3>
              <span className="text-[11px] text-slate-500">Selecciona uno para ver su ficha</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-1">
              {filteredMerchants.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No se encontraron comercios con el criterio de búsqueda.
                </div>
              ) : (
                filteredMerchants.map((m) => {
                  const isSelected = selectedMerchant?.id === m.id;
                  return (
                    <div 
                      key={m.id} 
                      className={`py-3 px-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-50/80 border border-emerald-300' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedMerchant(m)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo o icono */}
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {m.logoUrl ? (
                            <img src={m.logoUrl} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">🏪</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-slate-900 flex flex-wrap items-center gap-1.5 truncate">
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                              {m.commissionRate || 10}% com.
                            </span>
                            {m.hasWholesale && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                                📦 Mayoreo
                              </span>
                            )}
                            {m.hasSpecialPromos && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                ⚡ Promos
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {m.category} • Encargado: {m.ownerName || 'No registrado'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                            <span className="font-mono">Zona: {m.silaoZone || 'Silao'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              {m.openingTime && m.closingTime ? `${formatTime12h(m.openingTime)} - ${formatTime12h(m.closingTime)}` : '8:00 AM - 8:00 PM'}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-500 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Contraseña: ••••••••
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones del Admin: Ver Ficha y Eliminar */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedMerchant(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Ver Ficha de Consulta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Ficha</span>
                        </button>

                        {confirmDeleteId === m.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                            <span className="text-[10px] text-red-700 font-bold px-1">¿Eliminar?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(m.id)}
                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Sí, borrar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(m.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-all cursor-pointer"
                            title="Eliminar comercio de la red"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Ficha de Consulta Detallada (SOLO LECTURA) */}
          {selectedMerchant && (
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-900">
                    Ficha de Consulta del Comercio
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMerchant(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Encabezado con Logo y Nombre */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {selectedMerchant.logoUrl ? (
                    <img 
                      src={selectedMerchant.logoUrl} 
                      alt={selectedMerchant.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-3xl">🏪</span>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {selectedMerchant.name}
                  </h4>
                  <span className="text-xs text-emerald-700 font-bold">
                    {selectedMerchant.category}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black">
                      Comisión: {selectedMerchant.commissionRate || 10}%
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                      {selectedMerchant.status === 'active' ? '● En Línea' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datos de contacto y ubicación */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Encargado / Dueño:
                    </span>
                    <strong className="text-slate-900">{selectedMerchant.ownerName || 'No registrado'}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp / Teléfono:
                    </span>
                    <strong className="text-slate-900">{selectedMerchant.phone || 'No especificado'}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo:
                    </span>
                    <strong className="text-slate-900">{selectedMerchant.email || 'No especificado'}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Dirección Silao:
                    </span>
                    <strong className="text-slate-900 text-right max-w-[200px] truncate">{selectedMerchant.address}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Zona de Silao:</span>
                    <strong className="text-slate-900">{selectedMerchant.silaoZone || 'Centro'}</strong>
                  </div>
                </div>

                {/* Cuenta de liquidación bancaria */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    Cuenta para Liquidaciones (7 días):
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-900 bg-white p-2 rounded-lg border border-emerald-200">
                    {selectedMerchant.bankAccount || 'Sin CLABE registrada aún'}
                  </div>
                </div>

                {/* Horario de Servicio y Atención */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    Horario de Servicio Oficial en Silao:
                  </span>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200 text-xs">
                    <span className="font-mono font-bold text-slate-800">
                      {selectedMerchant.openingTime && selectedMerchant.closingTime 
                        ? `${formatTime12h(selectedMerchant.openingTime)} a ${formatTime12h(selectedMerchant.closingTime)}` 
                        : '8:00 AM a 8:00 PM'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                      {selectedMerchant.serviceDays || 'Lunes a Domingo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    🔒 Restricción de pedidos activa: Los clientes no pueden solicitar pedidos antes de las {selectedMerchant.openingTime ? formatTime12h(selectedMerchant.openingTime) : '8:00 AM'}.
                  </p>
                </div>

                {/* Políticas de Mayoreo y Promociones */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-900">
                    Políticas de Precios del Comercio:
                  </span>
                  <div className="text-[11px] text-blue-950 space-y-1">
                    <div>
                      <strong>Mayoreo:</strong> {selectedMerchant.hasWholesale ? `Activo a partir de ${selectedMerchant.wholesaleMinPieces || 3} piezas` : 'No ofrece mayoreo'}
                    </div>
                    <div>
                      <strong>Promos Especiales:</strong> {selectedMerchant.hasSpecialPromos ? `Activas (${selectedMerchant.promoTerms || `${selectedMerchant.promoMinPieces || 2}+ piezas`})` : 'Sin promociones especiales'}
                    </div>
                  </div>
                </div>

                {/* Contraseña Protegida */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Contraseña de Acceso:
                  </span>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-200 font-mono text-xs">
                    <span className="tracking-widest text-slate-600 font-bold">••••••••••••••</span>
                    <span className="text-[10px] text-amber-800 font-sans font-bold bg-amber-100 px-2 py-0.5 rounded">
                      Protegida
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    🔒 Por privacidad y seguridad, las contraseñas alfanuméricas son confidenciales y solo pueden ser cambiadas por el encargado en su propio portal.
                  </p>
                </div>

                {/* Descripción si la tiene */}
                {selectedMerchant.description && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Descripción:</span>
                    <p className="text-xs text-slate-600 italic">
                      "{selectedMerchant.description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Botón único de acción del Administrador: Eliminar Comercio */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  ID: <code className="font-mono text-[10px]">{selectedMerchant.id}</code>
                </span>

                {confirmDeleteId === selectedMerchant.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMerchant.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Confirmar Eliminación
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(selectedMerchant.id)}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Este Negocio</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <span>* Visualización en tiempo real. Los encargados de negocio gestionan directamente sus datos y logotipo.</span>
          <button
            onClick={() => setIsMerchantManagerOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            Cerrar Consulta
          </button>
        </div>

      </div>
    </div>
  );
};
