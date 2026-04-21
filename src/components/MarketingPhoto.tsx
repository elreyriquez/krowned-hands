import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Tailwind aspect ratio class, e.g. `aspect-[3/4]` */
  aspectClass: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Full-bleed crop inside a rounded frame (matches previous ImagePlaceholder layout slots).
 */
export function MarketingPhoto({
  src,
  alt,
  aspectClass,
  sizes,
  priority,
  className = "",
}: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/[0.06] ${aspectClass} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
