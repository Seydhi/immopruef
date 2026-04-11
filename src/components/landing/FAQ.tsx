import { useState } from 'react'

const FAQS = [
  {
    q: 'Was analysiert ImmoPrüf genau?',
    a: 'Jede Analyse umfasst: Preisbewertung mit Marktvergleich, vollständige Kaufnebenkosten-Berechnung, Energie-Analyse mit Fördermittel-Check, Modernisierungs-Check mit Sanierungsfahrplan, Standortanalyse (ÖPNV, Schulen, Ärzte, Demografie), Risikobewertung mit Red Flags, Finanzierungs-Check mit 3 Szenarien und Stresstest, Verhandlungstipps und ein direkt nutzbares Makleranschreiben.',
  },
  {
    q: 'Welche Immobilienportale werden unterstützt?',
    a: 'Aktuell unterstützen wir ImmoScout24, Immowelt, Immonet und Kleinanzeigen. Kopieren Sie einfach den Link zum Exposé — wir erkennen das Portal automatisch.',
  },
  {
    q: 'Wie lange dauert eine Analyse?',
    a: 'Eine Analyse dauert ca. 2–3 Minuten. Sie erhalten das Ergebnis direkt auf der Seite und zusätzlich per E-Mail. Bei mehreren Immobilien läuft die Analyse nacheinander.',
  },
  {
    q: 'Wie genau sind die Ergebnisse?',
    a: 'Die Analyse basiert auf den Daten aus dem Exposé und öffentlich verfügbaren Marktdaten (Bodenrichtwerte, Mietpreisspiegel, regionale Vergleichsdaten). Werte die nicht im Exposé stehen werden als Regionsdurchschnitt gekennzeichnet. ImmoPrüf ersetzt keine professionelle Immobilienbewertung durch einen Sachverständigen.',
  },
  {
    q: 'Brauche ich einen Account?',
    a: 'Nein — kein Account, keine Registrierung. Sie geben nur Ihre E-Mail-Adresse ein, damit wir Ihnen den Link zur Analyse zusenden können. Der Link ist 60 Tage gültig.',
  },
  {
    q: 'Was ist der Unterschied zwischen Quick-Check und Premium?',
    a: 'Der Quick-Check enthält die vollständige Analyse mit allen 8 Bereichen. Der Premium Kaufentscheidungs-Report enthält zusätzlich: professionelle Wertermittlung nach 3 Verfahren, vollständiges Standort-Dossier mit Hochwasser- und Lärmkarten, 30-Jahres-Vermögensvergleich, steuerliche Analyse und eine Vor-Kauf-Checkliste.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-10">
      <h2 className="font-display text-2xl font-medium text-green text-center mb-8">
        Häufige Fragen
      </h2>
      <div className="max-w-[640px] mx-auto space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-green/3 transition-colors"
            >
              <span className="text-sm font-medium text-ink pr-4">{faq.q}</span>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className={`shrink-0 text-ink-light transition-transform ${open === i ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-xs text-ink-mid leading-relaxed border-t border-ink/8 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
