import React from 'react';

interface KumbhSetuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'full' | 'emblem';
}

export const KumbhSetuLogo: React.FC<KumbhSetuLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { emblem: 'w-7 h-7', text: 'text-base' },
    md: { emblem: 'w-10 h-10', text: 'text-xl' },
    lg: { emblem: 'w-14 h-14', text: 'text-2xl' },
    xl: { emblem: 'w-20 h-20', text: 'text-3xl' },
  };

  const { emblem: emblemSize, text: textSize } = sizeMap[size];

  // SVG emblem rendering the exact uploaded logo
  const EmblemSvg = (
    <svg
      viewBox="0 0 350 350"
      className={`${emblemSize} flex-shrink-0 drop-shadow-sm`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoSunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fbb72c" />
          <stop offset="40%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#ea580c" />
        </linearGradient>

        <linearGradient id="logoRiverDeep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f3261" />
          <stop offset="100%" stop-color="#14427b" />
        </linearGradient>

        <clipPath id="logoCircleClip">
          <circle cx="175" cy="175" r="170" />
        </clipPath>
      </defs>

      <g clipPath="url(#logoCircleClip)">
        {/* Golden / Saffron Sun Background */}
        <circle cx="175" cy="175" r="170" fill="url(#logoSunGrad)" />

        {/* Flying Birds in Sky */}
        <g fill="#0f3261">
          <path d="M 230 115 Q 242 109 254 116 Q 266 109 278 115 Q 264 120 254 117 Q 244 120 230 115 Z" />
          <path d="M 252 133 Q 262 128 272 134 Q 282 128 292 133 Q 280 137 272 135 Q 264 137 252 133 Z" />
        </g>

        {/* Saffron Flag fluttering from Pinnacle */}
        <rect x="173" y="10" width="4" height="60" fill="#0f3261" />
        <path d="M 177 14 Q 200 24 230 28 Q 205 44 177 41 Z" fill="#f37021" />

        {/* Temple Dome Finial & Dome Silhouette */}
        <path d="M 170 70 L 175 50 L 180 70 Z" fill="#0f3261" />
        <circle cx="175" cy="71" r="6" fill="#0f3261" />
        <circle cx="175" cy="81" r="9" fill="#0f3261" />
        <path d="M 140 145 C 140 100 157 87 175 87 C 193 87 210 100 210 145 Z" fill="#0f3261" />
        <rect x="130" y="141" width="90" height="12" rx="4" fill="#0f3261" />
        <path d="M 120 163 L 130 153 L 220 153 L 230 163 Z" fill="#0f3261" />

        {/* Mini Side Spires */}
        <path d="M 123 153 C 123 130 130 125 135 125 C 140 125 143 133 143 153 Z" fill="#0f3261" />
        <path d="M 207 153 C 207 133 210 125 215 125 C 220 125 227 130 227 153 Z" fill="#0f3261" />

        {/* Devotees / Pilgrims walking the bridge */}
        <g fill="#0f3261">
          <circle cx="25" cy="190" r="10" />
          <circle cx="41" cy="179" r="11" />
          <circle cx="59" cy="167" r="12" />
          <circle cx="79" cy="155" r="13" />
          <circle cx="101" cy="145" r="14" />
          <circle cx="249" cy="145" r="14" />
          <circle cx="271" cy="155" r="13" />
          <circle cx="291" cy="167" r="12" />
          <circle cx="309" cy="179" r="11" />
          <circle cx="325" cy="190" r="10" />
        </g>

        {/* Grand Arched Bridge */}
        <path d="M -5 235 Q 175 140 355 235 L 355 285 Q 175 205 -5 285 Z" fill="#0f3261" />
        {/* White Central Arch Opening */}
        <path d="M 110 285 C 110 185 240 185 240 285 Q 175 240 110 285 Z" fill="#ffffff" />
        {/* Bridge Columns */}
        <rect x="95" y="205" width="18" height="80" fill="#0f3261" />
        <rect x="135" y="185" width="14" height="100" fill="#0f3261" />
        <rect x="201" y="185" width="14" height="100" fill="#0f3261" />
        <rect x="237" y="205" width="18" height="80" fill="#0f3261" />

        {/* Sacred River Currents (Triveni Sangam) */}
        <path d="M -5 245 Q 175 185 355 245 L 355 375 Q 175 375 -5 375 Z" fill="url(#logoRiverDeep)" />
        <path d="M 175 235 C 145 255 155 280 125 295 C 85 315 55 305 15 335 C 75 375 195 385 335 345 C 305 300 225 305 210 280 C 200 260 215 250 175 235 Z" fill="#184f8d" />
        <path d="M 173 238 C 150 255 160 280 130 295 C 95 312 60 307 30 337 C 43 341 70 330 115 317 C 150 307 147 285 170 270 C 190 257 187 247 173 238 Z" fill="#ffffff" />
        <path d="M 50 355 C 115 310 195 330 315 320 C 285 335 205 345 105 370 C 75 367 60 361 50 355 Z" fill="#2d77bc" />
        <path d="M 85 340 Q 185 305 285 325 Q 195 325 85 340 Z" fill="#ffffff" opacity="0.9" />
      </g>
    </svg>
  );

  if (variant === 'emblem' || !showText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {EmblemSvg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {EmblemSvg}
      <div className={`font-black tracking-tight ${textSize} leading-none select-none flex items-baseline`}>
        <span className="text-[#0a2e5c] font-black">Kumbh</span>
        <span className="text-[#f37021] font-black">Setu</span>
      </div>
    </div>
  );
};
