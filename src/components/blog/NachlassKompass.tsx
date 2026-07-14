import { useState, useMemo } from 'react'
import { eur } from '../../lib/kaufnebenkosten'

// Nachlass-Kompass — Verhandlungsspielraum aus den 5 Signalen des Pillar-Artikels.
// Basiskorridor = die Marktlage-Tabelle des Artikels (0–5 / 5–10 / 10–15 %).
// Die übrigen Signale verschieben den Korridor in Prozentpunkten.

// Basiskorridor: REGIONALE Marktlage (nicht das Objekt selbst — sonst würden die
// Objektsignale unten doppelt zählen). Entspricht der Tabelle oben im Artikel.
const MARKT = [
  { key: 'verkaeufer', label: 'Angespannt — viele Interessenten', min: 0, max: 5 },
  { key: 'normal', label: 'Ausgeglichen', min: 5, max: 10 },
  { key: 'kaeufer', label: 'Entspannt — viele Angebote', min: 10, max: 15 },
]

// Objektsignale verschieben den Korridor. Bewusst konservativ gewichtet: Der
// Spielraum am unteren Rand wächst nur halb so schnell wie am oberen — ein zu
// forsches Erstgebot beendet Gespräche (siehe Taktik-Regel 4).
const STANDDAUER = [
  { key: 's1', label: 'unter 4 Wochen (normal)', bonus: 0 },
  { key: 's2', label: '1 bis 3 Monate', bonus: 0.5 },
  { key: 's3', label: '3 bis 6 Monate (Warnsignal)', bonus: 1 },
  { key: 's4', label: 'über 6 Monate (starkes Signal)', bonus: 2 },
]

const SENKUNGEN = [
  { key: 'p0', label: 'keine Preissenkung', bonus: 0 },
  { key: 'p1', label: 'eine Preissenkung', bonus: 0.5 },
  { key: 'p2', label: 'mehrere Preissenkungen', bonus: 1.5 },
]

const ENERGIE = [
  { key: 'e1', label: 'A+ / A / B — effizient', bonus: -0.5 },
  { key: 'e2', label: 'C / D — durchschnittlich', bonus: 0 },
  { key: 'e3', label: 'E / F — schwach', bonus: 0.5 },
  { key: 'e4', label: 'G / H — sehr schwach', bonus: 1 },
]

// Belegbare Sanierungsposten — Mittelwerte der Spannen aus dem Artikel (EFH).
const POSTEN = [
  { key: 'heizung', label: 'Heizung über 20 Jahre', spanne: '15.000–30.000 €', wert: 22500 },
  { key: 'dach', label: 'Dach fällig', spanne: '15.000–30.000 €', wert: 22500 },
  { key: 'fenster', label: 'Fenster komplett', spanne: '10.000–25.000 €', wert: 17500 },
  { key: 'bad', label: 'Bad veraltet', spanne: '10.000–25.000 €', wert: 17500 },
  { key: 'elektrik', label: 'Elektrik ohne FI-Schutz', spanne: '8.000–15.000 €', wert: 11500 },
]

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

