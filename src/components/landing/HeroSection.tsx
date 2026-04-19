interface HeroSectionProps {
  onCta: () => void
}

export default function HeroSection({ onCta }: HeroSectionProps) {
  return (
    <section className="text-center py-12 sm:py-16 px-4">
      <h1 lang="de" className="font-display text-[1.625rem] sm:text-4xl md:text-5xl font-semibold text-green leading-tight mb-4 max-w-3xl mx-auto hyphens-auto break-words [word-break:break-word]">
        Immobilien&shy;angebote besser einordnen
        <span className="block text-xl sm:text-3xl md:text-4xl mt-1 font-medium">
          — vor Besichtigung, Verhandlung und Kauf
        </span>
      </h1>
      <p className="text-ink-mid text-base sm:text-lg font-light max-w-2xl mx-auto mb-4 leading-relaxed">
        ImmoPrüf erstellt eine strukturierte Ersteinschätzung zu Preisniveau, Standort, Risiken, offenen Fragen und möglichen Folgekosten.
      </p>
      <p className="text-ink-light text-sm sm:text-base font-light max-w-xl mx-auto mb-8 leading-relaxed">
        Keine Werbung, keine Verkaufsprosa — sondern eine nachvollziehbare Einordnung mit klar markierten Schätzwerten und Prüfhinweisen.
      </p>
      <button
        onClick={onCta}
        className="bg-green text-cream px-8 py-3.5 rounded-lg font-medium text-base hover:bg-green-mid active:scale-[0.98] transition-all shadow-sm"
      >
        Angebotslink einfügen
      </button>
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ink-light">
        <span className="flex items-center gap-1.5">
          <svg aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Ab 19 € pro Analyse
        </span>
        <span className="flex items-center gap-1.5">
          <svg aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Ergebnis per E-Mail
        </span>
        <span className="flex items-center gap-1.5">
          <svg aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Kein Account nötig
        </span>
      </div>
    </section>
  )
}
