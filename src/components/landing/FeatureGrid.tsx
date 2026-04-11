const FEATURES = [
  {
    title: 'Preisbewertung',
    desc: 'Marktvergleich, Bodenrichtwert, Preis pro m² — ist der Preis fair?',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    title: 'Gesamtkosten-Rechner',
    desc: 'Kaufnebenkosten, Grunderwerbsteuer, Notar, Makler — alle Kosten auf einen Blick.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    title: 'Energie-Analyse',
    desc: 'Effizienzklasse, Heizkosten, Sanierungsoptionen und verfügbare Fördermittel.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    title: 'Standortanalyse',
    desc: 'ÖPNV, Schulen, Ärzte, Einkauf, Demografie, Wirtschaft — mit Score von 1–10.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    title: 'Risikobewertung',
    desc: 'Versteckte Mängel, Red Flags im Inserat, Hochwasser, Lärm — was Sie wissen müssen.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: 'Finanzierungs-Check',
    desc: '3 Szenarien, Stresstest, Kaufen vs. Mieten Vergleich über 20 Jahre.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

export default function FeatureGrid() {
  return (
    <section className="py-10">
      <h2 className="font-display text-2xl font-medium text-green text-center mb-2">
        Was Sie bekommen
      </h2>
      <p className="text-ink-light text-sm text-center mb-8">
        Jede Analyse umfasst diese 6 Bereiche
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-ink/10 rounded-xl p-5 hover:border-green/30 transition-colors"
          >
            <div className="w-10 h-10 bg-green/10 rounded-lg flex items-center justify-center text-green mb-3">
              {f.icon}
            </div>
            <h3 className="font-display text-sm font-semibold text-ink mb-1">{f.title}</h3>
            <p className="text-xs text-ink-mid leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
