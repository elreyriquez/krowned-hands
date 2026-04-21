"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Animation = "from-left" | "from-right" | "fade-up" | "fade";

type Props = {
  /** Type of motion applied when the element enters the viewport. */
  animation?: Animation;
  /** Delay in ms (used for staggering sibling reveals). */
  delayMs?: number;
  /** Intersection ratio required before animating. */
  threshold?: number;
  /** Top/bottom rootMargin so animations fire slightly before the section is in view. */
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Wraps content in a div that animates into view using IntersectionObserver.
 * Relies on CSS in globals.css (see `[data-kh-reveal]`).
 */
export function Reveal({
  animation = "fade-up",
  delayMs = 0,
  threshold = 0.18,
  rootMargin = "0px 0px -10% 0px",
  className = "",
  style,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(delayMs ? { transitionDelay: `${delayMs}ms` } : null),
  };

  return (
    <div
      ref={ref}
      data-kh-reveal={animation}
      data-visible={visible ? "" : undefined}
      className={className}
      style={mergedStyle}
    >
      {children}
    </div>
  );
}
