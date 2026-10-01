import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Percent, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { BROCHURE_COMMISSIONS, Merchant } from '../types/inventory';

export const MerchantsManager: React.FC = () => {
  const { 
    merchants, 
    addMerchant, 
    updateMerchant, 
    deleteMerchant, 
    isMerchantManagerOpen, 
    setIsMerchantManagerOpen,
    userRole,
    setIsAuthModalOpen
  } = useInventory();

  const [isEditing, setIsEditing] = useState(false);
  const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Merchant, 'id'>>({
    name: '',
    category: 'Abarrotes y Cremería',
    commissionRate: 8,
    type: 'Producto',
    ownerName: '',
    phone: '',
    email: '',
    address: 'Silao, Gto.',
    bankAccount: '',
    pin: '1234',
    status: 'active',
    silaoZone: 'Silao Centro',
    badge: 'Comercio Local',
    iconName: 'Store',
    rating: 5.0,
    reviewsCount: 1,
    description: '',
    hasWholesale: false,
    wholesaleMinPieces: 3,
    hasSpecialPromos: false,
    promoMinPieces: 2,
    promoTerms: ''
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isMerchantManagerOpen) return null;

  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-black text-slate-900">Acceso Exclusivo de Administración</h3>
          <p className="text-xs text-slate-600">
            Debes iniciar sesión con las credenciales maestras de Hub Silao para dar de alta, editar o dar de baja comercios.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                setIsMerchantManagerOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Iniciar como Administrador
            </button>
            <button
              onClick={() => setIsMerchantManagerOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentMerchantId(null);
    setFormData({
      name: '',
      category: 'Abarrotes y Cremería',
      commissionRate: 8,
      type: 'Producto',
      ownerName: '',
      phone: '',
      email: '',
      address: 'Silao, Gto.',
      bankAccount: '',
      pin: '1234',
      status: 'active',
      silaoZone: 'Silao Centro',
      badge: 'Comercio Local',
      iconName: 'Store',
      rating: 5.0,
      reviewsCount: 1,
      description: '',
      hasWholesale: false,
      wholesaleMinPieces: 3,
      hasSpecialPromos: false,
      promoMinPieces: 2,
      promoTerms: ''
    });
  };

  const handleOpenEdit = (m: Merchant) => {
    setIsEditing(true);
    setCurrentMerchantId(m.id);
    setFormData({
      name: m.name,
      category: m.category,
      commissionRate: m.commissionRate || 10,
      type: m.type || 'Producto',
      ownerName: m.ownerName || '',
      phone: m.phone || '',
      email: m.email || '',
      address: m.address || 'Silao, Gto.',
      bankAccount: m.bankAccount || '',
      pin: m.pin || '1234',
      status: m.status || 'active',
      silaoZone: m.silaoZone || 'Silao Centro',
      badge: m.badge || 'Comercio Local',
      iconName: m.iconName || 'Store',
      rating: m.rating || 5.0,
      reviewsCount: m.reviewsCount || 1,
      description: m.description || '',
      hasWholesale: Boolean(m.hasWholesale),
      wholesaleMinPieces: m.wholesaleMinPieces || 3,
      hasSpecialPromos: Boolean(m.hasSpecialPromos),
      promoMinPieces: m.promoMinPieces || 2,
      promoTerms: m.promoTerms || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentMerchantId) {
      updateMerchant(currentMerchantId, formData);
    } else {
      addMerchant(formData);
    }
    handleOpenAdd();
  };

  const handleDelete = (id: string) => {
    deleteMerchant(id);
    setConfirmDeleteId(null);
  };

  // Cuando cambia el giro, pre-asignar la tasa sugerida del folleto
  const handleCategoryChange = (category: string) => {
    const match = BROCHURE_COMMISSIONS.find(b => 
      (b.category && b.category.toLowerCase().includes(category.toLowerCase())) ||
      (b.giro && b.giro.toLowerCase().includes(category.toLowerCase()))
    );
    setFormData(prev => ({
      ...prev,
      category,
      commissionRate: match ? (typeof match.rate === 'number' ? match.rate : (typeof match.commission === 'number' ? match.commission : prev.commissionRate)) : prev.commissionRate,
      type: match ? match.type : prev.type
    }));
  };

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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Hub Central Silao
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Administración de Comercios Afiliados
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Negocio</span>
            </button>
            <button
              onClick={() => setIsMerchantManagerOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido dividido: Lista vs Formulario */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50">
          
          {/* Columna Izquierda: Formulario Alta / Edición */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                {isEditing ? <Edit className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                {isEditing ? 'Modificar Comercio' : 'Afiliar Nuevo Comercio'}
              </h3>
              {isEditing && (
                <button
                  onClick={handleOpenAdd}
                  className="text-[11px] text-slate-500 hover:underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. MARET SILAO"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giro Comercial Principal *</label>
                <select
                  value={formData.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {BROCHURE_COMMISSIONS.map((item, idx) => {
                    const name = item.category || item.giro || 'Giro Comercial';
                    const rate = typeof item.rate === 'number' ? item.rate : (typeof item.commission === 'number' ? item.commission : 10);
                    return (
                      <option key={idx} value={name}>
                        {name} ({rate}% comisión)
                      </option>
                    );
                  })}
                  <option value="General">Otro Giro Comercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comisión Hub (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.commissionRate}
                    onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modalidad</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Propietario / Encargado</label>
                <input
                  type="text"
                  value={formData.ownerName || ''}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Ej. Roberto Gómez"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="472 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Portal (4 dígitos)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pin || '1234'}
                    onChange={e => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cuenta Bancaria / CLABE para Liquidar</label>
                <input
                  type="text"
                  value={formData.bankAccount || ''}
                  onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="BBVA / Banorte: 012..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección en Silao</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, número y colonia"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Bloque: Condiciones de Mayoreo y Promociones Especiales */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
                <span className="block font-black text-blue-950 text-xs">
                  Políticas de Mayoreo y Promociones (Opcionales por Tienda)
                </span>
                <p className="text-[11px] text-blue-800">
                  El estándar inicial es Precio Comercial para todos. Puedes habilitar si esta tienda acepta mayoreo o promos, y definir en qué casos aplica con número de piezas mínimas:
                </p>

                {/* Switch Mayoreo */}
                <div className="pt-1 border-t border-blue-200/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasWholesale)}
                      onChange={e => setFormData({ ...formData, hasWholesale: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="font-bold text-slate-800 text-xs">
                      Habilitar Precios a Mayoreo en esta tienda
                    </span>
                  </label>
                  
                  {formData.hasWholesale && (
                    <div className="mt-2 pl-5 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        ¿A partir de cuántas piezas mínimas aplica? *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.wholesaleMinPieces || 3}
                        onChange={e => setFormData({ ...formData, wholesaleMinPieces: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full sm:w-32 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono text-blue-900 bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Al alcanzar {formData.wholesaleMinPieces || 3} piezas en el carrito se activa automáticamente el precio mayorista.
                      </span>
                    </div>
                  )}
                </div>

                {/* Switch Promociones Especiales */}
                <div className="pt-2 border-t border-blue-200/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasSpecialPromos)}
                      onChange={e => setFormData({ ...formData, hasSpecialPromos: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-slate-800 text-xs">
                      Habilitar Promociones Especiales por Volumen
                    </span>
                  </label>

                  {formData.hasSpecialPromos && (
                    <div className="mt-2 pl-5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700">Piezas mínimas promo</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.promoMinPieces || 2}
                            onChange={e => setFormData({ ...formData, promoMinPieces: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono text-emerald-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700">Términos breves</label>
                          <input
                            type="text"
                            placeholder="Ej. Ofertas 2x1 o folleto"
                            value={formData.promoTerms || ''}
                            onChange={e => setFormData({ ...formData, promoTerms: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar Comercio'}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Tabla de Comercios Registrados */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">
                Comercios Afiliados a la Red ({merchants.length})
              </h3>
              <span className="text-[11px] text-slate-500">Silao de la Victoria, Gto.</span>
            </div>

            <div className="divide-y divide-slate-100">
              {merchants.map((m) => (
                <div key={m.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      🏪
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                        {m.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {m.commissionRate || 10}% com.
                        </span>
                        {m.hasWholesale ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            📦 Mayoreo ({m.wholesaleMinPieces || 3}+ pzs)
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                            PVP Comercial
                          </span>
                        )}
                        {m.hasSpecialPromos && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ⚡ Promos
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {m.category} • Propietario: {m.ownerName || 'No especificado'} • PIN: <strong className="font-mono text-slate-700">{m.pin || '1234'}</strong>
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        CLABE: {m.bankAccount || 'Sin CLABE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-all cursor-pointer"
                      title="Modificar comercio"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {confirmDeleteId === m.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(m.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-all cursor-pointer"
                        title="Eliminar comercio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>* Los cambios se sincronizan en tiempo real con el servidor central de Silao.</span>
          <button
            onClick={() => setIsMerchantManagerOpen(false)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