// Auf Modulebene definiert — sonst sieht React bei jedem State-Change einen neuen
// Komponententyp, remountet das <select> und der Fokus geht verloren (vgl. calcUi.tsx).
function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void
  options: { key: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-mid mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export default function NachlassKompass() {
  const [preis, setPreis] = useState(400000)
  const [markt, setMarkt] = useState('normal')
  const [stand, setStand] = useState('s3')
  const [senkung, setSenkung] = useState('p1')
  const [energie, setEnergie] = useState('e3')
  const [posten, setPosten] = useState<string[]>(['heizung'])

  const r = useMemo(() => {
    const p = Number.isFinite(preis) && preis > 0 ? preis : 0
    const m = MARKT.find((x) => x.key === markt) ?? MARKT[1]
    const bStand = STANDDAUER.find((x) => x.key === stand)?.bonus ?? 0
    const bSenk = SENKUNGEN.find((x) => x.key === senkung)?.bonus ?? 0
    const bEnergie = ENERGIE.find((x) => x.key === energie)?.bonus ?? 0

    const stauSumme = POSTEN.filter((x) => posten.includes(x.key)).reduce((s, x) => s + x.wert, 0)
    const stauQuote = p > 0 ? (stauSumme / p) * 100 : 0
    const bStau = stauQuote >= 10 ? 1 : stauQuote >= 5 ? 0.5 : 0

    // Untergrenze wächst halb so schnell wie die Obergrenze: Die Signale weiten den
    // möglichen Spielraum, machen ihn aber nicht garantiert. So reproduziert das
    // Modell sowohl die Marktlage-Tabelle als auch das Rechenbeispiel des Artikels.
    const bonus = bStand + bSenk + bEnergie + bStau
    const min = clamp(Math.round(m.min + bonus / 2), 0, 20)
    const max = clamp(Math.round(m.max + bonus), min + 1, 25)

    const zielMax = p * (1 - min / 100) // wenig Nachlass -> hoher Preis
    const zielMin = p * (1 - max / 100)
    const eroeffnung = Math.max(0, zielMin - p * 0.005)
    const nkErsparnis = (p - (zielMin + zielMax) / 2) * 0.1

    return { p, m, bonus, min, max, zielMin, zielMax, eroeffnung, stauSumme, nkErsparnis }
  }, [preis, markt, stand, senkung, energie, posten])

  const toggle = (k: string) =>
    setPosten((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))

  // Bewusst div statt h3/p im Markup: .prose-immo überschreibt diese Tags mit
  // höherer Spezifität als die Tailwind-Klassen hier.
  return (
    <div className="my-8 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
      <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">
        Interaktiv
      </div>
      <div role="heading" aria-level={3} className="font-display text-xl font-semibold text-ink mb-1">
        Nachlass-Kompass
      </div>
      <div className="text-[13px] text-ink-mid leading-relaxed mb-4">
        Die fünf Signale von oben in einen konkreten Verhandlungskorridor übersetzt. Kein Preisversprechen —
        eine Orientierung auf Basis der Erfahrungswerte aus diesem Artikel.
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Angebotspreis</label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={5000}
              value={Number.isFinite(preis) ? preis : ''}
              onChange={(e) => setPreis(Math.max(0, Math.round(Number(e.target.value))))}
              className="w-full border border-ink/20 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">€</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Marktlage in der Region" value={markt} onChange={setMarkt} options={MARKT} />
          <Select label="Wie lange online?" value={stand} onChange={setStand} options={STANDDAUER} />
          <Select label="Preishistorie" value={senkung} onChange={setSenkung} options={SENKUNGEN} />
          <Select label="Energieklasse" value={energie} onChange={setEnergie} options={ENERGIE} />
        </div>

        <div>
          <div className="text-[13px] font-medium text-ink-mid mb-2">Belegbarer Sanierungsbedarf</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {POSTEN.map((x) => (
              <label
                key={x.key}
                className="flex items-start gap-2 text-[13px] text-ink-mid cursor-pointer select-none py-1"
              >
                <input
                  type="checkbox"
                  checked={posten.includes(x.key)}
                  onChange={() => toggle(x.key)}
                  className="w-3.5 h-3.5 mt-0.5 accent-green cursor-pointer shrink-0"
                />
                <span>
                  {x.label} <span className="text-ink-light">({x.spanne})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="mt-5 bg-green/5 rounded-lg p-4">
        <div className="flex items-baseline justify-between gap-4 mb-1">
          <div className="text-sm font-semibold text-green">Realistischer Verhandlungsspielraum</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums whitespace-nowrap">
            {r.min}–{r.max} %
          </div>
        </div>
        <div className="text-[12px] text-ink-mid mb-3">
          Basis {r.m.min}–{r.m.max} % aus der regionalen Marktlage
          {r.bonus !== 0 && (
            <>, {r.bonus > 0 ? 'erweitert' : 'verengt'} um {Math.abs(r.bonus).toLocaleString('de-DE')} Punkte durch die Objektsignale</>
          )}
        </div>

        <div className="space-y-1.5 border-t border-green/15 pt-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[13px] text-ink-mid">Zielkorridor Kaufpreis</span>
            <span className="text-sm font-semibold text-ink tabular-nums whitespace-nowrap">
              {eur(r.zielMin)} – {eur(r.zielMax)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[13px] text-ink-mid">Begründetes Eröffnungsgebot</span>
            <span className="text-sm font-medium text-ink tabular-nums whitespace-nowrap">{eur(r.eroeffnung)}</span>
          </div>
          {r.stauSumme > 0 && (
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] text-ink-mid">Belegbare Sanierungsposten</span>
              <span className="text-sm font-medium text-ink tabular-nums whitespace-nowrap">≈ {eur(r.stauSumme)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[13px] text-ink-mid">Zusätzlich gesparte Kaufnebenkosten</span>
            <span className="text-sm font-medium text-ink tabular-nums whitespace-nowrap">≈ {eur(r.nkErsparnis)}</span>
          </div>
        </div>

        <div className="text-[11px] text-ink-light mt-3 leading-snug">
          Die Kaufnebenkosten sinken mit, weil Grunderwerbsteuer und Provision prozentual vom Kaufpreis berechnet
          werden (hier mit 10 % gerechnet). Der Korridor ersetzt keine Wertermittlung: Bestimmen Sie den fairen Wert
          immer zuerst über Quadratmeterpreis-Vergleich und Bodenrichtwert — der Kompass sagt nur, wie viel Spielraum
          die Situation hergibt.
        </div>
      </div>
    </div>
  )
}
