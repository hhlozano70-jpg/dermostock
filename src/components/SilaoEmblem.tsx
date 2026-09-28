import React from 'react';

interface SilaoEmblemProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const SilaoEmblem: React.FC<SilaoEmblemProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        <defs>
          <linearGradient id="silaoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="silaoEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="silaoSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Circular Shield with Gold Border */}
        <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="url(#silaoGold)" strokeWidth="3" />
        
        {/* Decorative Inner Ring */}
        <circle cx="50" cy="50" r="43" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />

        {/* Sky Background */}
        <clipPath id="innerCircleClip">
          <circle cx="50" cy="50" r="42" />
        </clipPath>

        <g clipPath="url(#innerCircleClip)">
          {/* Dawn Sky in Bajío */}
          <rect x="8" y="8" width="84" height="84" fill="url(#silaoSky)" />
          
          {/* Sun Glow Behind Mountain */}
          <circle cx="50" cy="38" r="22" fill="url(#sunGlow)" />
          
          {/* Sun Rays */}
          <line x1="50" y1="16" x2="50" y2="24" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="36" y1="22" x2="41" y2="28" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="64" y1="22" x2="59" y2="28" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="28" y1="36" x2="35" y2="38" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="72" y1="36" x2="65" y2="38" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

          {/* Distant Hills of Silao / Bajío */}
          <path d="M5 62 Q25 48 50 56 Q75 64 95 52 L95 95 L5 95 Z" fill="#047857" opacity="0.7" />

          {/* Cerro del Cubilete (Famous Mountain Dome) */}
          <path 
            d="M18 78 Q35 52 50 44 Q65 52 82 78 L95 95 L5 95 Z" 
            fill="url(#silaoEmerald)" 
          />

          {/* Monumento a Cristo Rey de la Montaña (Statue with Open Arms) */}
          {/* Pedestal / Sanctuary Dome */}
          <path d="M44 45 Q50 42 56 45 L55 49 L45 49 Z" fill="#F8FAFC" />
          {/* Statue Body */}
          <path d="M47 30 L53 30 L54 43 L46 43 Z" fill="#FFFFFF" />
          {/* Head & Crown */}
          <circle cx="50" cy="27" r="2.8" fill="#FFFFFF" />
          <path d="M48 24 L52 24 L50 21 Z" fill="#FDE047" />
          {/* Outstretched Arms (Iconic feature of Cristo Rey de Silao) */}
          <path 
            d="M37 32 Q43 31 50 31 Q57 31 63 32 Q63 34 50 33 Q37 34 37 32 Z" 
            fill="#FFFFFF" 
          />

          {/* Historic Colonial Arches of Silao (Parroquia Santiago Apóstol / Portales) */}
          <rect x="24" y="68" width="52" height="18" rx="2" fill="#0F172A" opacity="0.85" />
          <path d="M28 84 L28 73 Q32 70 36 73 L36 84" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <path d="M42 84 L42 73 Q46 70 50 73 L50 84" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <path d="M56 84 L56 73 Q60 70 64 73 L64 84" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <path d="M70 84 L70 73 Q74 70 78 73 L78 84" stroke="#F59E0B" strokeWidth="1.5" fill="none" />

          {/* Silaomarket Hub Shopping Cart Banner */}
          <rect x="15" y="80" width="70" height="14" rx="3" fill="#D97706" />
          <text 
            x="50" 
            y="89" 
            textAnchor="middle" 
            fill="#FFFFFF" 
            fontSize="7" 
            fontWeight="bold" 
            fontFamily="system-ui, sans-serif" 
            letterSpacing="1"
          >
            SILAO GTO
          </text>
        </g>

        {/* Small Golden Star at Top Peak */}
        <polygon 
          points="50,4 52,9 57,9 53,12 55,17 50,14 45,17 47,12 43,9 48,9" 
          fill="#FDE047" 
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
              Silaomarket
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow-xs">
              on line
            </span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold tracking-wide mt-0.5">
            ⛰️ Silao de la Victoria · Hub Local
          </span>
        </div>
      )}
    </div>
  );
};
