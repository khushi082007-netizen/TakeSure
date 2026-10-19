export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ayur-g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="ayur-g2" x1="10" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ayur-g1)" />
      <rect x="2.5" y="2.5" width="43" height="43" rx="11.5" stroke="white" strokeOpacity="0.25" />
      {/* leaf */}
      <path d="M14 32c0-10 7-17 19-18-1 12-8 19-18 19 0 0-1-1-1-1z" fill="#052e22" fillOpacity="0.85" />
      <path d="M15 31c4-6 9-11 16-15" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" />
      {/* capsule */}
      <rect x="25" y="25" width="14" height="7" rx="3.5" transform="rotate(-40 25 25)" fill="url(#ayur-g2)" />
      <path d="M30.5 21.4l4.5 5.3" stroke="#3b2305" strokeOpacity=".5" strokeWidth="1.2" />
    </svg>
  );
}
