import Image from "next/image";
import Link from "next/link";

type Props = {
  /** Header uses a compact lockup; footer slightly larger. */
  variant?: "header" | "footer";
  className?: string;
};

/**
 * Expect true PNG/WebP/SVG assets with transparency. Quick check from project root:
 * `file public/brand/logo-mark.png` — must say “PNG image” (starts with PNG magic bytes).
 * If it says “JPEG image data”, the file was saved as JPG with a `.png` name — JPEG cannot
 * carry transparency, so any black backing is baked into the pixels (not Next.js or CSS).
 */
export function BrandLogo({ variant = "header", className = "" }: Props) {
  const footer = variant === "footer";

  return (
    <Link
      href="/"
      className={`group inline-flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3 ${className}`}
      aria-label="Krowned Hands — home"
    >
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={1082}
        height={1267}
        priority={!footer}
        sizes={footer ? "160px" : "128px"}
        className={
          footer
            ? "h-16 w-auto sm:h-20"
            : "h-12 w-auto sm:h-14"
        }
      />
      <Image
        src="/brand/logo-type.png"
        alt="Krowned Hands"
        width={1738}
        height={348}
        priority={!footer}
        sizes={footer ? "min(360px, 92vw)" : "min(280px, 62vw)"}
        className={
          footer
            ? "h-10 w-auto max-w-[min(360px,92vw)] md:h-11"
            : "h-8 w-auto max-w-[min(260px,58vw)] sm:h-9 md:h-10 md:max-w-none"
        }
      />
    </Link>
  );
}
