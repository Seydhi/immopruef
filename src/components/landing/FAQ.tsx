import { useState } from 'react'

export const FAQS = [
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
    a: 'Die Analyse wertet die Angaben aus dem Exposé aus und ergänzt sie um allgemein zugängliches Markt- und Standortwissen. Werte, die nicht im Exposé stehen, sind Schätzungen und werden als solche gekennzeichnet; für amtliche Daten wie Bodenrichtwerte oder Mietspiegel verweisen wir auf die jeweilige Quelle zum Selbstprüfen. ImmoPrüf liefert eine strukturierte Ersteinschätzung und ersetzt keine Immobilienbewertung durch einen Sachverständigen.',
  },
  {
    q: 'Brauche ich einen Account?',
    a: 'Nein — kein Account, keine Registrierung. Sie geben nur Ihre E-Mail-Adresse ein, damit wir Ihnen den Link zur Analyse zusenden können. Der Link ist 180 Tage gültig.',
  },
  {
    q: 'Was ist der Unterschied zwischen Quick-Check und Premium?',
    a: 'Der Quick-Check enthält die vollständige Analyse mit allen Bereichen. Der Premium Kaufentscheidungs-Report enthält zusätzlich: eine indikative Wert-Einschätzung nach drei Verfahren (angelehnt an die ImmoWertV), ein vollständiges Standort-Dossier mit Hinweisen zur Hochwasser- und Lärmlage, einen 30-Jahres-Vermögensvergleich, eine steuerliche Einordnung und eine Vor-Kauf-Checkliste.',
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
            {/* Antwort immer im DOM (FAQPage-Schema-Parität für Google) — nur visuell ein-/ausklappen */}
            <div className={`px-5 text-xs text-ink-mid leading-relaxed ${open === i ? 'pb-4 border-t border-ink/8 pt-3' : 'hidden'}`}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
