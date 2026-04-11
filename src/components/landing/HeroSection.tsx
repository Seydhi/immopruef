interface HeroSectionProps {
  onCta: () => void
}

export default function HeroSection({ onCta }: HeroSectionProps) {
  return (
    <section className="text-center py-12 sm:py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-semibold text-green leading-tight mb-4">
        Soll ich diese Immobilie<br />kaufen?
      </h1>
      <p className="text-ink-mid text-base sm:text-lg font-light max-w-lg mx-auto mb-8 leading-relaxed">
        KI-gestützte Analyse in 2 Minuten. Preisbewertung, Standort, Finanzierung, Risiken — alles in einem Report.
      </p>
      <button
        onClick={onCta}
        className="bg-green text-cream px-8 py-3.5 rounded-lg font-medium text-base hover:bg-green-mid active:scale-[0.98] transition-all shadow-sm"
      >
        Jetzt Immobilie analysieren
      </button>
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ink-light">
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Ab 19 € pro Analyse
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Ergebnis per E-Mail
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Kein Account nötig
        </span>
      </div>
    </section>
  )
}
