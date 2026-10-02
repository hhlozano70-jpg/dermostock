import React, { useState } from 'react';
import { 
  Store, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Printer, 
  ExternalLink, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Edit,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  UserCheck,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Merchant } from '../types/inventory';

export const MerchantPortal: React.FC = () => {
  const { 
    loggedMerchant, 
    merchants,
    products, 
    orders, 
    settlements, 
    userRole, 
    setIsAuthModalOpen, 
    openProductModal,
    setActiveTab,
    setIsBrochureModalOpen,
    updateMerchant
  } = useInventory();

  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'liquidaciones' | 'pedidos' | 'catalogo' | 'politicas' | 'perfil'>('resumen');
  const [hasWholesaleState, setHasWholesaleState] = useState(false);
  const [wholesaleMinPiecesState, setWholesaleMinPiecesState] = useState(3);
  const [hasSpecialPromosState, setHasSpecialPromosState] = useState(false);
  const [promoMinPiecesState, setPromoMinPiecesState] = useState(2);
  const [promoTermsState, setPromoTermsState] = useState('');
  const [isSavedPolicy, setIsSavedPolicy] = useState(false);

  // Estados para el perfil del encargado de negocio
  const [profileName, setProfileName] = useState('');
  const [profileOwner, setProfileOwner] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileZone, setProfileZone] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileBankAccount, setProfileBankAccount] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileLogoUrl, setProfileLogoUrl] = useState('');
  const [isSavedProfile, setIsSavedProfile] = useState(false);


  if (!loggedMerchant && userRole !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Portal de Comercios de Silao</h2>
        <p className="text-sm text-slate-600">
          Inicia sesión con tu comercio afiliado para consultar tus ventas, comisiones y liquidaciones semanales.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          Seleccionar Mi Negocio e Ingresar PIN
        </button>
      </div>
    );
  }

  // Si no hay merchant logueado pero es admin, tomar el primer comercio de demostración
  const merchant: Merchant = loggedMerchant || (merchants && merchants.length > 0 ? merchants[0] : {
    id: 'm1',
    name: 'Abarrotes y Minisuper El Centro',
    category: 'Abarrotes y Cremería',
    address: 'Calle 5 de Mayo #12, Centro, Silao',
    silaoZone: 'Silao Centro',
    rating: 4.8,
    reviewsCount: 120,
    badge: 'Comercio Local',
    iconName: 'Store',
    description: 'Abarrotes generales de Silao',
    commissionRate: 8,
    ownerName: 'Don Roberto Gómez',
    bankAccount: 'BBVA: 012 225 0154897210 4',
    phone: '472 101 2345',
    email: 'contacto@elcentro.com',
    status: 'active',
    hasWholesale: true,
    wholesaleMinPieces: 3,
    hasSpecialPromos: false,
    promoMinPieces: 2,
    promoTerms: '',
  });

  const commissionRate = merchant.commissionRate || 10;

  // Filtrar productos de este negocio
  const merchantProducts = products.filter(p => p.merchantId === merchant.id);

  // Calcular ventas brutas y pedidos del comercio
  let totalGrossSales = 0;
  let totalItemsSold = 0;
  const merchantOrders = orders.filter(order => {
    const itemsInOrder = order.items.filter(item => item.product.merchantId === merchant.id);
    if (itemsInOrder.length > 0) {
      itemsInOrder.forEach(item => {
        const itemPrice = item.unitPrice || item.product.commercialPrice || (item.product as any).price || 0;
        totalGrossSales += itemPrice * item.quantity;
        totalItemsSold += item.quantity;
      });
      return true;
    }
    return false;
  });

  // Comisión y Neto
  const commissionAmount = (totalGrossSales * commissionRate) / 100;
  const netEarnings = totalGrossSales - commissionAmount;

  // Liquidaciones de este negocio
  const merchantSettlements = settlements.filter(s => s.merchantId === merchant.id);
  const totalPaid = merchantSettlements
    .filter(s => s.status === 'pagado')
    .reduce((sum, s) => sum + s.netAmount, 0);
  const pendingSettlement = netEarnings - totalPaid > 0 ? netEarnings - totalPaid : 0;

  React.useEffect(() => {
    if (merchant) {
      setHasWholesaleState(Boolean(merchant.hasWholesale));
      setWholesaleMinPiecesState(merchant.wholesaleMinPieces || 3);
      setHasSpecialPromosState(Boolean(merchant.hasSpecialPromos));
      setPromoMinPiecesState(merchant.promoMinPieces || 2);
      setPromoTermsState(merchant.promoTerms || '');

      setProfileName(merchant.name || '');
      setProfileOwner(merchant.ownerName || '');
      setProfilePhone(merchant.phone || '');
      setProfileEmail(merchant.email || '');
      setProfileAddress(merchant.address || '');
      setProfileZone(merchant.silaoZone || '');
      setProfileDescription(merchant.description || '');
      setProfileBankAccount(merchant.bankAccount || '');
      setProfilePassword(merchant.password || merchant.pin || '1234');
      setProfileLogoUrl(merchant.logoUrl || '');
    }
  }, [
    merchant.id,
    merchant.name,
    merchant.ownerName,
    merchant.phone,
    merchant.email,
    merchant.address,
    merchant.silaoZone,
    merchant.description,
    merchant.bankAccount,
    merchant.password,
    merchant.pin,
    merchant.logoUrl,
    merchant.hasWholesale,
    merchant.wholesaleMinPieces,
    merchant.hasSpecialPromos,
    merchant.promoMinPieces,
    merchant.promoTerms
  ]);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchant(merchant.id, {
      hasWholesale: hasWholesaleState,
      wholesaleMinPieces: wholesaleMinPiecesState,
      hasSpecialPromos: hasSpecialPromosState,
      promoMinPieces: promoMinPiecesState,
      promoTerms: promoTermsState,
    });
    setIsSavedPolicy(true);
    setTimeout(() => setIsSavedPolicy(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Por favor selecciona una imagen menor a 2.5 MB para un óptimo rendimiento.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProfileLogoUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedPassword = profilePassword.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18);
    updateMerchant(merchant.id, {
      name: profileName.trim() || merchant.name,
      ownerName: profileOwner.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim(),
      address: profileAddress.trim(),
      silaoZone: profileZone.trim(),
      description: profileDescription.trim(),
      bankAccount: profileBankAccount.trim(),
      password: sanitizedPassword || '1234',
      pin: sanitizedPassword || '1234',
      logoUrl: profileLogoUrl.trim()
    });
    setIsSavedProfile(true);
    setTimeout(() => setIsSavedProfile(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Banner Superior del Negocio */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner overflow-hidden relative group">
              {merchant.logoUrl ? (
                <img 
                  src={merchant.logoUrl} 
                  alt={merchant.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl select-none">🏪</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Portal de Negocio Afiliado
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
                  Activo
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{merchant.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span><strong>Giro:</strong> {merchant.category}</span>
                <span>•</span>
                <span><strong>Propietario:</strong> {merchant.ownerName || 'Encargado General'}</span>
                <span>•</span>
                <span><strong>Comisión Pactada:</strong> <span className="text-amber-300 font-black">{commissionRate}%</span></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openProductModal()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>

            <button
              onClick={() => setIsBrochureModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Folleto</span>
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cambiar Cuenta
            </button>
          </div>
        </div>

        {/* Datos bancarios del negocio */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Cuenta para Liquidación (7 días): <strong>{merchant.bankAccount || 'Registrar CLABE interbancaria'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Próximo corte: Semanal (Lunes 10:00 AM)</span>
          </div>
        </div>
      </div>

      {/* 4 Métricas Clave de Negocio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Ventas Brutas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ventas Brutas</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">${totalGrossSales.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">{totalItemsSold} artículos vendidos</p>
          </div>
        </div>

        {/* Comisión SILAOMARKET */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Comisión Hub ({commissionRate}%)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-700">-${commissionAmount.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">Tarifa pactada en folleto oficial</p>
          </div>
        </div>

        {/* Saldo Neto */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase">Ganancia Neta</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-700">${netEarnings.toFixed(2)}</span>
            <p className="text-xs text-emerald-900 font-medium mt-1">Directo a tu cuenta</p>
          </div>
        </div>

        {/* Saldo Pendiente de Liquidar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pendiente Liquidación</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-700">${pendingSettlement.toFixed(2)}</span>
            <p className="text-xs text-slate-500 mt-1">Corte cada 7 días</p>
          </div>
        </div>

      </div>

      {/* Subnavegación del Portal */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('resumen')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'resumen'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Estado de Cuenta
        </button>
        <button
          onClick={() => setActiveSubTab('liquidaciones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'liquidaciones'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          💵 Liquidaciones Semanales ({merchantSettlements.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pedidos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'pedidos'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📦 Pedidos Recibidos ({merchantOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('catalogo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'catalogo'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏷️ Mis Productos ({merchantProducts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('politicas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'politicas'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚙️ Mayoreo y Promociones
        </button>
        <button
          onClick={() => setActiveSubTab('perfil')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'perfil'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏢 Mi Negocio y Logo
        </button>
      </div>

      {/* CONTENIDO DE TABS */}

      {/* TAB 1: RESUMEN / ESTADO DE CUENTA */}
      {activeSubTab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Explicación de Modelo Comercial */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Respaldo de Cobro y Liquidación a 7 Días
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                En <strong>SILAOMARKET ON LINE</strong> tus ventas están 100% protegidas. Los clientes pagan su carrito consolidado en línea o contra entrega al repartidor del Hub. Tú solo entregas el producto embalado cuando la orden llega.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Comisión por Giro ({merchant.category}):</span>
                  <strong className="text-slate-900">{commissionRate}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Costo de Envío al Cliente:</span>
                  <strong className="text-emerald-700">$25.00 a $40.00 (Cubierto por el cliente para el repartidor Hub según comercios y piezas)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Costo de Afiliación / Mensualidad:</span>
                  <strong className="text-emerald-700">$0.00 (0% Entrada)</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Frecuencia de Transferencia:</span>
                  <strong className="font-black text-slate-900">Cada 7 Días Calendario</strong>
                </div>
              </div>
            </div>

            {/* Desglose de Ventas por Producto */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-black text-slate-900 mb-4">Ventas por Producto en este Ciclo</h3>
              {merchantProducts.length === 0 ? (
                <p className="text-xs text-slate-500">Aún no tienes productos registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-black">
                        <th className="py-2">Producto</th>
                        <th className="py-2 text-center">Stock</th>
                        <th className="py-2 text-right">Precio Venta</th>
                        <th className="py-2 text-right">Neto Negocio ({100 - commissionRate}%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {merchantProducts.slice(0, 8).map(prod => {
                        const price = prod.commercialPrice || (prod as any).price || 0;
                        const net = price * (1 - commissionRate / 100);
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {prod.name}
                            </td>
                            <td className="py-2.5 text-center font-semibold text-slate-600">{prod.stock}</td>
                            <td className="py-2.5 text-right font-bold text-slate-900">${price.toFixed(2)}</td>
                            <td className="py-2.5 text-right font-black text-emerald-700">
                              ${net.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Columna Derecha: Tarjeta de Contacto y Soporte */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/60 rounded-2xl border border-emerald-200 p-6 space-y-4">
              <h3 className="text-base font-black text-emerald-950">Soporte del Hub Silao</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                ¿Necesitas actualizar tus datos bancarios, cambiar tu número de teléfono o resolver una duda con un pedido?
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Coordinación Silao</span>
                  <a href="mailto:hhlozano70@hotmail.com" className="font-bold text-emerald-700 hover:underline">
                    hhlozano70@hotmail.com
                  </a>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Teléfono Hub</span>
                  <span className="font-bold text-slate-800">472 100 8920</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Estado de Cuenta</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: LIQUIDACIONES SEMANALES */}
      {activeSubTab === 'liquidaciones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Historial de Liquidaciones Semanales</h3>
              <p className="text-xs text-slate-500">
                Cortes cada 7 días pagados vía transferencia bancaria por SILAOMARKET Hub Central.
              </p>
            </div>

            <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
              Total Cobrado Histórico: ${totalPaid.toFixed(2)}
            </div>
          </div>

          {merchantSettlements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              Aún no hay liquidaciones registradas para este comercio. Al completarse el ciclo de 7 días, Administración generará el comprobante correspondiente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-black">
                    <th className="py-2.5">Folio / Período</th>
                    <th className="py-2.5 text-right">Venta Bruta</th>
                    <th className="py-2.5 text-right">Comisión Retenida</th>
                    <th className="py-2.5 text-right">Neto Depositado</th>
                    <th className="py-2.5 text-center">Estado</th>
                    <th className="py-2.5">Referencia Bancaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {merchantSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">
                        {s.period}
                        <span className="block text-[10px] text-slate-400 font-normal">{s.id}</span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-700">${s.grossSales.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-amber-700">-${s.commissionAmount.toFixed(2)} ({s.commissionRate}%)</td>
                      <td className="py-3 text-right font-black text-emerald-700 text-sm">${s.netAmount.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-600 font-mono">
                        {s.paymentReference || 'En proceso de transferencia'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PEDIDOS RECIBIDOS */}
      {activeSubTab === 'pedidos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pedidos con Productos de Tu Tienda</h3>
              <p className="text-xs text-slate-500">
                Órdenes consolidadas donde clientes de Silao solicitaron artículos de tu inventario.
              </p>
            </div>
          </div>

          {merchantOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              No hay pedidos registrados recientemente con artículos de esta tienda.
            </div>
          ) : (
            <div className="space-y-4">
              {merchantOrders.map((order) => {
                const thisShopItems = order.items.filter(i => i.product.merchantId === merchant.id);
                const shopTotal = thisShopItems.reduce((acc, i) => {
                  const p = i.unitPrice || i.product.commercialPrice || (i.product as any).price || 0;
                  return acc + (p * i.quantity);
                }, 0);
                const shopNet = shopTotal * (1 - commissionRate / 100);

                return (
                  <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">Pedido #{order.id}</span>
                        <span className="text-xs text-slate-500">• {new Date(order.date || (order as any).createdAt || Date.now()).toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Cliente: <strong>{order.customerName}</strong></span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {thisShopItems.map((item, idx) => {
                        const itemPrice = item.unitPrice || item.product.commercialPrice || (item.product as any).price || 0;
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-800">
                              <strong>{item.quantity}x</strong> {item.product.name}
                            </span>
                            <span className="font-semibold text-slate-900">
                              ${(itemPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Subtotal Comercio: <strong>${shopTotal.toFixed(2)}</strong> | Comisión ({commissionRate}%): <span className="text-amber-700">-${(shopTotal * commissionRate / 100).toFixed(2)}</span>
                      </span>
                      <span className="text-emerald-700 font-black text-sm">
                        Tu Ganancia Neta: ${shopNet.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MIS PRODUCTOS EN VENTA */}
      {activeSubTab === 'catalogo' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Catálogo de Productos ({merchantProducts.length})</h3>
              <p className="text-xs text-slate-500">
                Productos disponibles en la tienda en línea para clientes de Silao.
              </p>
            </div>

            <button
              onClick={() => openProductModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {merchantProducts.map((prod) => {
              const price = prod.commercialPrice || (prod as any).price || 0;
              const netPrice = price * (1 - commissionRate / 100);

              return (
                <div key={prod.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-32 rounded-lg bg-slate-100 overflow-hidden mb-2 relative">
                      <img 
                        src={prod.imageUrl || (prod as any).image || '/images/products/placeholder.jpg'} 
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        Stock: {prod.stock}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{prod.name}</h4>
                    <span className="text-[10px] text-slate-500">{prod.category}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900">${price.toFixed(2)}</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">
                        Neto: ${netPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => openProductModal(prod)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-all cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: POLÍTICAS DE MAYOREO Y PROMOCIONES DE MI TIENDA */}
      {activeSubTab === 'politicas' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>⚙️ Políticas de Mayoreo y Promociones Especiales</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura si tu negocio ofrece mayoreo o promociones, y bajo qué condiciones de piezas mínimas.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              {merchant.name}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              📌 Regla Estándar de SilaoMarket:
            </span>
            <p>
              El estándar inicial para todos los clientes es el <strong>Precio Comercial</strong>. Tus clientes verán ese precio al comprar al menudeo. Si activas mayoreo y configuras el número de piezas mínimas aquí, se les aplicará automáticamente tu precio de mayoreo cuando lleven esa cantidad o más.
            </p>
          </div>

          <form onSubmit={handleSavePolicies} className="space-y-6">
            {/* Mayoreo */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-950">Precios a Mayoreo</h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Permite a clientes y revendedores obtener tu tarifa mayorista comprando volumen.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasWholesaleState}
                    onChange={(e) => setHasWholesaleState(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {hasWholesaleState ? (
                <div className="pt-3 border-t border-blue-200/80 space-y-2">
                  <label className="block text-xs font-bold text-blue-900">
                    ¿En qué casos aplica? (Número de piezas mínimas) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={wholesaleMinPiecesState}
                      onChange={(e) => setWholesaleMinPiecesState(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-28 px-3 py-2 rounded-xl border border-blue-300 bg-white font-mono font-bold text-sm text-blue-900 text-center"
                    />
                    <span className="text-xs text-blue-900 font-medium">piezas mínimas del mismo producto</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    A partir de <strong>{wholesaleMinPiecesState} piezas</strong> en el carrito, se aplicará el precio mayorista a los artículos de tu tienda que tengan precio mayorista registrado.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Tu tienda actualmente maneja exclusivamente venta a Precio Comercial.
                </div>
              )}
            </div>

            {/* Promociones Especiales */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Promociones Especiales por Volumen</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Habilita promociones especiales de temporada para tus artículos.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasSpecialPromosState}
                    onChange={(e) => setHasSpecialPromosState(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {hasSpecialPromosState ? (
                <div className="pt-3 border-t border-emerald-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Piezas mínimas para promo especial
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={promoMinPiecesState}
                        onChange={(e) => setPromoMinPiecesState(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Descripción o Términos de la Promo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Ofertas 2x1 o precio por caja"
                        value={promoTermsState}
                        onChange={(e) => setPromoTermsState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Sin promociones especiales por volumen activas.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSavedPolicy ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Políticas de precios actualizadas con éxito!</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Los cambios se sincronizan en tiempo real para todos los clientes en Silao.
                </span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Guardar Políticas de Precios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: PERFIL Y DATOS DEL NEGOCIO / SUBIDA DE LOGO / CONTRASEÑA */}
      {activeSubTab === 'perfil' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Gestión de Comercio Oficial
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Datos de Mi Negocio, Logotipo y Contraseña
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Como encargado o dueño del negocio, puedes actualizar los datos visibles para tus clientes, subir tu logo oficial y cambiar tu contraseña alfanumérica de hasta 18 caracteres.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            
            {/* SECCIÓN 1: LOGOTIPO DEL NEGOCIO */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Logotipo Oficial del Negocio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Se mostrará en la tienda virtual, en tu portal y junto a tus productos en Silao.
                  </p>
                </div>
                {profileLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setProfileLogoUrl('')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar Logo
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* Visualizador / Preview */}
                <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-inner relative group shrink-0">
                  {profileLogoUrl ? (
                    <img 
                      src={profileLogoUrl} 
                      alt="Vista previa del logo" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] font-bold block">Sin Logotipo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Subir Logotipo desde Mi Dispositivo</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                        onChange={handleLogoUpload}
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[11px] text-slate-400 block mt-1.5">
                      Formatos recomendados: PNG, JPG o WebP (cuadrado preferiblemente, máx 2.5 MB).
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      O pega una URL directa de tu logo en internet:
                    </label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/mi-logo.png"
                      value={profileLogoUrl}
                      onChange={(e) => setProfileLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN GENERAL */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                Información Comercial y Ubicación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Comercial del Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Propietario / Encargado General
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={profileOwner}
                    onChange={(e) => setProfileOwner(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 472 123 4567"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="negocio@correo.com"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección Física en Silao
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Calle 5 de Mayo #45, Silao"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zona de Silao
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Silao Centro, Blvd. Raúl Bailleres..."
                    value={profileZone}
                    onChange={(e) => setProfileZone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción o Eslogan del Negocio
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe brevemente tus productos y atención en Silao..."
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* SECCIÓN 3: CUENTA DE LIQUIDACIÓN Y PAGO */}
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                Cuenta Bancaria para Liquidaciones Semanales
              </h3>
              <p className="text-xs text-emerald-800">
                Aquí recibirás el pago de tus ventas acumuladas cada 7 días netas de comisión.
              </p>
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Banco y CLABE Interbancaria (18 dígitos) o Tarjeta
                </label>
                <input
                  type="text"
                  placeholder="Ej. BBVA: 012 225 0154897210 4"
                  value={profileBankAccount}
                  onChange={(e) => setProfileBankAccount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-xs text-slate-900"
                />
              </div>
            </div>

            {/* SECCIÓN 4: CONTRASEÑA DE ACCESO */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    Contraseña de Acceso al Negocio
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Alfanumérica de hasta 18 caracteres (letras mayúsculas, minúsculas y números).
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  {profilePassword.length}/18 caracteres
                </span>
              </div>

              <div className="relative max-w-md">
                <input
                  type={showPassword ? 'text' : 'password'}
                  maxLength={18}
                  placeholder="Ingresa tu contraseña de hasta 18 caracteres"
                  value={profilePassword}
                  onChange={(e) => {
                    // Permitir sólo alfanuméricos hasta 18 caracteres
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18);
                    setProfilePassword(val);
                  }}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-amber-300 bg-white font-mono font-bold text-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-amber-900/80">
                🔒 Tu contraseña está protegida. El administrador no puede verla ni alterarla; sólo tú como encargado puedes gestionarla.
              </p>
            </div>

            {/* BOTÓN DE GUARDAR Y CONFIRMACIÓN */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              {isSavedProfile ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>¡Datos, logo y contraseña del negocio guardados correctamente!</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Los cambios se sincronizan en tu sesión y en la base del portal.
                </span>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Cambios de Mi Negocio</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
