import React, { useState } from 'react';
import { Product } from '../types/inventory';

interface ProductVisualProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg' | 'detail';
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const getBrandStyling = () => {
    switch (product.brand) {
      case 'Eucerin':
        return {
          bgGrad: 'from-rose-50 to-slate-100',
          accent: '#A51C30',
          accentText: 'text-[#A51C30]',
          badgeBg: 'bg-rose-100/70',
          sealText: 'DERMATOLÓGICO',
        };
      case 'Aquaphor':
      case 'Aquaphor / Eucerin':
        return {
          bgGrad: 'from-cyan-50 to-sky-100/60',
          accent: '#0284C7',
          accentText: 'text-[#0284C7]',
          badgeBg: 'bg-sky-100/70',
          sealText: 'REPARADOR',
        };
      case 'Aquaphor Baby':
        return {
          bgGrad: 'from-amber-50/70 to-teal-50',
          accent: '#0D9488',
          accentText: 'text-[#0D9488]',
          badgeBg: 'bg-teal-100/70',
          sealText: 'PEDIÁTRICO',
        };
      case 'Nivea Men':
        return {
          bgGrad: 'from-slate-100 to-slate-200/80',
          accent: '#0F172A',
          accentText: 'text-[#0F172A]',
          badgeBg: 'bg-slate-200',
          sealText: 'MEN CARE',
        };
      case 'Nivea':
      default:
        return {
          bgGrad: 'from-blue-50/70 to-slate-100',
          accent: '#003274',
          accentText: 'text-[#003274]',
          badgeBg: 'bg-blue-100/70',
          sealText: 'ORIGINAL',
        };
    }
  };

  const styling = getBrandStyling();

  const heightClasses = {
    sm: 'h-24 w-24',
    md: 'h-52 w-full',
    lg: 'h-64 w-full',
    detail: 'h-80 w-full',
  }[size];

  const hasCustomImage = Boolean(product.imageUrl && !imageError);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b ${styling.bgGrad} border border-slate-200/60 select-none ${heightClasses} ${className}`}
    >
      {/* Subtle brand watermark & background lighting aura */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-white/80 blur-xl" />
      </div>

      {/* Custom Image or SVG Packaging Representation */}
      {hasCustomImage ? (
        <div className="relative z-10 w-full h-full p-3 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
          {product.packagingType === 'tin' && (
            /* Nivea Blue Tin */
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-[#002255] via-[#003882] to-[#0052b4] shadow-md border-2 border-[#002255] flex flex-col items-center justify-center text-white px-2">
              <div className="w-24 h-24 rounded-full border border-blue-300/30 flex flex-col items-center justify-center shadow-inner">
                <span className="font-extrabold tracking-widest text-sm text-white font-sans drop-shadow-sm">
                  {product.brand.toUpperCase()}
                </span>
                <span className="text-[9px] tracking-wider text-blue-100 font-medium mt-0.5">
                  Creme
                </span>
                <span className="text-[7px] text-blue-200/80 mt-1">{product.volume || '60 ml'}</span>
              </div>
            </div>
          )}

          {product.packagingType === 'jar' && (
            /* Cosmetic Cream Jar */
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-4 bg-slate-300 rounded-t-lg border-b border-slate-400 shadow-xs" />
              <div className="w-22 h-18 rounded-b-xl bg-white border border-slate-200 shadow-md flex flex-col items-center justify-between p-2">
                <span className="text-[9px] font-bold text-slate-800">{product.brand}</span>
                <span className="text-[7px] text-slate-500 font-medium line-clamp-1">{product.name}</span>
                <span className="text-[6px] text-slate-400">{product.volume || '50 ml'}</span>
              </div>
            </div>
          )}

          {product.packagingType === 'dropper' && (
            /* Serum Dropper Bottle */
            <div className="relative flex flex-col items-center">
              <div className="w-3 h-3 bg-slate-700 rounded-t-full" />
              <div className="w-6 h-3 bg-slate-300 border-b border-slate-400" />
              <div className="w-12 h-24 rounded-b-lg rounded-t-sm bg-gradient-to-b from-amber-700/80 via-amber-600/70 to-amber-800 shadow-md flex flex-col items-center justify-between p-2 text-white">
                <span className="text-[8px] font-bold tracking-wider">{product.brand}</span>
                <span className="text-[7px] font-medium text-amber-100 line-clamp-1">SERUM</span>
                <span className="text-[6px] text-amber-200">{product.volume || '30 ml'}</span>
              </div>
            </div>
          )}

          {product.packagingType === 'lip_balm' && (
            /* Pack x2 Bálsamo Labial Watermelon */
            <div className="relative flex items-center gap-2">
              <div className="w-6 h-24 rounded-t-full rounded-b-md bg-gradient-to-b from-rose-400 via-rose-300 to-[#003274] shadow-md flex flex-col items-center justify-between py-2 border border-rose-300/50">
                <div className="w-2.5 h-2 rounded-full bg-rose-200" />
                <span className="text-[7px] text-white font-black tracking-widest -rotate-90 origin-center whitespace-nowrap">
                  {product.brand.toUpperCase()}
                </span>
                <div className="w-full h-1.5 bg-rose-500 rounded-b-sm" />
              </div>
              <div className="w-6 h-24 rounded-t-full rounded-b-md bg-gradient-to-b from-rose-400 via-rose-300 to-[#003274] shadow-md flex flex-col items-center justify-between py-2 border border-rose-300/50">
                <div className="w-2.5 h-2 rounded-full bg-rose-200" />
                <span className="text-[7px] text-white font-black tracking-widest -rotate-90 origin-center whitespace-nowrap">
                  {product.brand.toUpperCase()}
                </span>
                <div className="w-full h-1.5 bg-rose-500 rounded-b-sm" />
              </div>
              <div className="absolute -bottom-2 -right-3 bg-rose-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow">
                PACK x2
              </div>
            </div>
          )}

          {product.packagingType === 'tube' && (
            /* Ointment / Diaper cream tube */
            <div className="relative flex flex-col items-center">
              <div
                className={`w-14 h-28 rounded-t-xl rounded-b-sm shadow-md flex flex-col items-center justify-between p-2 border ${
                  product.brand.includes('Baby')
                    ? 'bg-gradient-to-b from-teal-50 via-white to-sky-100 border-teal-200'
                    : 'bg-gradient-to-b from-white via-slate-50 to-blue-100 border-sky-200'
                }`}
              >
                <div className="w-8 h-1 bg-slate-300 rounded-full mb-1" />
                <div className="text-center">
                  <span
                    className="font-bold text-[9px] tracking-wide block"
                    style={{ color: styling.accent }}
                  >
                    {product.brand}
                  </span>
                  <span className="text-[7px] text-slate-600 block leading-tight font-medium">
                    {product.category === 'Cuidado Infantil' ? 'Baby Care' : 'Care'}
                  </span>
                  <span className="text-[6px] text-slate-400 block mt-1">{product.volume}</span>
                </div>
                <div className="w-full h-1.5 rounded-sm" style={{ backgroundColor: styling.accent }} />
              </div>
              <div className="w-10 h-4 bg-slate-200 rounded-b-md border-t border-slate-300 shadow-inner" />
            </div>
          )}

          {product.packagingType === 'pump' && (
            /* Dispenser pump bottle */
            <div className="relative flex flex-col items-center">
              <div className="relative flex flex-col items-center">
                <div className="w-7 h-2 bg-slate-700 rounded-t-sm" />
                <div className="w-2.5 h-3 bg-slate-400" />
                <div className="w-9 h-2 bg-slate-300 rounded-sm border-b border-slate-400" />
              </div>
              <div
                className={`w-16 h-28 rounded-2xl shadow-md flex flex-col items-center justify-between p-2 border ${
                  product.brand === 'Eucerin'
                    ? 'bg-white border-rose-200'
                    : 'bg-gradient-to-b from-white to-sky-50 border-sky-200'
                }`}
              >
                <div
                  className="w-full text-center py-1 border-b border-slate-100"
                  style={{ color: styling.accent }}
                >
                  <span className="font-extrabold text-[9px] tracking-wider block">
                    {product.brand}
                  </span>
                </div>
                <div className="text-center px-1">
                  <div
                    className="w-6 h-0.5 mx-auto mb-1 rounded-full"
                    style={{ backgroundColor: styling.accent }}
                  />
                  <span className="text-[8px] font-semibold text-slate-700 block leading-tight line-clamp-2">
                    {product.name.replace(/(\(.*?\))/g, '')}
                  </span>
                </div>
                <div className="w-full text-center pt-1 border-t border-slate-100">
                  <span className="text-[7px] text-slate-500 font-mono">{product.volume}</span>
                </div>
              </div>
            </div>
          )}

          {product.packagingType === 'large_bottle' && (
            /* Maxi bottle 1000ml or 650ml */
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-3 bg-slate-300 rounded-t-md border-b border-slate-400" />
              <div
                className={`w-20 h-32 rounded-2xl shadow-md flex flex-col items-center justify-between p-2.5 border ${
                  product.brand === 'Eucerin'
                    ? 'bg-white border-rose-200'
                    : 'bg-gradient-to-b from-[#003882] to-[#002255] border-blue-900 text-white'
                }`}
              >
                <div className="text-center w-full">
                  <span
                    className={`font-black text-[10px] tracking-wider block ${
                      product.brand === 'Eucerin' ? 'text-[#A51C30]' : 'text-white'
                    }`}
                  >
                    {product.brand}
                  </span>
                  <span
                    className={`text-[8px] font-medium block ${
                      product.brand === 'Eucerin' ? 'text-slate-600' : 'text-blue-100'
                    }`}
                  >
                    {product.volume || 'MAXI'}
                  </span>
                </div>
                <div
                  className={`w-10 h-0.5 rounded-full ${
                    product.brand === 'Eucerin' ? 'bg-[#A51C30]' : 'bg-blue-300'
                  }`}
                />
                <div className="text-center">
                  <span
                    className={`text-[8px] font-bold block ${
                      product.brand === 'Eucerin' ? 'text-slate-700' : 'text-white'
                    }`}
                  >
                    {product.volume}
                  </span>
                </div>
              </div>
            </div>
          )}

          {product.packagingType === 'box' && (
            /* Post Shave / Cream Box */
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-28 rounded-md bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] border border-slate-700 shadow-md flex flex-col items-center justify-between p-2.5 text-white">
                <div className="w-full text-center border-b border-slate-700 pb-1">
                  <span className="font-extrabold text-[9px] tracking-widest text-blue-400 block">
                    {product.brand.toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] font-bold text-slate-100 block line-clamp-2">
                    {product.name}
                  </span>
                </div>
                <div className="w-full bg-blue-600/40 py-0.5 text-center rounded text-[7px] text-blue-200">
                  {product.volume || '100 ml'}
                </div>
              </div>
            </div>
          )}

          {product.packagingType === 'bottle' && (
            /* Standard 400ml / 500ml Lotion or Shower Gel Bottle */
            <div className="relative flex flex-col items-center">
              <div
                className={`w-6 h-3 rounded-t-md border-b ${
                  product.brand === 'Nivea Men'
                    ? 'bg-slate-700 border-slate-800'
                    : 'bg-slate-200 border-slate-300'
                }`}
              />
              <div
                className={`w-15 h-30 rounded-2xl shadow-md flex flex-col items-center justify-between p-2 border ${
                  product.brand === 'Nivea Men'
                    ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-slate-800 text-white'
                    : product.category === 'Gel de Ducha'
                    ? 'bg-gradient-to-b from-white via-blue-50/50 to-indigo-50 border-indigo-100 text-slate-800'
                    : 'bg-gradient-to-b from-[#003882] to-[#002255] border-blue-900 text-white'
                }`}
              >
                <div className="text-center w-full">
                  <span
                    className={`font-black text-[9px] tracking-wider block ${
                      product.category === 'Gel de Ducha'
                        ? 'text-[#003274]'
                        : product.brand === 'Nivea Men'
                        ? 'text-blue-400'
                        : 'text-white'
                    }`}
                  >
                    {product.brand}
                  </span>
                </div>
                <div className="text-center px-1">
                  <span
                    className={`text-[8px] font-medium block leading-tight line-clamp-2 ${
                      product.category === 'Gel de Ducha'
                        ? 'text-slate-700'
                        : 'text-slate-200'
                    }`}
                  >
                    {product.name.replace(/Nivea|Eucerin|Aquaphor/gi, '').replace(/\(.*?\)/g, '').trim()}
                  </span>
                </div>
                <div className="text-center w-full pt-1 border-t border-white/20">
                  <span
                    className={`text-[7px] font-mono ${
                      product.category === 'Gel de Ducha' ? 'text-slate-500' : 'text-blue-200'
                    }`}
                  >
                    {product.volume}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Category/Brand Pill */}
      <div className="absolute top-2 left-2 z-20">
        <span className="text-[10px] font-semibold text-slate-600 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200/80">
          {product.brand}
        </span>
      </div>

      {/* Subtle Stock indicator badge if low or empty */}
      {product.stock <= 0 ? (
        <div className="absolute top-2 right-2 z-20">
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded shadow-xs">
            Agotado
          </span>
        </div>
      ) : product.stock <= product.minStockAlert ? (
        <div className="absolute top-2 right-2 z-20">
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shadow-xs">
            Últimas {product.stock}
          </span>
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-20">
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded shadow-xs">
            {product.stock} disponibles
          </span>
        </div>
      )}
    </div>
  );
};

