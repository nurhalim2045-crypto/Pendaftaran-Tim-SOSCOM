import React from 'react';

export const LOGO_SMANSA_SRC = '/assets/aistudio/LOGO_SMANSA_FIX_9cc86f6a.png';
export const LOGO_OSIS_SRC = '/assets/aistudio/Logo_Osis_90974740.jpeg';
export const LOGO_SALTY_SRC = '/assets/aistudio/Logo_Salty_32274dc5.png';

interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * 1. Logo Resmi SMAN 1 Pangkajene dan Kepulauan (SMAN 1 Pangkep)
 */
export const LogoSman1Pangkep: React.FC<LogoProps> = ({
  className = '',
  size = 56,
  alt = 'Logo SMAN 1 Pangkajene dan Kepulauan',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center relative select-none ${className}`}
    >
      <img
        src={LOGO_SMANSA_SRC}
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.35)] transition-transform duration-200"
        loading="eager"
      />
    </div>
  );
};

/**
 * 2. Logo Resmi OSIS UPT SMAN 1 Pangkep
 */
export const LogoOsis: React.FC<LogoProps> = ({
  className = '',
  size = 56,
  alt = 'Logo OSIS UPT SMAN 1 Pangkep',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center relative select-none ${className}`}
    >
      <img
        src={LOGO_OSIS_SRC}
        alt={alt}
        className="w-full h-full object-contain rounded-xl filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)] transition-transform duration-200"
        loading="eager"
      />
    </div>
  );
};

/**
 * 3. Logo Resmi Komunitas SALTY (SMANSA Olympic Community)
 */
export const LogoSalty: React.FC<LogoProps> = ({
  className = '',
  size = 56,
  alt = 'Logo Komunitas SALTY (SMANSA Olympic Community)',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center relative select-none ${className}`}
    >
      <img
        src={LOGO_SALTY_SRC}
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(0,240,255,0.4)] transition-transform duration-200"
        loading="eager"
      />
    </div>
  );
};

/**
 * TripleLogoHeader Component
 * Renders the 3 official logos in a professional, aligned, futuristic layout.
 */
interface TripleLogoHeaderProps {
  compact?: boolean;
  className?: string;
  showLabels?: boolean;
}

export const TripleLogoHeader: React.FC<TripleLogoHeaderProps> = ({
  compact = false,
  className = '',
  showLabels = true,
}) => {
  const logoSize = compact ? 44 : 58;

  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-6 ${className}`}>
      {/* 1. Logo SMAN 1 Pangkep */}
      <div className="flex flex-col items-center text-center group transition-transform hover:scale-105">
        <div className="p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-lg shadow-cyan-950/50 backdrop-blur-md flex items-center justify-center">
          <LogoSman1Pangkep size={logoSize} />
        </div>
        {!compact && showLabels && (
          <span className="text-[10px] sm:text-xs font-bold text-slate-200 mt-1.5 max-w-[95px] leading-tight">
            SMAN 1 Pangkep
          </span>
        )}
      </div>

      {/* Futuristic glowing Divider */}
      <div className="h-8 sm:h-12 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />

      {/* 2. Logo OSIS UPT SMAN 1 Pangkep */}
      <div className="flex flex-col items-center text-center group transition-transform hover:scale-105">
        <div className="p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-lg shadow-amber-950/50 backdrop-blur-md flex items-center justify-center">
          <LogoOsis size={logoSize} />
        </div>
        {!compact && showLabels && (
          <span className="text-[10px] sm:text-xs font-bold text-amber-300 mt-1.5 max-w-[95px] leading-tight">
            OSIS SMANSA
          </span>
        )}
      </div>

      {/* Futuristic glowing Divider */}
      <div className="h-8 sm:h-12 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />

      {/* 3. Logo Komunitas SALTY */}
      <div className="flex flex-col items-center text-center group transition-transform hover:scale-105">
        <div className="p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-lg shadow-cyan-500/30 backdrop-blur-md flex items-center justify-center">
          <LogoSalty size={logoSize} />
        </div>
        {!compact && showLabels && (
          <span className="text-[10px] sm:text-xs font-bold text-cyan-300 mt-1.5 max-w-[95px] leading-tight font-space">
            SALTY Community
          </span>
        )}
      </div>
    </div>
  );
};
