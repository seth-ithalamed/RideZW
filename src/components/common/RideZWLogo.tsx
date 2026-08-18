import React from 'react';

interface RideZWLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon-only';
  showTagline?: boolean;
  theme?: 'light' | 'dark' | 'header';
  className?: string;
}

export const RideZWLogo: React.FC<RideZWLogoProps> = ({
  size = 'md',
  showTagline = true,
  theme = 'light',
  className = ''
}) => {
  // SVG Icon Badge matching the user's official RideZW app icon with the stylized "Z" road track
  const IconBadge = () => (
    <div
      className={`relative overflow-hidden rounded-xl shadow-md shrink-0 flex items-center justify-center ${
        size === 'sm'
          ? 'w-8 h-8 rounded-lg'
          : size === 'md'
          ? 'w-10 h-10 rounded-xl'
          : size === 'lg'
          ? 'w-14 h-14 rounded-2xl'
          : size === 'xl'
          ? 'w-24 h-24 rounded-3xl'
          : 'w-9 h-9 rounded-xl'
      }`}
      style={{
        background: 'linear-gradient(145deg, #134e6f 0%, #0d3a54 60%, #082436 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(13, 58, 84, 0.35)'
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ambient Subtle Grid */}
        <g stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.2">
          <line x1="10" y1="20" x2="90" y2="20" strokeDasharray="2 3" />
          <line x1="10" y1="50" x2="90" y2="50" strokeDasharray="2 3" />
          <line x1="10" y1="80" x2="90" y2="80" strokeDasharray="2 3" />
          <line x1="20" y1="10" x2="20" y2="90" strokeDasharray="2 3" />
          <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="2 3" />
          <line x1="80" y1="10" x2="80" y2="90" strokeDasharray="2 3" />
        </g>

        {/* ============================================================== */}
        {/* PROMINENT GOLDEN "Z" ROAD TRACK                                */}
        {/* ============================================================== */}
        {/* Outer Glow / Shadow for the Z-Track */}
        <path
          d="M 22 22 L 78 22 L 22 78 L 78 78"
          stroke="#F5B82E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.25"
        />

        {/* Base Solid Golden "Z" Track */}
        <path
          d="M 22 22 L 78 22 L 22 78 L 78 78"
          stroke="#F5B82E"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Dashed Road Center-Line on the "Z" Track */}
        <path
          d="M 24 22 L 76 22 L 24 78 L 76 78"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 3"
          strokeOpacity="0.85"
        />

        {/* Network Location Nodes & Pins on the Z-Corners */}
        {/* Top Left Node */}
        <circle cx="22" cy="22" r="4" fill="#082436" stroke="#F5B82E" strokeWidth="2" />
        <circle cx="22" cy="22" r="1.8" fill="#38bdf8" />

        {/* Top Right Node */}
        <circle cx="78" cy="22" r="4" fill="#082436" stroke="#F5B82E" strokeWidth="2" />
        <circle cx="78" cy="22" r="1.8" fill="#38bdf8" />

        {/* Bottom Left Node */}
        <circle cx="22" cy="78" r="4" fill="#082436" stroke="#F5B82E" strokeWidth="2" />
        <circle cx="22" cy="78" r="1.8" fill="#38bdf8" />

        {/* Bottom Right Node */}
        <circle cx="78" cy="78" r="4" fill="#082436" stroke="#F5B82E" strokeWidth="2" />
        <circle cx="78" cy="78" r="1.8" fill="#38bdf8" />

        {/* Blue Location Map Pin over Top-Right Node */}
        <g transform="translate(73, 9) scale(0.55)">
          <path d="M6 0C2.68 0 0 2.68 0 6C0 10.5 6 16 6 16C6 16 12 10.5 12 6C12 2.68 9.32 0 6 0Z" fill="#38bdf8" />
          <circle cx="6" cy="6" r="2.2" fill="#0c4a6e" />
        </g>

        {/* ============================================================== */}
        {/* TOP-DOWN SPEED CAR MOVING ALONG THE "Z" DIAGONAL              */}
        {/* ============================================================== */}
        {/* The Z-diagonal runs from (78, 22) down-left to (22, 78) */}
        {/* Midpoint is at (50, 50), angle is -135deg (pointing down-left) or 45deg (pointing up-right) */}
        <g transform="translate(48, 52) rotate(45)">
          {/* Speed Motion Blur Trails */}
          <line x1="-12" y1="-4" x2="-12" y2="18" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
          <line x1="0" y1="6" x2="0" y2="24" stroke="#F5B82E" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
          <line x1="12" y1="-4" x2="12" y2="18" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />

          {/* Car Shadow */}
          <rect x="-8" y="-15" width="16" height="30" rx="5" fill="#04121c" opacity="0.6" transform="translate(1.5, 2)" />

          {/* Car Body (Cyan / Blue) */}
          <rect x="-8" y="-15" width="16" height="30" rx="5" fill="#38bdf8" />
          <rect x="-6.5" y="-13" width="13" height="26" rx="3.5" fill="#0284c7" />

          {/* Windshield & Windows */}
          <rect x="-5" y="-6" width="10" height="12" rx="2" fill="#e0f2fe" />
          <path d="M -5.5 -7 L 5.5 -7 L 4.5 -11 L -4.5 -11 Z" fill="#0c4a6e" />
          <path d="M -5 7 L 5 7 L 4.5 9.5 L -4.5 9.5 Z" fill="#0c4a6e" />

          {/* Headlights (Warm Golden Yellow) */}
          <circle cx="-5.5" cy="-14" r="1.3" fill="#fef08a" />
          <circle cx="5.5" cy="-14" r="1.3" fill="#fef08a" />

          {/* Taillights (Red) */}
          <rect x="-6" y="13.5" width="2.5" height="1.2" rx="0.5" fill="#ef4444" />
          <rect x="3.5" y="13.5" width="2.5" height="1.2" rx="0.5" fill="#ef4444" />
        </g>
      </svg>
    </div>
  );

  if (size === 'icon-only') {
    return <IconBadge />;
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <IconBadge />

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <span
            className={`font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            } ${
              size === 'sm'
                ? 'text-sm'
                : size === 'md'
                ? 'text-lg'
                : size === 'lg'
                ? 'text-2xl'
                : 'text-4xl'
            }`}
          >
            Ride
          </span>
          <span
            className={`font-black tracking-tight ${
              size === 'sm'
                ? 'text-sm'
                : size === 'md'
                ? 'text-lg'
                : size === 'lg'
                ? 'text-2xl'
                : 'text-4xl'
            }`}
            style={{ color: '#F5B82E' }}
          >
            ZW
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-bold tracking-wider uppercase font-mono ${
              theme === 'dark' ? 'text-blue-200/80' : 'text-slate-500'
            } ${
              size === 'sm'
                ? 'text-[7px]'
                : size === 'md'
                ? 'text-[8.5px]'
                : size === 'lg'
                ? 'text-[11px]'
                : 'text-xs'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            YOUR RIDE, ANYTIME
          </span>
        )}
      </div>
    </div>
  );
};
