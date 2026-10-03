import React, { useState } from 'react';
import { 
  Store, 
  Trash2, 
  X, 
  Eye, 
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
  Clock,
  Plus,
  Edit3,
  Tag,
  Sparkles,
  ShoppingBag,
  Package,
  Copy,
  Check,
  EyeOff,
  Layers,
  Percent,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Merchant, GiroCommissionRate } from '../types/inventory';
import { formatTime12h } from '../utils/operatingHours';
import { SILAO_COLONIAS } from '../data/silaoMarketData';

export const MerchantsManager: React.FC = () => {
  const { 
    merchants, 
    addMerchant,
    updateMerchant,
    deleteMerchant, 
    giros,
    addGiro,
    updateGiro,
    deleteGiro,
    isMerchantManagerOpen, 
    setIsMerchantManagerOpen,
    userRole,
    setIsAuthModalOpen
  } = useInventory();

  // Navigation tab inside manager
  const [subTab, setSubTab] = useState<'negocios' | 'giros'>('negocios');

  // Business filtering & selection
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'fisico' | 'sin_fisico' | 'acompana' | 'raros'>('todos');

  // Modals for Create / Edit Merchant
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [merchantToEdit, setMerchantToEdit] = useState<Merchant | null>(null);

  // Modals for Create / Edit Giro
  const [isGiroModalOpen, setIsGiroModalOpen] = useState(false);
  const [giroToEdit, setGiroToEdit] = useState<GiroCommissionRate | null>(null);

  // Password visibility / copy
  const [revealedPassId, setRevealedPassId] = useState<string | null>(null);
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);

  // Form State for Merchant
  const [merchantForm, setMerchantForm] = useState({
    name: '',
    category: 'Abarrotes y mini-súper',
    ownerName: '',
    phone: '',
    email: '',
    silaoZone: 'Silao Centro',
    address: '',
    isPhysicalLocation: true,
    canAccompanyOrders: false,
    serviceTypeTag: '',
    openingTime: '08:30',
    closingTime: '20:00',
    serviceDays: 'Lunes a Domingo',
    commissionRate: 10,
    type: 'Producto' as 'Producto' | 'Servicio',
    password: '',
    hasWholesale: false,
    wholesaleMinPieces: 3,
    hasSpecialPromos: false,
    promoMinPieces: 2,
    promoTerms: '',
    requiresCustomerFile: false,
    acceptedFileTypes: ['image'] as ('image' | 'pdf' | 'doc' | 'excel' | 'otro')[],
    fileRequirementsInstructions: '',
    catalogPdfUrl: '',
  });

  // Form State for Giro
  const [giroForm, setGiroForm] = useState({
    giro: '',
    type: 'Producto' as 'Producto' | 'Servicio',
    commission: 12,
    canAccompanyOrders: false,
    description: '',
  });

  if (!isMerchantManagerOpen) return null;

  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-black text-slate-900">Acceso Exclusivo de Administrador</h3>
          <p className="text-xs text-slate-600">
            Debes iniciar sesión con las credenciales maestras de Administrador para gestionar comercios, personas independientes y giros.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                setIsMerchantManagerOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
            >
              Iniciar como Administrador
            </button>
            <button
              onClick={() => setIsMerchantManagerOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Merchant delete
  const handleDeleteMerchant = (id: string) => {
    deleteMerchant(id);
    setConfirmDeleteId(null);
    if (selectedMerchant?.id === id) {
      setSelectedMerchant(null);
    }
  };

  // Open Create Merchant Modal
  const openCreateMerchant = () => {
    const defaultGiro = giros[0] || { giro: 'Abarrotes y mini-súper', commission: 8, type: 'Producto', canAccompanyOrders: true };
    const randPass = Math.floor(1000 + Math.random() * 9000).toString();
    setMerchantToEdit(null);
    setMerchantForm({
      name: '',
      category: defaultGiro.giro,
      ownerName: '',
      phone: '',
      email: '',
      silaoZone: 'Silao Centro',
      address: '',
      isPhysicalLocation: true,
      canAccompanyOrders: !!defaultGiro.canAccompanyOrders,
      serviceTypeTag: '',
      openingTime: '08:30',
      closingTime: '20:00',
      serviceDays: 'Lunes a Domingo',
      commissionRate: defaultGiro.commission || 10,
      type: defaultGiro.type || 'Producto',
      password: randPass,
      hasWholesale: false,
      wholesaleMinPieces: 3,
      hasSpecialPromos: false,
      promoMinPieces: 2,
      promoTerms: '',
      requiresCustomerFile: false,
      acceptedFileTypes: ['image'],
      fileRequirementsInstructions: '',
      catalogPdfUrl: '',
    });
    setIsMerchantModalOpen(true);
  };

  // Open Edit Merchant Modal
  const openEditMerchant = (m: Merchant) => {
    setMerchantToEdit(m);
    setMerchantForm({
      name: m.name,
      category: m.category,
      ownerName: m.ownerName || '',
      phone: m.phone || '',
      email: m.email || '',
      silaoZone: m.silaoZone || 'Silao Centro',
      address: m.address || '',
      isPhysicalLocation: m.isPhysicalLocation !== undefined ? m.isPhysicalLocation : true,
      canAccompanyOrders: !!m.canAccompanyOrders,
      serviceTypeTag: m.serviceTypeTag || '',
      openingTime: m.openingTime || '08:30',
      closingTime: m.closingTime || '20:00',
      serviceDays: m.serviceDays || 'Lunes a Domingo',
      commissionRate: m.commissionRate || 10,
      type: m.type || 'Producto',
      password: m.password || m.pin || '1234',
      hasWholesale: !!m.hasWholesale,
      wholesaleMinPieces: m.wholesaleMinPieces || 3,
      hasSpecialPromos: !!m.hasSpecialPromos,
      promoMinPieces: m.promoMinPieces || 2,
      promoTerms: m.promoTerms || '',
      requiresCustomerFile: !!m.requiresCustomerFile,
      acceptedFileTypes: m.acceptedFileTypes && m.acceptedFileTypes.length > 0 ? m.acceptedFileTypes : ['image'],
      fileRequirementsInstructions: m.fileRequirementsInstructions || '',
      catalogPdfUrl: m.catalogPdfUrl || '',
    });
    setIsMerchantModalOpen(true);
  };

  // Save Merchant (Create or Update)
  const handleSaveMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantForm.name.trim()) return;

    const payload = {
      name: merchantForm.name.trim(),
      category: merchantForm.category,
      ownerName: merchantForm.ownerName.trim(),
      phone: merchantForm.phone.trim(),
      email: merchantForm.email.trim(),
      silaoZone: merchantForm.silaoZone,
      address: merchantForm.address.trim() || (!merchantForm.isPhysicalLocation ? 'Servicio Independiente a Domicilio / Digital en Silao (Sin local físico)' : 'Silao Centro, Gto.'),
      isPhysicalLocation: merchantForm.isPhysicalLocation,
      canAccompanyOrders: merchantForm.canAccompanyOrders,
      serviceTypeTag: merchantForm.serviceTypeTag.trim(),
      openingTime: merchantForm.openingTime || '08:30',
      closingTime: merchantForm.closingTime || '20:00',
      serviceDays: merchantForm.serviceDays || 'Lunes a Domingo',
      commissionRate: Number(merchantForm.commissionRate) || 10,
      type: merchantForm.type,
      password: merchantForm.password.trim() || '1234',
      pin: merchantForm.password.trim() || '1234',
      hasWholesale: merchantForm.hasWholesale,
      wholesaleMinPieces: Number(merchantForm.wholesaleMinPieces) || 3,
      hasSpecialPromos: merchantForm.hasSpecialPromos,
      promoMinPieces: Number(merchantForm.promoMinPieces) || 2,
      promoTerms: merchantForm.promoTerms.trim(),
      requiresCustomerFile: merchantForm.requiresCustomerFile,
      acceptedFileTypes: merchantForm.acceptedFileTypes,
      fileRequirementsInstructions: merchantForm.fileRequirementsInstructions.trim(),
      catalogPdfUrl: merchantForm.catalogPdfUrl.trim(),
      rating: merchantToEdit ? merchantToEdit.rating : 5.0,
      reviewsCount: merchantToEdit ? merchantToEdit.reviewsCount : 1,
      badge: !merchantForm.isPhysicalLocation 
        ? (merchantForm.serviceTypeTag || 'Servicio Independiente') 
        : 'Comercio Local Silao',
      iconName: !merchantForm.isPhysicalLocation ? 'Sparkles' : 'Store',
      description: merchantToEdit?.description || `${merchantForm.name} en Silao (${merchantForm.category}).`,
    };

    if (merchantToEdit) {
      updateMerchant(merchantToEdit.id, payload);
      if (selectedMerchant?.id === merchantToEdit.id) {
        setSelectedMerchant({ ...selectedMerchant, ...payload });
      }
    } else {
      const newId = addMerchant(payload);
      const created = { ...payload, id: newId };
      setSelectedMerchant(created);
    }

    setIsMerchantModalOpen(false);
  };

  // Open Create Giro Modal
  const openCreateGiro = () => {
    setGiroToEdit(null);
    setGiroForm({
      giro: '',
      type: 'Producto',
      commission: 12,
      canAccompanyOrders: true,
      description: '',
    });
    setIsGiroModalOpen(true);
  };

  // Open Edit Giro Modal
  const openEditGiro = (g: GiroCommissionRate) => {
    setGiroToEdit(g);
    setGiroForm({
      giro: g.giro,
      type: g.type,
      commission: g.commission,
      canAccompanyOrders: !!g.canAccompanyOrders,
      description: g.description || '',
    });
    setIsGiroModalOpen(true);
  };

  // Save Giro (Create or Update)
  const handleSaveGiro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giroForm.giro.trim()) return;

    if (giroToEdit) {
      updateGiro(giroToEdit.giro, {
        giro: giroForm.giro.trim(),
        category: giroForm.giro.trim(),
        type: giroForm.type,
        commission: Number(giroForm.commission) || 10,
        rate: Number(giroForm.commission) || 10,
        canAccompanyOrders: giroForm.canAccompanyOrders,
        description: giroForm.description.trim(),
      });
    } else {
      addGiro({
        giro: giroForm.giro.trim(),
        type: giroForm.type,
        commission: Number(giroForm.commission) || 10,
        canAccompanyOrders: giroForm.canAccompanyOrders,
        description: giroForm.description.trim(),
      });
    }

    setIsGiroModalOpen(false);
  };

  // Copy password helper
  const handleCopyPassword = (pass: string, id: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPassId(id);
    setTimeout(() => setCopiedPassId(null), 2000);
  };

  // Filter merchants
  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.ownerName && m.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.silaoZone && m.silaoZone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.serviceTypeTag && m.serviceTypeTag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'fisico') return m.isPhysicalLocation !== false;
    if (filterType === 'sin_fisico') return m.isPhysicalLocation === false;
    if (filterType === 'acompana') return !!m.canAccompanyOrders;
    if (filterType === 'raros') {
      const catLower = m.category.toLowerCase();
      const tagLower = (m.serviceTypeTag || '').toLowerCase();
      return catLower.includes('raro') || catLower.includes('colecc') || catLower.includes('bazar') || catLower.includes('usad') || tagLower.includes('rar') || tagLower.includes('bazar');
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
              <Store className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Panel de Administración Central
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Gestión Total
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black">
                Comercios, Prestadores de Servicios y Giros
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {subTab === 'negocios' ? (
              <button
                type="button"
                onClick={openCreateMerchant}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Dar de Alta Negocio / Prestador</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateGiro}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Crear Nuevo Giro</span>
              </button>
            )}

            <button
              onClick={() => setIsMerchantManagerOpen(false)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUB-TABS SELECTOR */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSubTab('negocios')}
              className={`py-3 px-4 font-bold text-xs transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                subTab === 'negocios'
                  ? 'border-emerald-400 text-emerald-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Directorio de Negocios y Prestadores ({merchants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('giros')}
              className={`py-3 px-4 font-bold text-xs transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                subTab === 'giros'
                  ? 'border-emerald-400 text-emerald-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Catálogo de Giros y Comisiones ({giros.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 py-2 hidden md:block">
            Silao de la Victoria · Hub Central de Consolidación
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: DIRECTORIO DE NEGOCIOS Y PRESTADORES */}
        {/* ============================================================ */}
        {subTab === 'negocios' && (
          <>
            {/* Barra de Filtros y Buscador */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, giro, encargado, zona o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Filtros rápidos */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilterType('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === 'todos'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Todos ({merchants.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('fisico')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === 'fisico'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🏬 Local Físico
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('sin_fisico')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === 'sin_fisico'
                      ? 'bg-purple-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🏠 Sin Local Físico (Independientes)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('acompana')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === 'acompana'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📦 Acompañan Pedidos Hub
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('raros')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === 'raros'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✨ Bazar y Raros
                </button>
              </div>
            </div>

            {/* Contenido: Lista y Ficha de Detalle */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-100">
              
              {/* Columna Izquierda: Tarjetas de Negocios */}
              <div className={`${selectedMerchant ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-700">
                    Mostrando {filteredMerchants.length} de {merchants.length} negocios y prestadores
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Haz clic en una tarjeta para inspeccionar o editar
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                  {filteredMerchants.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
                      <Store className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No se encontraron negocios con este filtro</p>
                      <button
                        onClick={() => { setSearchTerm(''); setFilterType('todos'); }}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg font-semibold"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  ) : (
                    filteredMerchants.map((m) => {
                      const isSelected = selectedMerchant?.id === m.id;
                      const password = m.password || m.pin || '1234';
                      const isRevealed = revealedPassId === m.id;
                      const isCopied = copiedPassId === m.id;

                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMerchant(m)}
                          className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            
                            {/* Logo / Icono y datos principales */}
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden ${
                                m.isPhysicalLocation === false 
                                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}>
                                {m.logoUrl ? (
                                  <img src={m.logoUrl} alt={m.name} className="w-full h-full object-cover" />
                                ) : m.isPhysicalLocation === false ? (
                                  <Sparkles className="w-6 h-6" />
                                ) : (
                                  <Store className="w-6 h-6" />
                                )}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                                    {m.name}
                                  </h4>

                                  {/* Badge de Modalidad */}
                                  {m.isPhysicalLocation === false ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                                      <span>🏠</span>
                                      <span>Sin local físico · Independiente</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                                      <span>🏬</span>
                                      <span>Local físico</span>
                                    </span>
                                  )}

                                  {/* Badge de Acompaña Pedidos */}
                                  {m.canAccompanyOrders && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                      <Package className="w-3 h-3 text-amber-700" />
                                      <span>Acompaña pedidos Hub</span>
                                    </span>
                                  )}

                                  {m.serviceTypeTag && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                      🏷️ {m.serviceTypeTag}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-600 truncate">
                                  <strong>{m.category}</strong> · Encargado: {m.ownerName || 'No registrado'}
                                </p>

                                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>{m.silaoZone || 'Silao Centro'}</span>
                                  </span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                                    <Clock className="w-3 h-3 text-emerald-600" />
                                    <span>{m.openingTime && m.closingTime ? `${formatTime12h(m.openingTime)} - ${formatTime12h(m.closingTime)}` : '08:30 - 20:00'}</span>
                                  </span>
                                  <span>·</span>
                                  <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {m.commissionRate || 10}% com.
                                  </span>
                                </div>

                                {/* Credencial de Acceso visible para el Admin */}
                                <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-700" onClick={(e) => e.stopPropagation()}>
                                  <span className="font-semibold text-slate-500 flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-amber-600" />
                                    <span>Acceso:</span>
                                  </span>
                                  <code className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold text-xs tracking-wider">
                                    {isRevealed ? password : '••••••••'}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => setRevealedPassId(isRevealed ? null : m.id)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                                    title={isRevealed ? "Ocultar contraseña" : "Ver contraseña"}
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPassword(password, m.id)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer flex items-center gap-1 text-[10px]"
                                    title="Copiar contraseña"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    {isCopied && <span className="text-emerald-700 font-bold">Copiada</span>}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Acciones Rápidas */}
                            <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => openEditMerchant(m)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-emerald-200"
                                title="Editar datos y contraseña del negocio"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>

                              {confirmDeleteId === m.id ? (
                                <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMerchant(m.id)}
                                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-1.5 py-1 rounded bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(m.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-all cursor-pointer self-end"
                                  title="Dar de baja / eliminar comercio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Columna Derecha: Ficha de Inspección Detallada */}
              {selectedMerchant && (
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-black text-sm text-slate-900">
                        Ficha de Detalle y Operación
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditMerchant(selectedMerchant)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modificar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMerchant(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cabecera */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {selectedMerchant.logoUrl ? (
                        <img src={selectedMerchant.logoUrl} alt={selectedMerchant.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{selectedMerchant.isPhysicalLocation === false ? '✨' : '🏪'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-sm text-slate-900 truncate">{selectedMerchant.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{selectedMerchant.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {selectedMerchant.commissionRate || 10}% de Comisión
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                          {selectedMerchant.type || 'Producto'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Datos de Contacto y Ubicación */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Encargado:</strong> {selectedMerchant.ownerName || 'No registrado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>WhatsApp:</strong> {selectedMerchant.phone || 'No registrado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Email:</strong> {selectedMerchant.email || 'No registrado'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span><strong>Dirección:</strong> {selectedMerchant.address || 'Silao, Gto.'} ({selectedMerchant.silaoZone || 'Silao'})</span>
                      </div>
                    </div>

                    {/* Modalidad y Hub Delivery */}
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1">
                      <div className="font-bold text-purple-900 flex items-center justify-between">
                        <span>Modalidad de Operación:</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-extrabold">
                          {selectedMerchant.isPhysicalLocation === false ? 'Sin Local Físico' : 'Local Físico'}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800">
                        {selectedMerchant.isPhysicalLocation === false 
                          ? '👤 Prestador independiente que opera desde casa, en línea o sobre pedido.' 
                          : '🏬 Local con mostrador físico abierto al público en Silao.'}
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <span className="font-bold text-purple-900 text-[11px]">Acompaña pedidos del Hub:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedMerchant.canAccompanyOrders 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {selectedMerchant.canAccompanyOrders ? '✅ SÍ (Trámites, Impresiones, Bazar, etc.)' : '❌ NO'}
                        </span>
                      </div>
                    </div>

                    {/* Horario */}
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700" />
                        <div>
                          <strong className="block text-emerald-950">Horario de Servicio:</strong>
                          <span className="text-[11px] text-emerald-800">
                            {selectedMerchant.openingTime && selectedMerchant.closingTime ? `${formatTime12h(selectedMerchant.openingTime)} a ${formatTime12h(selectedMerchant.closingTime)}` : '8:30 AM a 8:00 PM'} · {selectedMerchant.serviceDays || 'Lunes a Domingo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Credenciales de Acceso */}
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Contraseña de Acceso del Comercio:</span>
                      </span>
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-300">
                        <code className="font-mono text-sm font-bold text-slate-900">
                          {selectedMerchant.password || selectedMerchant.pin || '1234'}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyPassword(selectedMerchant.password || selectedMerchant.pin || '1234', selectedMerchant.id)}
                          className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer"
                        >
                          Copiar Clave
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        🔑 Como administrador puedes entregar esta clave al encargado o modificarla en cualquier momento pulsando "Modificar".
                      </p>
                    </div>

                    {/* Descripción */}
                    {selectedMerchant.description && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs italic">
                        "{selectedMerchant.description}"
                      </div>
                    )}
                  </div>

                  {/* Acciones del pie */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {selectedMerchant.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(selectedMerchant.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Dar de Baja</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CATÁLOGO DE GIROS Y COMISIONES */}
        {/* ============================================================ */}
        {subTab === 'giros' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Catálogo Oficial de Giros Comerciales y Comisiones
                </h3>
                <p className="text-xs text-slate-500">
                  Define qué actividades pueden registrarse en Silao, su % de comisión y si pueden acompañar las entregas del Hub Central.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateGiro}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Agregar Nuevo Giro</span>
              </button>
            </div>

            {/* Grid de Giros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {giros.map((g) => {
                const countMerchants = merchants.filter(m => m.category.toLowerCase() === g.giro.toLowerCase()).length;
                return (
                  <div
                    key={g.giro}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xs font-black">
                            <Tag className="w-3.5 h-3.5" />
                          </span>
                          <h4 className="font-black text-xs text-slate-900 leading-snug">
                            {g.giro}
                          </h4>
                        </div>

                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {g.commission}% com.
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          g.type === 'Servicio' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {g.type}
                        </span>

                        {g.canAccompanyOrders ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Package className="w-3 h-3 text-amber-700" />
                            <span>Acompaña pedidos Hub</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Solo servicio directo
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 font-medium">
                          · {countMerchants} afiliados
                        </span>
                      </div>

                      {g.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {g.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => openEditGiro(g)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Comisión</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar el giro "${g.giro}" del catálogo?`)) {
                            deleteGiro(g.giro);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar este giro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <span>* Sincronizado en tiempo real con el servidor y la nube (Render & Firestore).</span>
          <button
            onClick={() => setIsMerchantManagerOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            Cerrar Gestión
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* MODAL: ALTA / EDICIÓN DE COMERCIO O PRESTADOR */}
      {/* ============================================================ */}
      {isMerchantModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {merchantToEdit ? 'Modificar Negocio / Prestador' : 'Dar de Alta Nuevo Negocio o Prestador'}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Acepta negocios con local físico y personas independientes sin local (impresiones, bazar, software, etc.)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMerchantModalOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMerchant} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* Nombre y Giro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Comercial o Prestador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ciber San José, Bazar Vintage, Don Pedro Carpintero"
                    value={merchantForm.name}
                    onChange={(e) => setMerchantForm({ ...merchantForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giro / Categoría *</label>
                  <select
                    value={merchantForm.category}
                    onChange={(e) => {
                      const selGiro = giros.find(g => g.giro === e.target.value);
                      setMerchantForm({
                        ...merchantForm,
                        category: e.target.value,
                        type: selGiro ? selGiro.type : merchantForm.type,
                        commissionRate: selGiro ? selGiro.commission : merchantForm.commissionRate,
                        canAccompanyOrders: selGiro ? !!selGiro.canAccompanyOrders : merchantForm.canAccompanyOrders,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {giros.map((g) => (
                      <option key={g.giro} value={g.giro}>
                        {g.giro} ({g.commission}% · {g.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TOGGLE FÍSICO VS INDEPENDIENTE SIN LOCAL */}
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-purple-950 block text-xs">¿Tiene local físico abierto al público en Silao?</strong>
                    <span className="text-[11px] text-purple-700">
                      Desactívalo si es una persona que ofrece trabajos desde casa, a domicilio o servicios digitales sin mostrador.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={merchantForm.isPhysicalLocation}
                      onChange={(e) => setMerchantForm({ ...merchantForm, isPhysicalLocation: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* TOGGLE ACOMPAÑA PEDIDOS */}
                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                  <div>
                    <strong className="text-purple-950 block text-xs">¿Sus trabajos o artículos pueden viajar con los pedidos del Hub?</strong>
                    <span className="text-[11px] text-purple-700">
                      Ideal para impresiones, trámites oficiales sellados, artículos usados de bazar empaquetados o productos raros.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={merchantForm.canAccompanyOrders}
                      onChange={(e) => setMerchantForm({ ...merchantForm, canAccompanyOrders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              </div>

              {/* Especialidad / Etiqueta Descriptiva */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Especialidad / Etiqueta Distintiva
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Trámites e Impresiones, Segunda Mano / Bazar, Software, Coleccionismo"
                    value={merchantForm.serviceTypeTag}
                    onChange={(e) => setMerchantForm({ ...merchantForm, serviceTypeTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contraseña / PIN de Acceso (Hasta 18 caracteres alfanuméricos) *
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    required
                    placeholder="Contraseña del encargado"
                    value={merchantForm.password}
                    onChange={(e) => setMerchantForm({ ...merchantForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-emerald-900 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Encargado, Teléfono y Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Encargado / Titular</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={merchantForm.ownerName}
                    onChange={(e) => setMerchantForm({ ...merchantForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp / Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 4721234567"
                    value={merchantForm.phone}
                    onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={merchantForm.email}
                    onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Zona y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zona / Colonia en Silao</label>
                  <select
                    value={merchantForm.silaoZone}
                    onChange={(e) => setMerchantForm({ ...merchantForm, silaoZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {SILAO_COLONIAS.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {merchantForm.isPhysicalLocation ? 'Dirección Física del Local' : 'Zona / Cobertura de Entrega'}
                  </label>
                  <input
                    type="text"
                    placeholder={merchantForm.isPhysicalLocation ? 'Calle, número y referencias en Silao' : 'Ej. Servicio en Silao Centro y cobertura a domicilio'}
                    value={merchantForm.address}
                    onChange={(e) => setMerchantForm({ ...merchantForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Horarios y Comisión */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora de Apertura</label>
                  <input
                    type="time"
                    value={merchantForm.openingTime}
                    onChange={(e) => setMerchantForm({ ...merchantForm, openingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora de Cierre</label>
                  <input
                    type="time"
                    value={merchantForm.closingTime}
                    onChange={(e) => setMerchantForm({ ...merchantForm, closingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">% Comisión Plataforma</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={35}
                      step={1}
                      value={merchantForm.commissionRate}
                      onChange={(e) => setMerchantForm({ ...merchantForm, commissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 pr-7 rounded-xl border border-slate-300 text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Requerimiento de Archivos del Cliente */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-950 block">¿Requiere que el cliente suba archivos para el servicio?</span>
                    <span className="text-[11px] text-blue-900 block">Fotos de cerraduras, llaves, prendas delicadas o documentos PDF/Word/Excel a imprimir o tramitar</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={merchantForm.requiresCustomerFile}
                      onChange={(e) => setMerchantForm({ ...merchantForm, requiresCustomerFile: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {merchantForm.requiresCustomerFile && (
                  <div className="pt-2 border-t border-blue-200/80 space-y-2.5">
                    <div>
                      <label className="block font-bold text-blue-950 mb-1 text-[11px]">Formatos Aceptados:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {[
                          { type: 'image', label: '📷 Imagen' },
                          { type: 'pdf', label: '📄 PDF' },
                          { type: 'doc', label: '📝 Word' },
                          { type: 'excel', label: '📊 Excel' },
                          { type: 'otro', label: '📎 Otros' },
                        ].map((fmt) => {
                          const isSel = merchantForm.acceptedFileTypes.includes(fmt.type as any);
                          return (
                            <button
                              key={fmt.type}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  if (merchantForm.acceptedFileTypes.length === 1) return;
                                  setMerchantForm({
                                    ...merchantForm,
                                    acceptedFileTypes: merchantForm.acceptedFileTypes.filter(t => t !== fmt.type)
                                  });
                                } else {
                                  setMerchantForm({
                                    ...merchantForm,
                                    acceptedFileTypes: [...merchantForm.acceptedFileTypes, fmt.type as any]
                                  });
                                }
                              }}
                              className={`p-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-white border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500'
                                  : 'bg-blue-100/40 border-blue-200 text-slate-500 hover:bg-white'
                              }`}
                            >
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-blue-950 mb-1 text-[11px]">Instrucciones para el Cliente:</label>
                      <input
                        type="text"
                        placeholder="Ej. Sube foto nítida de tu llave o el archivo PDF que deseas imprimir"
                        value={merchantForm.fileRequirementsInstructions}
                        onChange={(e) => setMerchantForm({ ...merchantForm, fileRequirementsInstructions: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Catálogo o Menú Digital ya hecho */}
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                <div>
                  <span className="font-bold text-purple-950 block">Catálogo, Menú o Lista de Precios en PDF / Web:</span>
                  <span className="text-[11px] text-purple-900 block">Enlace directo a menú o catálogo digital del negocio para que los clientes lo consulten</span>
                </div>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/menu-o-catalogo.pdf"
                  value={merchantForm.catalogPdfUrl}
                  onChange={(e) => setMerchantForm({ ...merchantForm, catalogPdfUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-xs font-mono"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMerchantModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {merchantToEdit ? 'Guardar Cambios' : 'Registrar Negocio / Prestador'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ALTA / EDICIÓN DE GIRO */}
      {/* ============================================================ */}
      {isGiroModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
            
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black">
                  {giroToEdit ? 'Modificar Giro Comercial' : 'Crear Nuevo Giro'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGiroModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGiro} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Giro o Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cerrajería, Consultoría, Antigüedades"
                  value={giroForm.giro}
                  onChange={(e) => setGiroForm({ ...giroForm, giro: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Actividad</label>
                  <select
                    value={giroForm.type}
                    onChange={(e) => setGiroForm({ ...giroForm, type: e.target.value as 'Producto' | 'Servicio' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">% de Comisión Sugerida</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    step={1}
                    required
                    value={giroForm.commission}
                    onChange={(e) => setGiroForm({ ...giroForm, commission: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <strong className="block text-amber-950 text-xs">¿Sus entregas viajan con pedidos del Hub?</strong>
                  <span className="text-[11px] text-amber-800">
                    Permite enviar trabajos o productos anexos con la entrega centralizada.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={giroForm.canAccompanyOrders}
                    onChange={(e) => setGiroForm({ ...giroForm, canAccompanyOrders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Giro</label>
                <textarea
                  rows={2}
                  placeholder="Detalla qué tipo de productos o trabajos comprende este sector..."
                  value={giroForm.description}
                  onChange={(e) => setGiroForm({ ...giroForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGiroModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {giroToEdit ? 'Guardar Cambios' : 'Crear Giro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
