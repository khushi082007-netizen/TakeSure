/** TakeSure mark: a shield holding a saffron capsule and an emerald leaf that together form a tick.
 *  Same artwork as the deck, poster and mascot sheet (logo concept B). */
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" aria-hidden>
      <rect x="0" y="0" width="400" height="400" rx="88" fill="#0b2a22" />
      <g transform="translate(200 200) scale(.78) translate(-200 -200)">
        <path d="M200 30 L336 78 V188 C336 282 272 344 200 372 C128 344 64 282 64 188 V78 Z" fill="#0f5a43" />
        <path d="M200 56 L312 96 V188 C312 268 258 320 200 346 C142 320 88 268 88 188 V96 Z" fill="none" stroke="#3dd598" strokeWidth="6" opacity=".35" />
        <path d="M118 206 L176 264" stroke="#f4a300" strokeWidth="46" strokeLinecap="round" />
        <path d="M126 214 L150 238" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity=".45" />
        <path d="M176 268 Q212.1 157.6 302 116 Q266.0 226.4 176 268 Z" fill="#3dd598" />
        <path d="M186.1 255.8 L289.4 131.2" stroke="#0f5a43" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M213.9 222.2 L250.6 218.0 M213.9 222.2 L204.4 189.9 M239.0 192.0 L264.0 189.0 M239.0 192.0 L232.5 169.9 M264.2 161.7 L278.7 160.0 M264.2 161.7 L260.4 148.9" stroke="#0f5a43" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      </g>
    </svg>
  );
}
