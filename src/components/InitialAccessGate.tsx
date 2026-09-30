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
  Eye
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { UserRole } from '../types/inventory';
import { SILAO_MERCHANTS } from '../data/silaoMarketData';

export const InitialAccessGate: React.FC = () => {
  const { 
    merchants, 
    loginRole, 
    setHasAccessSelected, 
    setActiveTab, 
    setIsBrochureModalOpen 
  } = useInventory();

  const merchantsList = merchants && merchants.length > 0 ? merchants : SILAO_MERCHANTS;

  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchantsList[0]?.id || '');
  const [merchantPin, setMerchantPin] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEnterAsClient = () => {
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
    setLoading(true);
    const res = loginRole('negocio', selectedMerchantId, merchantPin || '1234');
    if (res.success) {
      setHasAccessSelected(true);
      setActiveTab('mi_negocio');
    } else {
      setErrorMessage(res.message || 'PIN incorrecto. (Por defecto demo: 1234)');
    }
    setLoading(false);
  };

  const handleEnterAsAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    const res = loginRole('admin', undefined, adminPin || '1234');
    if (res.success) {
      setHasAccessSelected(true);
      setActiveTab('inventario');
    } else {
      setErrorMessage(res.message || 'PIN de Administrador incorrecto. (Por defecto demo: 1234)');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden text-slate-100 font-sans">
      
      {/* Background with Cristo Rey Silao overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none scale-105"
        style={{
          backgroundImage: `url('/images/cristo_rey_silao.jpg'), url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg/1280px-Cristo_Rey_-_Cerro_del_Cubilete_-_Silao%2C_Guanajuato_-_Explanada.jpg')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 pointer-events-none" />

      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center justify-center flex-1">
        
        {/* Top Branding Section */}
        <header className="text-center space-y-3 mb-8 md:mb-10 max-w-3xl">
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
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-emerald-500/30 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-xl group hover:shadow-emerald-950/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  Acceso Público
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

              {/* Explicit user requirement badge */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Modo Consulta y Pedidos:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Los clientes pueden <strong>ver los inventarios y existencias</strong> de todas las tiendas de Silao y <strong>hacer pedidos</strong>.
                </p>
                <p className="text-[10px] text-amber-300 font-medium">
                  🔒 No tienen permisos de edición ni modificación de productos.
                </p>
              </div>

              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ver catálogo completo de todas las tiendas de Silao en un solo lugar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Carrito consolidado con costo de envío accesible ($25 a $40 MXN).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Rastreo de pedido con código QR y entrega de 8:00 AM a 8:00 PM.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleEnterAsClient}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:shadow-emerald-600/30"
              >
                <span>Entrar como Cliente</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
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
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    PIN de Acceso al Comercio:
                  </label>
                  <input
                    type="password"
                    placeholder="PIN (Demo: 1234)"
                    value={merchantPin}
                    onChange={(e) => setMerchantPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    * PIN predeterminado: <strong className="text-amber-300">1234</strong>
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
                  Control Total & Logística Hub Central
                </p>
              </div>

              {/* Explicit user requirement badge */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Acceso Completo:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Supervisión y edición de <strong>todos los comercios, inventarios, despacho con QR y finanzas</strong>.
                </p>
                <p className="text-[10px] text-indigo-300">
                  ⭐ Liquidaciones semanales, asignación de choferes y control municipal.
                </p>
              </div>

              {/* Admin Login Form */}
              <form id="admin-login-form" onSubmit={handleEnterAsAdmin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    PIN Maestro de Administración:
                  </label>
                  <input
                    type="password"
                    placeholder="PIN Maestro (Demo: 1234)"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    * PIN maestro predeterminado: <strong className="text-indigo-300">1234</strong>
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
            onClick={() => setIsBrochureModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/20 font-semibold cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 Ver Folleto Oficial de Afiliación (0% Entrada, 8-18% Comisión)</span>
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
