import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3" aria-label="CivicConnect AI home">
      <span className="clay grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none">
          <path
            d="M12 3.5 4.5 8v8L12 20.5 19.5 16V8L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block font-display text-base font-extrabold">CivicConnect AI</span>
          <span className="block text-[11px] font-semibold tracking-[0.12em] text-subtle-foreground uppercase">
            Report. Resolve. Improve.
          </span>
        </span>
      ) : null}
    </Link>
  );
}