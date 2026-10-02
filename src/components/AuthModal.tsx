import React, { useState } from 'react';
import { 
  X, 
  User, 
  Store, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Building2,
  FileText,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { UserRole } from '../types/inventory';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    userRole, 
    loggedMerchant, 
    loginRole, 
    logoutRole,
    merchants,
    setActiveTab,
    setIsBrochureModalOpen
  } = useInventory();

  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole || 'cliente');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(
    loggedMerchant?.id || (merchants.length > 0 ? merchants[0].id : '')
  );
  const [merchantPin, setMerchantPin] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [showMerchantPass, setShowMerchantPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedRole === 'cliente') {
      const res = loginRole('cliente');
      if (res.success) {
        setSuccessMessage('Has iniciado sesión como Cliente.');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setActiveTab('tienda');
        }, 400);
      }
    } else if (selectedRole === 'negocio') {
      if (!selectedMerchantId) {
        setErrorMessage('Por favor selecciona tu negocio.');
        return;
      }
      const res = loginRole('negocio', selectedMerchantId, merchantPin);
      if (res.success) {
        setSuccessMessage('¡Bienvenido a tu Portal de Negocio!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setActiveTab('mi_negocio');
        }, 500);
      } else {
        setErrorMessage(res.message || 'PIN incorrecto.');
      }
    } else if (selectedRole === 'admin') {
      const res = loginRole('admin', undefined, adminPin);
      if (res.success) {
        setSuccessMessage('¡Acceso concedido a la Administración Hub Silao!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setActiveTab('finanzas');
        }, 500);
      } else {
        setErrorMessage(res.message || 'PIN de Administrador incorrecto.');
      }
    }
  };

  const handleLogout = () => {
    logoutRole();
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Control de Acceso</span>
              <h3 className="text-xl font-black">Control de Roles y Cuentas</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Selecciona tu perfil para acceder a tus pedidos, panel comercial o administración del Hub Silao.
          </p>
        </div>

        {/* Current Session Banner if logged as merchant or admin */}
        {userRole !== 'cliente' && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Sesión activa: <strong>{userRole === 'admin' ? '🛡️ Administrador Hub Silao' : `🏪 ${loggedMerchant?.name}`}</strong>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-700 hover:text-red-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="p-6 space-y-6">
          
          {/* Mensajes de Alerta */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Selector de Roles con Tarjetas */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Rol 1: Cliente */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('cliente');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'cliente'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                selectedRole === 'cliente' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Cliente</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Comprar y Rastreo</p>
              </div>
            </button>

            {/* Rol 2: Negocio */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('negocio');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'negocio'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                selectedRole === 'negocio' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Negocio</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Portal Comercial</p>
              </div>
            </button>

            {/* Rol 3: Administrador */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                selectedRole === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Admin Hub</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Finanzas y Pagos</p>
              </div>
            </button>

          </div>

          {/* Contenido según el Rol Seleccionado */}
          {selectedRole === 'cliente' && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🛒
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Acceso Libre de Cliente</h4>
                  <p className="text-xs text-slate-500">Sin contraseñas complicadas. Agrega al carrito y pide a domicilio.</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Acceso para ver y comprar productos de todas las tiendas de Silao en un solo carrito consolidado.</li>
                <li>Tarifa de envío municipal accesible ($25 a $40 dependiendo de tiendas y artículos).</li>
                <li>Rastreo con código QR y entrega programada de 8:00 AM a 8:00 PM.</li>
              </ul>
            </div>
          )}

          {selectedRole === 'negocio' && (
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-4">
              <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950">
                🔒 <strong>Privacidad e Inventario Propio:</strong> Solo podrás ver y editar los productos y ventas de tu negocio. No tienes acceso al inventario de otras tiendas.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecciona tu Comercio Afiliado en Silao
                </label>
                <div className="relative">
                  <select
                    value={selectedMerchantId}
                    onChange={(e) => setSelectedMerchantId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.category} ({m.commissionRate || 10}%)
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Contraseña de Acceso al Negocio
                  </label>
                  <span className="text-[10px] text-amber-800 font-mono font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                    {merchantPin.length}/18 caracteres
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showMerchantPass ? 'text' : 'password'}
                    maxLength={18}
                    value={merchantPin}
                    onChange={(e) => setMerchantPin(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18))}
                    placeholder="Contraseña alfanumérica (Por defecto: 1234)"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMerchantPass(!showMerchantPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showMerchantPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  * Alfanumérica hasta 18 caracteres. Predeterminada inicial: <strong className="text-slate-800">1234</strong>
                </span>
              </div>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  🛡️
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Panel Maestro Hub Silao</h4>
                  <p className="text-xs text-slate-400">Supervisión general de pedidos, choferes, finanzas y red de comercios.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300">
                ⭐ <strong>Supervisión y Control:</strong> Consulta de datos de comercios, liquidaciones semanales y poder de eliminar negocios cuando se requiera. Las contraseñas son confidenciales del encargado.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Contraseña Maestra de Administrador
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                    {adminPin.length}/18 caracteres
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    maxLength={18}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18))}
                    placeholder="Contraseña alfanumérica (Por defecto: 1234)"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  * Contraseña alfanumérica hasta 18 caracteres. Predeterminada inicial: <strong className="text-emerald-400">1234</strong>
                </span>
              </div>
            </div>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-xl shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>
              {selectedRole === 'cliente' 
                ? 'Continuar como Cliente' 
                : selectedRole === 'negocio' 
                  ? 'Entrar a Mi Portal de Negocio' 
                  : 'Ingresar a Finanzas Hub'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Enlace al Folleto y Regreso a Puerta de Acceso */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                logoutRole();
                setIsAuthModalOpen(false);
              }}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>↩️ Salir a Pantalla de Acceso Inicial</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                setIsBrochureModalOpen(true);
              }}
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Folleto Oficial (0% Entrada)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
