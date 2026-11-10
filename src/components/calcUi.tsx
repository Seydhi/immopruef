// Gemeinsame UI-Bausteine für die Rechner-Seiten (Modulebene → kein Remount/Fokusverlust).

export function Field({
  label, value, onChange, suffix, min = 0, max, step = 1, sub,
}: {
  label: string; value: number; onChange: (n: number) => void; suffix: string
  min?: number; max?: number; step?: number; sub?: string
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-mid mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-full border border-ink/20 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">{suffix}</span>
      </div>
      {sub && <p className="text-[11px] text-ink-light mt-1">{sub}</p>}
    </div>
  )
}

export function Row({ label, sub, value, strong = false }: { label: string; sub?: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? '' : 'border-b border-ink/8'}`}>
      <div>
        <div className={`text-sm ${strong ? 'font-semibold text-ink' : 'text-ink-mid'}`}>{label}</div>
        {sub && <div className="text-[11px] text-ink-light">{sub}</div>}
      </div>
      <div className={`text-right tabular-nums ${strong ? 'font-display text-lg font-semibold text-green' : 'text-sm font-medium text-ink'}`}>
        {value}
      </div>
    </div>
  )
}

import { STAND_ISO, STAND_TEXT, type Quelle } from '../lib/quellen'

export interface FaqItem { question: string; answer: string }

/**
 * Sichtbarer FAQ-Abschnitt. Bekommt dieselbe Liste wie faqSchema(), damit der
 * gerenderte Text und das FAQPage-JSON-LD wortgleich sind. Immer ausgeklappt,
 * damit die Antworten im prerenderten HTML stehen und ohne Klick lesbar sind.
 */
export function FaqSection({ items, title = 'Häufige Fragen', quellen }: { items: FaqItem[]; title?: string; quellen?: Quelle[] }) {
  if (items.length === 0) return null
  return (
    <>
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink mb-3">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.question} className="bg-white border border-ink/10 rounded-lg px-4 py-3">
            <h3 className="text-sm font-medium text-ink leading-snug">{item.question}</h3>
            <p className="text-[13px] text-ink-mid leading-relaxed mt-1.5">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
    <StandQuellen quellen={quellen} />
    </>
  )
}

/**
 * Sichtbare Stand-, Verantwortlichen- und Quellenzeile. Datum, Autor und
 * Primärquellen sind die Signale, an denen Suchmaschinen und KI-Assistenten
 * die Zitierfähigkeit einer Seite festmachen.
 */
export function StandQuellen({ quellen }: { quellen?: Quelle[] }) {
  return (
    <aside aria-label="Stand und Quellen" className="mt-6 border-t border-ink/10 pt-4 text-[12px] text-ink-mid leading-relaxed">
      <p>
        Zuletzt geprüft: <time dateTime={STAND_ISO}>{STAND_TEXT}</time> · Verantwortlich:{' '}
        <a href="/ueber-uns" className="text-green hover:text-green-mid underline">Seydhan Cakmak</a>, ImmoPrüf
      </p>
      {quellen && quellen.length > 0 && (
        <p className="mt-1.5">
          Quellen und Rechtsgrundlagen:{' '}
          {quellen.map((q, i) => (
            <span key={q.url}>
              {i > 0 && ' · '}
              <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">{q.label}</a>
            </span>
          ))}
        </p>
      )}
    </aside>
  )
}
