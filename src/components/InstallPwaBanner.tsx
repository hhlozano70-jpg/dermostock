import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('silaomarket_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Verificar si ya está en modo standalone / app instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !/crios|fxios/.test(userAgent);
    setIsIos(isIosDevice);

    // Escuchar el evento estándar de instalación PWA
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Escuchar cuando el usuario instala la aplicación
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Error al activar prompt de instalación PWA:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('silaomarket_pwa_dismissed', 'true');
    } catch {}
  };

  if (isInstalled && !installedSuccess) return null;
  if (isDismissed && !installedSuccess) return null;
  if (!deferredPrompt && !isIos && !installedSuccess) return null;

  if (installedSuccess) {
    return (
      <aside aria-label="Aplicación instalada" className="bg-emerald-700 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-amber-300" />
          <span className="font-bold">¡Silaomarket instalada con éxito en tu dispositivo!</span>
        </div>
        <button onClick={() => setInstalledSuccess(false)} className="text-white/80 hover:text-white text-xs cursor-pointer">
          ✕
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Instalar aplicación móvil" className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white px-3 sm:px-4 py-2.5 text-xs border-b border-emerald-500/30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span>Instala Silaomarket en tu celular</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                App PWA
              </span>
            </p>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Acceso rápido sin tiendas, pedidos más ágiles y navegación ligera desde tu pantalla de inicio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIos ? 'Ver cómo instalar en iPhone' : '📲 Instalar App'}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar aviso de instalación"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guía modal para usuarios de iPhone/iPad */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <span>📲 Instalar en iPhone / iPad</span>
              </h4>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-medium">Sigue estos dos sencillos pasos en Safari:</p>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p>1. Toca el botón <strong>Compartir</strong> (el icono con una flecha hacia arriba ⎋ en la barra inferior).</p>
                <p>2. Desliza hacia abajo y selecciona <strong>"Agregar a inicio" (Add to Home Screen ➕)</strong>.</p>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold">
                ¡Listo! Tendrás el acceso directo de Silaomarket listo en tu pantalla principal.
              </p>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
