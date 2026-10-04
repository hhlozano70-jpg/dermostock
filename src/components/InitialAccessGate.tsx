import React, { useState } from 'react';
import { 
  User, 
  Store, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles,
  Lock,
  FileText,
  Clock,
  MapPin,
  Truck,
  Eye,
  EyeOff,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { UserRole } from '../types/inventory';
import { SILAO_MERCHANTS, SILAO_COLONIAS } from '../data/silaoMarketData';

export const InitialAccessGate: React.FC = () => {
  const { 
    merchants, 
    loginRole, 
    setHasAccessSelected, 
    setActiveTab, 
    setIsBrochureModalOpen,
    setIsManualModalOpen,
    registeredCustomer,
    registerCustomer,
    loginCustomer
  } = useInventory();

  const merchantsList = merchants && merchants.length > 0 ? merchants : SILAO_MERCHANTS;

  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchantsList[0]?.id || '');
  const [merchantPin, setMerchantPin] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [showMerchantPass, setShowMerchantPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para Registro e Identificación de Cliente
  const [clientTab, setClientTab] = useState<'registro' | 'login' | 'invitado'>('registro');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientColonia, setClientColonia] = useState(SILAO_COLONIAS[0]);
  const [loginPhone, setLoginPhone] = useState('');
  const [showSwitchAccount, setShowSwitchAccount] = useState(false);
  const [clientErrorMessage, setClientErrorMessage] = useState<string | null>(null);

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setClientErrorMessage(null);

    const name = clientName.trim();
    const phone = clientPhone.replace(/\D/g, '').slice(-10);

    if (!name || name.length < 3) {
      setClientErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!phone || phone.length < 10) {
      setClientErrorMessage('Por favor ingresa un número de teléfono / WhatsApp válido (10 dígitos).');
      return;
    }

    setLoading(true);
    try {
      registerCustomer({
        name,
        phone,
        address: clientAddress.trim() || undefined,
        colonia: clientColonia
      });
      const res = loginRole('cliente');
      if (res.success) {
        setHasAccessSelected(true);
        setActiveTab('tienda');
      }
    } catch (err: any) {
      setClientErrorMessage(err?.message || 'Error al registrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginExistingClient = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setClientErrorMessage(null);

    const phone = loginPhone.replace(/\D/g, '').slice(-10);
    if (!phone || phone.length < 8) {
      setClientErrorMessage('Por favor ingresa los 10 dígitos de tu número de teléfono registrado.');
      return;
    }

    setLoading(true);
    try {
      const loginRes = loginCustomer(phone);
      if (loginRes.success) {
        const res = loginRole('cliente');
        if (res.success) {
          setHasAccessSelected(true);
          setActiveTab('tienda');
        }
      } else {
        setClientErrorMessage(loginRes.message || 'No se encontró cuenta con este número.');
      }
    } catch (err: any) {
      setClientErrorMessage(err?.message || 'Error al iniciar sesión de cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterAsGuest = () => {
    setLoading(true);
    const res = loginRole('cliente');
    if (res.success) {
      setHasAccessSelected(true);
      setActiveTab('tienda');
    }
    setLoading(false);
  };

  const handleEnterAsMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!selectedMerchantId) {
      setErrorMessage('Por favor selecciona tu comercio afiliado de Silao.');
      return;
    }
    if (!merchantPin.trim()) {
      setErrorMessage('Por favor ingresa la contraseña para acceder al perfil del comercio.');
      return;
    }
    setLoading(true);
    const res = loginRole('negocio', selectedMerchantId, merchantPin.trim());
    if (res.success) {
      setHasAccessSelected(true);
      setActiveTab('mi_negocio');
    } else {
      setErrorMessage(res.message || 'Contraseña incorrecta.');
    }
    setLoading(false);
  };

  const handleEnterAsAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!adminPin.trim()) {
      setErrorMessage('Por favor ingresa la contraseña de Administrador para acceder.');
      return;
    }
    setLoading(true);
    const res = loginRole('admin', undefined, adminPin.trim());
    if (res.success) {
      setHasAccessSelected(true);
      setActiveTab('inventario');
    } else {
      setErrorMessage(res.message || 'Contraseña de Administrador incorrecta.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden text-slate-100 font-sans">
      
      {/* Background with Cristo Rey Silao overlay & Silaomarket logo watermark */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none scale-105"
        style={{
          backgroundImage: `url('/images/cristo_rey_silao.jpg'), url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg/1280px-Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg')`
        }}
      />
      {/* Silaomarket logo watermark centered in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <img 
          src="/images/silaomarket_logo.jpg" 
          alt="" 
          className="w-96 h-96 sm:w-[500px] sm:h-[500px] object-contain rounded-full blur-xs mix-blend-screen"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 pointer-events-none" />

      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center justify-center flex-1">
        
        {/* Top Branding Section */}
        <header className="text-center space-y-3 mb-8 md:mb-10 max-w-3xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl">
              <img 
                src="/images/silaomarket_logo.jpg" 
                alt="Silaomarket Logo" 
                className="w-12 h-12 rounded-xl object-contain bg-white p-0.5 border border-amber-400/40 shadow-xs" 
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">Silaomarket</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                    on line
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                  <span>⛰️ Silao de la Victoria · Guanajuato</span>
                </p>
              </div>
            </div>

            {/* Quick Manual Button */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>📖 Manual de Operaciones (PDF)</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Control de Acceso y Selección de Perfil
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Plataforma municipal de comercio y consolidación multitienda con Hub Central en Calle 5 de Mayo #45.
            Selecciona tu tipo de usuario para ingresar:
          </p>
        </header>

        {/* Error message if any */}
        {errorMessage && (
          <div className="w-full max-w-md mb-6 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 backdrop-blur-md animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3 Interactive Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          
          {/* PERFIL 1: CLIENTE / COMPRADOR */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-emerald-500/30 p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-xl group hover:shadow-emerald-950/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  Acceso Comprador
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Soy Cliente</span>
                </h3>
                <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                  Comprar & Consultar Inventarios
                </p>
              </div>

              {/* Si ya hay un perfil de cliente registrado en este dispositivo */}
              {registeredCustomer && !showSwitchAccount ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-slate-950" />
                        <span>Cliente Registrado</span>
                      </span>
                      <span className="text-[11px] text-emerald-300 font-mono">
                        {registeredCustomer.phone}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{registeredCustomer.name}</h4>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        📍 {registeredCustomer.address || 'Silao Centro'} · {registeredCustomer.colonia || 'Silao, Gto'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnterAsGuest}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Continuar como {((registeredCustomer.name || 'Cliente').split(' ')[0])}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSwitchAccount(true)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Registrar nuevo cliente o cambiar cuenta
                  </button>
                </div>
              ) : (
                /* Formularios de Registro / Inicio de sesión / Invitado */
                <div className="space-y-3 pt-1">
                  {/* Selector de modo cliente */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
                    <button
                      type="button"
                      onClick={() => { setClientTab('registro'); setClientErrorMessage(null); }}
                      className={`py-1.5 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
                        clientTab === 'registro' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Registrarme
                    </button>
                    <button
                      type="button"
                      onClick={() => { setClientTab('login'); setClientErrorMessage(null); }}
                      className={`py-1.5 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
                        clientTab === 'login' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Ya tengo cuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => { setClientTab('invitado'); setClientErrorMessage(null); }}
                      className={`py-1.5 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
                        clientTab === 'invitado' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Invitado
                    </button>
                  </div>

                  {clientErrorMessage && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{clientErrorMessage}</span>
                    </div>
                  )}

                  {/* FORMULARIO 1: REGISTRO CLIENTE NUEVO */}
                  {clientTab === 'registro' && (
                    <form onSubmit={handleRegisterClient} className="space-y-2.5">
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-200 flex items-center gap-1.5 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Obtén estatus oficial de <strong>Cliente Registrado</strong></span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                          Nombre Completo:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. María López"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[11px] font-bold text-slate-300">
                            Celular WhatsApp (10 dígitos):
                          </label>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {clientPhone.replace(/\D/g, '').length}/10
                          </span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Ej. 4721234567"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                          Dirección de Entrega (Calle y Número):
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Calle Hidalgo #12"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                          Colonia en Silao:
                        </label>
                        <select
                          value={clientColonia}
                          onChange={(e) => setClientColonia(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
                        >
                          {SILAO_COLONIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Registrarme con Estatus Cliente</span>
                      </button>
                    </form>
                  )}

                  {/* FORMULARIO 2: LOGIN YA REGISTRADO */}
                  {clientTab === 'login' && (
                    <form onSubmit={handleLoginExistingClient} className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300 leading-snug">
                        Ingresa el celular con el que te registraste para recuperar tus pedidos anteriores y estatus de cliente.
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[11px] font-bold text-slate-300">
                            Celular Registrado:
                          </label>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {loginPhone.replace(/\D/g, '').length}/10
                          </span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Ej. 4721234567"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Ingresar como Cliente Registrado</span>
                      </button>
                    </form>
                  )}

                  {/* MODO 3: INVITADO */}
                  {clientTab === 'invitado' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                        Navega como visitante y consulta libremente el catálogo, precios comerciales, mayoreo y cadena fría de todos los comercios afiliados de Silao. Podrás registrarte cuando lo desees.
                      </div>

                      <button
                        type="button"
                        onClick={handleEnterAsGuest}
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>Entrar como Invitado</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {registeredCustomer && showSwitchAccount && (
                    <button
                      type="button"
                      onClick={() => setShowSwitchAccount(false)}
                      className="w-full text-center text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer pt-1"
                    >
                      Volver a mi sesión previa ({registeredCustomer.name})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Disclaimer inferior de permisos de cliente */}
            <div className="pt-3 mt-3 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
              <span>🛍️ Compras & Consulta</span>
              <span className="text-emerald-400 font-semibold">Hub Silao 5 de Mayo</span>
            </div>
          </div>

          {/* PERFIL 2: NEGOCIO AFILIADO */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-amber-500/30 p-6 flex flex-col justify-between hover:border-amber-500 transition-all shadow-xl group hover:shadow-amber-950/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  Comercio Local
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Negocio Afiliado</span>
                </h3>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  Control Exclusivo de Mi Inventario
                </p>
              </div>

              {/* Explicit user requirement badge */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Aislamiento Estricto:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Solo ves y gestionas <strong>tus propios productos, existencias y ventas</strong>.
                </p>
                <p className="text-[10px] text-slate-300">
                  🔒 No puedes ver inventarios ni ventas de otros comercios.
                </p>
              </div>

              {/* Merchant Login Form */}
              <form id="merchant-login-form" onSubmit={handleEnterAsMerchant} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Selecciona tu Comercio Afiliado:
                  </label>
                  <select
                    value={selectedMerchantId}
                    onChange={(e) => setSelectedMerchantId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                  >
                    {merchantsList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Contraseña de Acceso al Comercio:
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {merchantPin.length}/18 car.
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showMerchantPass ? 'text' : 'password'}
                      maxLength={18}
                      required
                      placeholder="Ingresa la contraseña del comercio"
                      value={merchantPin}
                      onChange={(e) => setMerchantPin(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18))}
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMerchantPass(!showMerchantPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showMerchantPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    * Alfanumérica hasta 18 caracteres requerida para acceder
                  </span>
                </div>
              </form>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10">
              <button
                type="submit"
                form="merchant-login-form"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Acceder a Mi Comercio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* PERFIL 3: ADMINISTRACIÓN HUB SILAO */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-indigo-500/30 p-6 flex flex-col justify-between hover:border-indigo-500 transition-all shadow-xl group hover:shadow-indigo-950/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                  Administración
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Administrador</span>
                </h3>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                  Supervisión & Finanzas Hub Silao
                </p>
              </div>

              {/* Explicit user requirement badge */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Supervisión y Control:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Consulta de datos de comercios, liquidaciones semanales y poder de <strong>eliminar comercios cuando se requiera</strong>.
                </p>
                <p className="text-[10px] text-indigo-300">
                  🔒 No modifica datos de los negocios ni visualiza contraseñas (son confidenciales del encargado).
                </p>
              </div>

              {/* Admin Login Form */}
              <form id="admin-login-form" onSubmit={handleEnterAsAdmin} className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Contraseña Maestra de Administrador:
                    </label>
                    <span className="text-[10px] text-indigo-300 font-mono font-bold">
                      {adminPin.length}/18 car.
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      maxLength={18}
                      required
                      placeholder="Ingresa la contraseña de Administrador"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18))}
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    * Alfanumérica hasta 18 caracteres requerida para acceder
                  </span>
                </div>
              </form>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10">
              <button
                type="submit"
                form="admin-login-form"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Acceder como Administrador</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Auxiliary Links */}
        <footer className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 text-center">
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold cursor-pointer transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>📖 Manual de Usuario y Operación (PDF)</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsBrochureModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/20 font-semibold cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 Ver Folleto Oficial de Afiliación (0% Entrada)</span>
          </button>
          <span>•</span>
          <span className="text-slate-400">
            Hub Silao Central: <strong>Calle 5 de Mayo #45, Silao Centro</strong>
          </span>
          <span>•</span>
          <span className="text-emerald-400">
            Soporte: <strong>hhlozano70@hotmail.com</strong>
          </span>
        </footer>

      </div>

    </div>
  );
};
