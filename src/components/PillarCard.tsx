import { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  icon: ReactNode;
};

export function PillarCard({ eyebrow, title, body, icon }: Props) {
  return (
    <article className="kh-card relative overflow-hidden group">
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl group-hover:opacity-70 transition"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--kh-ochre) 45%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[color-mix(in_srgb,var(--kh-gold)_18%,var(--kh-cream))] text-[var(--kh-brown)] border border-[var(--kh-line)]">
          {icon}
        </div>
        <p className="mt-5 text-[0.72rem] tracking-[0.24em] uppercase text-[var(--kh-gold-deep)]">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-2xl text-[var(--kh-brown)]">{title}</h3>
        <p className="mt-3 text-[var(--kh-brown-soft)] leading-relaxed">{body}</p>
      </div>
    </article>
  );
}
