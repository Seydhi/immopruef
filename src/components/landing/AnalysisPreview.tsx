export default function AnalysisPreview() {
  return (
    <section className="py-10">
      <h2 className="font-display text-2xl font-medium text-green text-center mb-2">
        So sieht Ihre Analyse aus
      </h2>
      <p className="text-ink-light text-sm text-center mb-8">
        Beispiel einer Quick-Check Analyse
      </p>

      <div className="space-y-4 max-w-[700px] mx-auto">
        {/* Mock: Scores */}
        <div className="bg-white border border-ink/10 rounded-xl p-5">
          <div className="text-xs text-ink-light uppercase tracking-wider mb-3 font-medium">Bewertung auf einen Blick</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Gesamt', score: 7.2 },
              { label: 'Lage', score: 8 },
              { label: 'Preis', score: 6 },
              { label: 'Zustand', score: 7 },
              { label: 'Energie', score: 5 },
              { label: 'Finanz.', score: 8 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`font-display text-xl font-semibold ${s.score >= 7 ? 'text-emerald-600' : s.score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                  {s.score}
                </div>
                <div className="text-[10px] text-ink-light">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock: Objektdaten */}
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
          <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8 flex items-center gap-2">
            <div className="w-5 h-5 bg-green rounded flex items-center justify-center">
              <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            </div>
            Objektdaten
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {[
                ['Adresse', 'Musterstraße 42, 10115 Berlin'],
                ['Typ', 'Eigentumswohnung'],
                ['Kaufpreis', '389.000 €'],
                ['Wohnfläche', '78,5 m²'],
                ['Zimmer', '3'],
                ['Baujahr', '1962'],
                ['Energieeffizienz', 'D (142 kWh/m²a)'],
              ].map(([k, v], i) => (
                <tr key={k} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <td className="px-4 py-2 text-ink-light text-xs font-medium w-[40%]">{k}</td>
                  <td className="px-4 py-2 font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mock: Gesamtkosten */}
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
          <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8 flex items-center gap-2">
            <div className="w-5 h-5 bg-green rounded flex items-center justify-center">
              <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            Kaufnebenkosten
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {[
                ['Grunderwerbsteuer (6,0%)', '23.340 €'],
                ['Notar (1,5%)', '5.835 €'],
                ['Grundbuch (0,5%)', '1.945 €'],
                ['Makler (3,57%)', '13.887 €'],
              ].map(([k, v], i) => (
                <tr key={k} className={`border-b border-ink/8 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <td className="px-4 py-2 text-ink-light text-xs font-medium w-[55%]">{k}</td>
                  <td className="px-4 py-2 font-medium text-right">{v}</td>
                </tr>
              ))}
              <tr className="bg-green/5 font-medium">
                <td className="px-4 py-2.5 text-green text-xs">Nebenkosten Gesamt</td>
                <td className="px-4 py-2.5 text-green font-display text-base text-right">45.007 €</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mock: Gesamtinvestition */}
        <div className="bg-green text-cream rounded-xl px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-cream/70 text-[10px] tracking-wider uppercase mb-0.5">Gesamtinvestition</div>
            <div className="text-xs text-cream/60">Kaufpreis + Nebenkosten + Sanierung</div>
          </div>
          <div className="font-display text-2xl font-medium">459.007 €</div>
        </div>

        {/* Mock: Standort */}
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
          <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8 flex items-center gap-2">
            <div className="w-5 h-5 bg-green rounded flex items-center justify-center">
              <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            Standortanalyse — 8.0 / 10
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {[
                ['ÖPNV-Anbindung', '9/10', 'U-Bahn 200m, Bus 100m'],
                ['Schulen & Kitas', '8/10', '3 Grundschulen im Umkreis'],
                ['Einkaufsmöglichkeiten', '9/10', 'Supermarkt 150m, Wochenmarkt'],
                ['Ärztliche Versorgung', '7/10', 'Hausarzt 300m, Krankenhaus 2km'],
                ['Lärm', '6/10', 'Straßenlärm tags 55 dB'],
              ].map(([k, score, detail], i) => (
                <tr key={k} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <td className="px-4 py-2 text-ink-light text-xs font-medium w-[30%]">{k}</td>
                  <td className="px-4 py-2 text-center w-[15%]">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      parseInt(score as string) >= 8 ? 'bg-emerald-50 text-emerald-700' :
                      parseInt(score as string) >= 6 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>{score}</span>
                  </td>
                  <td className="px-4 py-2 text-xs text-ink-mid">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fade-out overlay */}
        <div className="relative h-16 -mt-16 bg-gradient-to-t from-cream to-transparent pointer-events-none rounded-b-xl" />
        <p className="text-center text-xs text-ink-light -mt-4">
          + Energie-Analyse, Modernisierungs-Check, Risikobewertung, Finanzierung, Verhandlungstipps, Makleranschreiben
        </p>
      </div>
    </section>
  )
}
