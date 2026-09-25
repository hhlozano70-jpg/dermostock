import React, { useState, useRef } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Cloud, 
  RefreshCw, 
  Download, 
  Upload, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    movements, 
    orders, 
    priceTier,
    syncStatus, 
    lastSyncTime, 
    syncWithServer,
    saveToServer,
    importFullBackup 
  } = useInventory();

  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      priceTier,
      products,
      movements,
      orders,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `DermoStock_Respaldo_Completo_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.products)) {
          const ok = importFullBackup(parsed);
          if (ok) {
            setImportSuccess(true);
            setImportError('');
            setTimeout(() => setImportSuccess(false), 3000);
          } else {
            setImportError('El archivo no contiene un formato de inventario compatible.');
          }
        } else {
          setImportError('El archivo JSON no tiene la estructura de productos esperada.');
        }
      } catch (err) {
        setImportError('Error al leer el archivo JSON. Verifica que sea un respaldo válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">
                Sincronización PC y Celular
              </h2>
              <p className="text-xs text-slate-400">
                Comparte datos, fotografías y cambios de inventario entre todos tus dispositivos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          
          {/* Explanation Box */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              ¿Por qué antes no coincidían los datos en la PC y el celular?
            </h3>
            <p className="text-blue-900 leading-relaxed">
              Por seguridad, cada navegador web (como Chrome en tu computadora o Safari/Chrome en tu teléfono) almacena su información en una memoria local aislada (<em>LocalStorage</em>). Cuando agregas un producto o subes una imagen en la computadora, se guardaba únicamente en esa máquina.
            </p>
            <p className="text-blue-900 leading-relaxed font-medium">
              Con el <strong>Servidor Central DermoStock</strong>, tus cambios ahora se guardan en la nube del servidor para que tu celular y tu computadora siempre compartan el mismo catálogo, imágenes y piezas físicas.
            </p>
          </div>

          {/* Sync Status Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Estado del Servidor Central
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <strong className="text-sm text-slate-900">
                  {syncStatus === 'synced' ? 'Sincronizado con la Nube' : 'Actualizando datos...'}
                </strong>
                {lastSyncTime && (
                  <span className="text-slate-400 text-[11px]">
                    (Última: {new Date(lastSyncTime).toLocaleTimeString('es-MX')})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={syncWithServer}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Descargar los datos más recientes del servidor"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar desde Servidor</span>
              </button>

              <button
                type="button"
                onClick={saveToServer}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Subir todos los productos y fotos de este dispositivo al servidor"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Guardar en Nube</span>
              </button>
            </div>
          </div>

          {/* Device Link Sharing */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-800" />
              Abrir esta misma tienda en tu Teléfono Celular
            </span>
            
            <p className="text-slate-500">
              Abre la siguiente dirección en el navegador de tu celular para ver exactamente los mismos datos e imágenes:
            </p>

            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
              <span className="flex-1 bg-transparent px-2 py-1 text-xs font-mono text-slate-800 truncate select-all">
                {currentUrl || (typeof window !== 'undefined' ? window.location.href : '')}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center gap-1 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore JSON files */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-slate-800" />
              Respaldo Manual de Emergencia (Archivo JSON)
            </span>

            <p className="text-slate-500">
              También puedes descargar un archivo de respaldo con todos tus productos, fotos y movimientos, o cargarlo en cualquier dispositivo sin depender de internet:
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Descargar Copia de Seguridad (.json)</span>
              </button>

              <label className="flex items-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cargar Copia de Seguridad (.json)</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Copia de seguridad restaurada con éxito! Todos los productos y fotos se han sincronizado.</span>
              </div>
            )}

            {importError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
