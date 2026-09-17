import React from 'react';

interface TorresulLogoProps {
  className?: string;
  variant?: 'red' | 'silver' | 'white';
  layout?: 'horizontal' | 'vertical' | 'icon-only';
  showCreci?: boolean;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
}

export const TorresulLogo: React.FC<TorresulLogoProps> = ({
  className = '',
  variant = 'red',
  layout,
  showCreci = true,
  size = 'md',
}) => {
  const isNumericSize = typeof size === 'number';
  const effectiveLayout = layout || (isNumericSize ? 'icon-only' : 'horizontal');
  // Official Torresul color tokens matching images.png
  // Left facet: dark crimson/burgundy shadow (#912423)
  // Right facet: vibrant official Torresul red (#D32525)
  const isWhite = variant === 'white';
  const isSilver = variant === 'silver';

  // Even on dark headers, the brand emblem retains its iconic dual-red identity
  const leftFacetColor = isWhite ? '#CBD5E1' : '#912423';
  const rightFacetColor = isWhite ? '#FFFFFF' : '#D32525';

  const textColor = isSilver || isWhite ? 'text-white' : 'text-zinc-950';
  const subTextColor = isSilver || isWhite ? 'text-zinc-300' : 'text-zinc-700';
  const creciColor = isSilver || isWhite ? 'text-zinc-400' : 'text-zinc-500';

  const sizeClasses = typeof size === 'string' ? {
    sm: { icon: 'w-6 h-6 sm:w-7 sm:h-7', title: 'text-sm', sub: 'text-[9px]', gap: 'gap-2.5' },
    md: { icon: 'w-8 h-8 sm:w-9 sm:h-9', title: 'text-lg', sub: 'text-[11px]', gap: 'gap-3' },
    lg: { icon: 'w-12 h-12', title: 'text-2xl', sub: 'text-xs', gap: 'gap-3.5' },
    xl: { icon: 'w-16 h-16', title: 'text-3xl sm:text-4xl', sub: 'text-sm', gap: 'gap-4' },
  }[size] : { icon: '', title: 'text-base', sub: 'text-[10px]', gap: 'gap-2' };

  // Official Torresul 12-facet geometric skyscraper emblem identical to images.png
  const TowerIcon = (
    <svg
      viewBox="0 0 100 100"
      style={isNumericSize ? { width: size, height: size } : undefined}
      className={`${sizeClasses.icon} shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Torresul Imobiliária"
    >
      {/* 1. TOP ROOF CAP (2 facets) */}
      <polygon points="49.2,7.5 39.6,11.6 39.6,23.0 49.2,18.9" fill={leftFacetColor} />
      <polygon points="50.8,7.5 60.4,11.6 60.4,23.0 50.8,18.9" fill={rightFacetColor} />

      {/* 2. MIDDLE COLUMNS (4 facets) */}
      {/* Center Columns */}
      <polygon points="49.2,20.6 43.8,22.9 43.8,46.8 49.2,44.5" fill={leftFacetColor} />
      <polygon points="50.8,20.6 56.2,22.9 56.2,46.8 50.8,44.5" fill={rightFacetColor} />
      {/* Side Columns */}
      <polygon points="42.2,28.0 35.8,30.8 35.8,50.3 42.2,47.5" fill={leftFacetColor} />
      <polygon points="57.8,28.0 64.2,30.8 64.2,50.3 57.8,47.5" fill={rightFacetColor} />

      {/* 3. BASE TIERS (6 facets) */}
      {/* Tier 1 (Upper Base) */}
      <polygon points="49.2,46.3 28.5,55.2 27.7,64.0 49.2,54.8" fill={leftFacetColor} />
      <polygon points="50.8,46.3 71.5,55.2 72.3,64.0 50.8,54.8" fill={rightFacetColor} />

      {/* Tier 2 (Middle Base) */}
      <polygon points="49.2,56.6 27.5,65.9 26.8,74.8 49.2,65.2" fill={leftFacetColor} />
      <polygon points="50.8,56.6 72.5,65.9 73.2,74.8 50.8,65.2" fill={rightFacetColor} />

      {/* Tier 3 (Lower Base with flat horizontal bottom) */}
      <polygon points="49.2,67.0 26.6,76.7 26.0,88.0 49.2,88.0" fill={leftFacetColor} />
      <polygon points="50.8,67.0 73.4,76.7 74.0,88.0 50.8,88.0" fill={rightFacetColor} />
    </svg>
  );

  if (effectiveLayout === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{TowerIcon}</div>;
  }

  if (effectiveLayout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {TowerIcon}
        <div className="mt-2.5 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider uppercase font-sans ${sizeClasses.title} ${textColor}`}
              style={{ letterSpacing: '0.12em' }}
            >
              TORRESUL
            </span>
          </div>

          {/* Underline separator */}
          <div
            className={`w-full max-w-[140px] h-[2px] my-1 rounded-full ${
              isSilver
                ? 'bg-gradient-to-r from-transparent via-zinc-400 to-transparent'
                : 'bg-gradient-to-r from-transparent via-red-600 to-transparent'
            }`}
          />

          <span
            className={`font-medium tracking-[0.25em] uppercase text-center ${sizeClasses.sub} ${subTextColor}`}
          >
            I m o b i l i á r i a
          </span>

          {showCreci && (
            <span
              className={`text-[10px] font-semibold tracking-wider mt-1 ${creciColor}`}
            >
              CRECI: 4218 J
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`inline-flex items-center ${sizeClasses.gap} ${className}`}>
      {TowerIcon}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-black tracking-wider uppercase font-sans ${sizeClasses.title} ${textColor}`}
            style={{ letterSpacing: '0.1em' }}
          >
            TORRESUL
          </span>
          {showCreci && (
            <span className={`text-[10px] font-bold tracking-tight hidden sm:inline ${creciColor}`}>
              CRECI: 4218 J
            </span>
          )}
        </div>

        {/* Torresul signature red dividing line */}
        <div
          className="w-full h-[1.5px] my-1 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-transparent"
        />

        <div className="flex items-center justify-between">
          <span
            className={`font-medium tracking-[0.22em] uppercase text-[10px] sm:text-[11px] ${subTextColor}`}
          >
            Imobiliária
          </span>
        </div>
      </div>
    </div>
  );
};

export const TorreSulLogo = TorresulLogo;
