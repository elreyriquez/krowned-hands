type Props = { className?: string; title?: string };

/**
 * Minimal hands-holding-crown mark. Intentionally simple/abstract so
 * the final logo file from the client can drop in without redesigning sections.
 * Replace by swapping <BrandMark /> for an <Image /> pointing at /public/brand/logo.svg.
 */
export function BrandMark({ className, title = "Krowned Hands" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-label={title}
      role="img"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="kh-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d7a25a" />
          <stop offset="100%" stopColor="#8f6a33" />
        </linearGradient>
      </defs>
      {/* Crown */}
      <path
        d="M16 22 L22 14 L28 22 L32 12 L36 22 L42 14 L48 22 L46 28 H18 Z"
        fill="url(#kh-gold)"
      />
      <circle cx="22" cy="14" r="1.8" fill="url(#kh-gold)" />
      <circle cx="32" cy="12" r="1.8" fill="url(#kh-gold)" />
      <circle cx="42" cy="14" r="1.8" fill="url(#kh-gold)" />
      {/* Hands (abstract bowl) */}
      <path
        d="M10 34 C 14 46, 24 52, 32 52 C 40 52, 50 46, 54 34 L 50 34 C 46 42, 40 46, 32 46 C 24 46, 18 42, 14 34 Z"
        fill="currentColor"
      />
      <path
        d="M22 34 C 24 40, 28 42, 32 42 C 36 42, 40 40, 42 34"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.35"
      />
    </svg>
  );
}
