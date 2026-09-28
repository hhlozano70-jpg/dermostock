import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, Copy, Check, ExternalLink } from 'lucide-react';
import { Order } from '../types/inventory';

interface OrderQRCodeProps {
  order: Order;
  size?: number;
  showActions?: boolean;
  className?: string;
}

export const OrderQRCode: React.FC<OrderQRCodeProps> = ({
  order,
  size = 180,
  showActions = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>('');

  // Encoded tracking payload: URL or JSON
  const trackingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?rastreo=${order.trackingCode}`
    : `https://silaomarket.online/?rastreo=${order.trackingCode}`;

  const qrTextPayload = JSON.stringify({
    app: 'Silaomarket on line',
    hub: 'Hub Central Silao (Calle 5 de Mayo #45, Silao Centro)',
    orderId: order.id,
    trackingCode: order.trackingCode,
    customer: order.customerName,
    colonia: order.deliveryColonia || 'Silao',
    total: `$${order.total.toFixed(2)} MXN`,
    coldChain: order.hasColdChain ? 'SÍ (Hielera)' : 'NO',
    merchants: order.merchantsNames,
    url: trackingUrl
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      trackingUrl,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
        } else if (canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [order, size, trackingUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_Rastreo_${order.trackingCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className={`flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      {/* QR Header Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-[11px] font-bold tracking-wide uppercase mb-3 shadow-xs">
        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
        <span>QR Rastreo & Entrega</span>
      </div>

      {/* Canvas QR Container */}
      <div className="relative p-2 bg-white rounded-xl border-2 border-slate-900/10 shadow-xs">
        <canvas ref={canvasRef} className="rounded-lg block" />
        {order.hasColdChain && (
          <div className="absolute -top-2.5 -right-2.5 px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1 border-2 border-white">
            <span>❄️ Frío</span>
          </div>
        )}
      </div>

      {/* Tracking Code Display */}
      <div className="text-center mt-3 space-y-0.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
          Código de Seguimiento
        </span>
        <span className="font-mono text-base font-black text-slate-900 tracking-wider">
          {order.trackingCode}
        </span>
        <span className="text-[11px] text-slate-500 block">
          {order.deliveryColonia || 'Silao, Guanajuato'}
        </span>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-1.5 mt-3.5 pt-3 border-t border-slate-100 w-full justify-center flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copiar enlace directo de rastreo"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Descargar imagen PNG del QR"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Descargar</span>
          </button>

          <button
            type="button"
            onClick={handlePrintTicket}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Imprimir ticket para paquete o repartidor"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      )}
    </div>
  );
};
