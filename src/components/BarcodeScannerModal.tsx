import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Scan, 
  Camera, 
  ShoppingBag, 
  PackagePlus, 
  Search, 
  Check, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Plus, 
  ExternalLink,
  Keyboard,
  Sparkles,
  Barcode
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';
import { playScanBeep } from '../utils/sound';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'store' | 'inventory' | 'lookup';
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'store',
}) => {
  const { 
    products, 
    addToCart, 
    addStockMovement, 
    priceTier, 
    openProductModal, 
    setSelectedProductForQuickView 
  } = useInventory();

  const [mode, setMode] = useState<'store' | 'inventory' | 'lookup'>(initialMode);
  const [manualCode, setManualCode] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  // Scanner status
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAddToCart, setAutoAddToCart] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Inventory reception mode state
  const [stockAddQty, setStockAddQty] = useState<number>(1);
  const [stockAddSuccessMsg, setStockAddSuccessMsg] = useState<string | null>(null);
  const [cartAddSuccessMsg, setCartAddSuccessMsg] = useState<string | null>(null);

  // History of recent scans
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; product?: Product; timestamp: Date }>>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const isStoppingRef = useRef<boolean>(false);

  // Sync mode with prop
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMatchedProduct(null);
      setNotFoundCode(null);
      setStockAddSuccessMsg(null);
      setCartAddSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Product finder helper
  const findProductByCode = useCallback((rawCode: string): Product | null => {
    const clean = rawCode.trim().toLowerCase();
    if (!clean) return null;

    return products.find((p) => {
      const matchBarcode = p.barcode && p.barcode.toLowerCase() === clean;
      const matchSku = p.sku && p.sku.toLowerCase() === clean;
      const matchId = p.id && p.id.toLowerCase() === clean;
      // Also match if code is numeric and inside SKU or vice-versa
      const matchNumeric = clean.length >= 4 && (p.sku.toLowerCase().includes(clean) || clean.includes(p.sku.toLowerCase()));
      return matchBarcode || matchSku || matchId || matchNumeric;
    }) || null;
  }, [products]);

  // Handle a successfully resolved barcode
  const handleCodeDetected = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLastScannedCode(trimmed);
    const prod = findProductByCode(trimmed);

    if (prod) {
      if (soundEnabled) playScanBeep('success');
      setMatchedProduct(prod);
      setNotFoundCode(null);

      // Add to history
      setScanHistory((prev) => [
        { code: trimmed, product: prod, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);

      // If Auto Add to Cart is enabled in Store mode
      if (mode === 'store' && autoAddToCart) {
        addToCart(prod, 1);
        setCartAddSuccessMsg(`¡${prod.name} agregado al carrito!`);
        setTimeout(() => setCartAddSuccessMsg(null), 2500);
      }
    } else {
      if (soundEnabled) playScanBeep('error');
      setMatchedProduct(null);
      setNotFoundCode(trimmed);
      setScanHistory((prev) => [
        { code: trimmed, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    }
  }, [findProductByCode, soundEnabled, mode, autoAddToCart, addToCart]);

  // Hardware barcode scanner (Keyboard wedge) listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in the manual input box
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'INPUT') return;

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          handleCodeDetected(barcodeBufferRef.current);
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        // High speed typing (< 60ms between keys) is characteristic of a hardware barcode scanner gun
        if (diff > 80 && barcodeBufferRef.current.length > 0) {
          barcodeBufferRef.current = ''; // reset buffer if human typing paused
        }
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCodeDetected]);

  // Camera start/stop lifecycle
  useEffect(() => {
    let isMounted = true;

    if (!isOpen) {
      // Cleanup scanner if modal closes
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        isStoppingRef.current = true;
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
          setIsScanning(false);
          isStoppingRef.current = false;
        }).catch(() => {
          setIsScanning(false);
          isStoppingRef.current = false;
        });
      }
      return;
    }

    const startCameraScanner = async () => {
      try {
        setScannerError(null);

        // Discover cameras
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          setAvailableCameras(devices.map(d => ({ id: d.id, label: d.label || `Cámara ${d.id.slice(0, 5)}` })));
          
          // Prefer back/environment camera
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('trasera') || 
            d.label.toLowerCase().includes('environment')
          ) || devices[0];
          
          setSelectedCameraId(backCam.id);
        }

        const scannerId = "dermostock-camera-viewport";
        const viewportElement = document.getElementById(scannerId);
        if (!viewportElement) return;

        // Initialize instance
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerId);
        }

        const config = {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.333,
        };

        // Use environment facing mode or camera ID
        const cameraConfig = selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: "environment" };

        await html5QrCodeRef.current.start(
          cameraConfig,
          config,
          (decodedText) => {
            handleCodeDetected(decodedText);
          },
          () => {
            // Frame scanned without code, ignore
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera scanner initialization error:', err);
        if (isMounted) {
          setScannerError(
            err?.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Permite el acceso a la cámara en el navegador o usa el lector USB/manual.'
              : 'No se pudo iniciar la cámara en este dispositivo. Puedes usar la pistola USB o ingresar el código abajo.'
          );
          setIsScanning(false);
        }
      }
    };

    // Small delay to ensure DOM element is rendered
    const timer = setTimeout(() => {
      startCameraScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          html5QrCodeRef.current?.clear();
          setIsScanning(false);
        });
      }
    };
  }, [isOpen, handleCodeDetected]);

  // Switch camera handler
  const handleCameraChange = async (newCamId: string) => {
    setSelectedCameraId(newCamId);
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
      setIsScanning(false);
      
      const config = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.333,
      };

      await html5QrCodeRef.current.start(
        { deviceId: { exact: newCamId } },
        config,
        (decodedText) => handleCodeDetected(decodedText),
        () => {}
      );
      setIsScanning(true);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeDetected(manualCode.trim());
      setManualCode('');
    }
  };

  const handleAddStockConfirm = () => {
    if (!matchedProduct || stockAddQty <= 0) return;
    const ok = addStockMovement(
      matchedProduct.id,
      'entrada',
      stockAddQty,
      `Entrada por escáner de código de barras (${matchedProduct.sku})`,
      'SCAN-IN'
    );
    if (ok) {
      if (soundEnabled) playScanBeep('success');
      setStockAddSuccessMsg(`+${stockAddQty} piezas agregadas a ${matchedProduct.name}`);
      setTimeout(() => setStockAddSuccessMsg(null), 3000);
      // Refresh matched product stock
      const updated = products.find(p => p.id === matchedProduct.id);
      if (updated) {
        setMatchedProduct({ ...updated, stock: updated.stock + stockAddQty });
      }
    }
  };

  const handleAddToCartConfirm = () => {
    if (!matchedProduct) return;
    addToCart(matchedProduct, 1);
    if (soundEnabled) playScanBeep('success');
    setCartAddSuccessMsg(`¡${matchedProduct.name} agregado al carrito!`);
    setTimeout(() => setCartAddSuccessMsg(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Lector de Código de Barras / QR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Cámara & Pistola USB
                </span>
              </h2>
              <p className="text-xs text-slate-400">Escanea envases de Nivea, Eucerin y Aquaphor para vender o ingresar inventario</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar pitido' : 'Activar sonido pitido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('store')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'store'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Venta (Agregar al Carrito)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Almacén (Sumar Stock)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('lookup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'lookup'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Solo Consultar Precio/Stock</span>
            </button>
          </div>

          {mode === 'store' && (
            <label className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={autoAddToCart}
                onChange={(e) => setAutoAddToCart(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-agregar al escanear</span>
            </label>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Camera Viewport & Overlay */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[200px]">
            {/* html5-qrcode video viewport container */}
            <div 
              id="dermostock-camera-viewport" 
              className="w-full max-h-[260px] overflow-hidden flex items-center justify-center"
            />

            {/* Visual Viewfinder Aim Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative w-64 h-32 border-2 border-emerald-400/80 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {/* Corner brackets */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  {/* Laser scan line animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[11px] text-white/80 font-medium mt-2 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Apunta la cámara al código de barras del producto
                </span>
              </div>
            )}

            {/* Error or Fallback message if camera is unavailable */}
            {scannerError && (
              <div className="p-6 text-center text-slate-300 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-amber-400 stroke-1" />
                <p className="text-xs max-w-sm text-slate-300">{scannerError}</p>
                <p className="text-[11px] text-slate-400">
                  Puedes ingresar el código en el campo de texto manual de abajo o conectar una pistola USB.
                </p>
              </div>
            )}

            {/* Camera Switcher pill (if multiple cameras available) */}
            {availableCameras.length > 1 && isScanning && (
              <div className="absolute top-2 right-2 z-10">
                <select
                  value={selectedCameraId}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="text-[11px] bg-slate-900/80 text-white border border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Manual Input / Barcode Gun Helper */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ingresar código de barras o SKU manualmente..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Buscar
            </button>
          </form>

          {/* Success Banners */}
          {cartAddSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{cartAddSuccessMsg}</span>
              </div>
              <span className="text-[11px] text-emerald-700">En carrito</span>
            </div>
          )}

          {stockAddSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{stockAddSuccessMsg}</span>
            </div>
          )}

          {/* Scanned Product Card (FOUND) */}
          {matchedProduct && (
            <div className="p-4 bg-slate-50 border-2 border-blue-500/50 rounded-2xl space-y-3 shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {matchedProduct.imageUrl ? (
                    <img 
                      src={matchedProduct.imageUrl} 
                      alt={matchedProduct.name} 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">
                      {matchedProduct.brand.slice(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                      {matchedProduct.brand}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      SKU: {matchedProduct.sku}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                    {matchedProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {matchedProduct.presentation}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stock Actual</span>
                      <strong className={`font-mono text-sm ${matchedProduct.stock <= 2 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {matchedProduct.stock} piezas
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Precio Comercial</span>
                      <strong className="font-mono text-sm text-slate-900">
                        ${matchedProduct.commercialPrice.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-blue-600 block">Mayorista (-40%)</span>
                      <strong className="font-mono text-sm text-blue-700">
                        ${matchedProduct.wholesalePrice.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-600 block">Promo (-60%)</span>
                      <strong className="font-mono text-sm text-emerald-700">
                        ${matchedProduct.promoPrice.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons depending on mode */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                {mode === 'store' ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleAddToCartConfirm}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductForQuickView(matchedProduct);
                        onClose();
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ver Detalle Completo
                    </button>
                  </div>
                ) : mode === 'inventory' ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <span className="text-xs font-semibold text-slate-700">Registrar Entrada:</span>
                    <div className="flex items-center gap-1">
                      {[1, 5, 10].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setStockAddQty(qty)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                            stockAddQty === qty
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          +{qty}
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={stockAddQty}
                      onChange={(e) => setStockAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-mono font-bold"
                    />

                    <button
                      type="button"
                      onClick={handleAddStockConfirm}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Confirmar Entrada</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductForQuickView(matchedProduct);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Ver Ficha de Producto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Not Found State */}
          {notFoundCode && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    Producto no registrado con este código
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    El código escaneado <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded">{notFoundCode}</strong> no coincide con ningún SKU o código de barras de los 100 productos en catálogo.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const codeToPass = notFoundCode;
                    onClose();
                    openProductModal({ barcode: codeToPass });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dar de Alta Nuevo Producto</span>
                </button>
              </div>
            </div>
          )}

          {/* Recent Scans History in Session */}
          {scanHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Escaneos recientes en esta sesión:
              </span>
              <div className="max-h-24 overflow-y-auto divide-y divide-slate-100 text-xs">
                {scanHistory.slice(0, 5).map((h, idx) => (
                  <div key={idx} className="py-1 flex items-center justify-between text-slate-600">
                    <span className="font-mono text-[11px] text-slate-800 font-medium">
                      {h.code}
                    </span>
                    <span className="text-[11px] truncate max-w-[200px] text-slate-500">
                      {h.product ? h.product.name : 'No registrado'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {h.timestamp.toLocaleTimeString('es-MX', { minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>Pistola USB / Bluetooth activa en segundo plano</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar Escáner
          </button>
        </div>

      </div>
    </div>
  );
};
