import { useState, type ReactNode } from 'react'
import type { AnalysisResult as AnalysisResultType, AnalysisOptions } from '../lib/types'
import PremiumReport from './PremiumReport'

// Helper: detect regional average values and render with warning badge
const REGION_HINT = 'Durchschnitt der Region'
function ValueCell({ children }: { children: ReactNode }) {
  if (typeof children !== 'string') return <>{children}</>
  if (!children.includes(REGION_HINT)) return <>{children}</>

  // Split the value from the warning text
  const idx = children.indexOf('(')
  const value = idx > 0 ? children.slice(0, idx).trim() : children
  return (
    <span>
      {value}
      <span className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-600 font-medium whitespace-nowrap">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
        Nicht im Exposé — Regionsdurchschnitt
      </span>
    </span>
  )
}

interface AnalysisResultProps {
  result: AnalysisResultType
  options: AnalysisOptions
  url: string
  showBackButton?: boolean
  onBack?: () => void
}

export default function AnalysisResult({ result, options, url, showBackButton = true, onBack }: AnalysisResultProps) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const copyLetter = () => {
    navigator.clipboard.writeText(result.makleranschreiben).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="pb-8">
      {showBackButton && (
        <button
          onClick={onBack || (() => { window.location.href = '/' })}
          className="mb-6 text-sm text-green hover:text-green-mid transition-colors flex items-center gap-1"
        >
          ← Neue Analyse starten
        </button>
      )}

      {/* URL */}
      <div className="flex items-center gap-2 mb-3 text-[11px] text-ink-light">
        <span className="shrink-0">Analyse für:</span>
        <a
          href={url.split('#')[0].split('?')[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green hover:text-green-mid underline underline-offset-2 truncate"
        >
          {url.split('#')[0].split('?')[0]}
        </a>
        <a
          href={url.split('#')[0].split('?')[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[10px] bg-green/10 text-green px-2 py-0.5 rounded font-medium hover:bg-green/20 transition-colors"
        >
          Exposé öffnen ↗
        </a>
      </div>

      {/* Zusammenfassung */}
      {result.zusammenfassung && (
        <div className="bg-green-light border border-green/18 rounded-xl px-5 py-4 mb-5 text-sm text-green leading-relaxed">
          <span className="font-display font-medium">Fazit:</span> {result.zusammenfassung}
        </div>
      )}

      {/* ════ Scores ════ */}
      {result.scores && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {([
            ['gesamtbewertung', 'Gesamt'],
            ['lage', 'Lage'],
            ['preis_leistung', 'Preis'],
            ['zustand', 'Zustand'],
            ['energie', 'Energie'],
            ['finanzierung', 'Finanz.'],
          ] as const).map(([key, label]) => {
            const rawVal = result.scores[key]
            const val = typeof rawVal === 'number' && rawVal >= 1 && rawVal <= 10 ? rawVal : null
            const color = val === null ? 'text-ink-light' : val >= 7 ? 'text-emerald-600' : val >= 5 ? 'text-amber-600' : 'text-red-500'
            return (
              <div key={key} className="bg-white border border-ink/10 rounded-xl p-3 text-center">
                <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-0.5">{label}</div>
                <div className={`font-display text-xl font-medium ${color}`}>
                  {val !== null ? val : '–'}
                  <span className="text-xs text-ink-light">/10</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════ 1. Objektdaten ════ */}
      {result.objektdaten?.length > 0 && (
        <>
          <SectionHeader icon={<HouseIcon />} title="Objektdaten" />
          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-[13.5px]">
              <tbody>
                {result.objektdaten.map((row, i) => {
                  const isPrice = row.merkmal?.toLowerCase().includes('preis') || row.merkmal?.toLowerCase().includes('kaufpreis')
                  return (
                    <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                      <td className="px-3.5 py-2 text-ink-light text-xs font-medium tracking-wide w-[38%] whitespace-nowrap">{row.merkmal}</td>
                      <td className="px-3.5 py-2">
                        {isPrice ? <span className="font-display text-lg text-green font-medium">{row.wert}</span> : <ValueCell>{row.wert}</ValueCell>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ════ 2. Preisbewertung ════ */}
      {result.preisbewertung && (
        <>
          <SectionHeader icon={<TagIcon />} title="Preisbewertung" />
          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden mb-5">
            {/* Ampel-Banner */}
            <div className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              result.preisbewertung.ampel === 'guenstig' ? 'bg-emerald-50 text-emerald-700' :
              result.preisbewertung.ampel === 'teuer' ? 'bg-red-50 text-red-700' :
              'bg-amber-50 text-amber-700'
            }`}>
              <span className="text-lg">{
                result.preisbewertung.ampel === 'guenstig' ? '✅' :
                result.preisbewertung.ampel === 'teuer' ? '🚨' : '⚠️'
              }</span>
              {result.preisbewertung.ampel === 'guenstig' && 'Preis liegt unter dem Marktdurchschnitt'}
              {result.preisbewertung.ampel === 'fair' && 'Preis liegt im Marktdurchschnitt'}
              {result.preisbewertung.ampel === 'teuer' && 'Preis liegt über dem Marktdurchschnitt'}
            </div>
            <table className="w-full text-[13.5px]">
              <tbody>
                <KVRow label="Preis pro m²" value={result.preisbewertung.preisProQm} i={0} />
                <KVRow label="Regionaler Durchschnitt" value={result.preisbewertung.regionalerDurchschnitt} i={1} />
                <KVRow label="Abweichung" value={result.preisbewertung.abweichung} i={2} highlight />
                <KVRow label="Kaufpreis-Miete-Verhältnis" value={result.preisbewertung.kaufpreismieteVerhaeltnis} i={3} />
                <KVRow label="Einschätzung" value={result.preisbewertung.kaufpreismieteEinschaetzung} i={4} />
                <KVRow label="Bodenrichtwert" value={result.preisbewertung.bodenrichtwert} i={5} />
                <KVRow label="Preisentwicklung (5 J.)" value={result.preisbewertung.preisentwicklung5Jahre} i={6} />
                <KVRow label="Prognose (5 J.)" value={result.preisbewertung.preisprognose5Jahre} i={7} />
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ════ 3. Gesamtkosten ════ */}
      {result.gesamtkosten && (
        <>
          <SectionHeader icon={<EuroIcon />} title="Gesamtkosten-Rechner" />
          <div className="space-y-3 mb-5">
            {/* Kaufnebenkosten */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">
                Kaufnebenkosten
              </div>
              <table className="w-full text-[13.5px]">
                <tbody>
                  <KVRow label={`Grunderwerbsteuer (${result.gesamtkosten.kaufnebenkosten.grunderwerbsteuer.satz})`} value={result.gesamtkosten.kaufnebenkosten.grunderwerbsteuer.betrag} i={0} />
                  <KVRow label={`Notar (${result.gesamtkosten.kaufnebenkosten.notar.satz})`} value={result.gesamtkosten.kaufnebenkosten.notar.betrag} i={1} />
                  <KVRow label={`Grundbuch (${result.gesamtkosten.kaufnebenkosten.grundbuch.satz})`} value={result.gesamtkosten.kaufnebenkosten.grundbuch.betrag} i={2} />
                  <KVRow label={`Makler (${result.gesamtkosten.kaufnebenkosten.makler.satz})`} value={result.gesamtkosten.kaufnebenkosten.makler.betrag} i={3} />
                  <tr className="bg-green/5 font-medium">
                    <td className="px-3.5 py-2.5 text-green text-xs tracking-wide">Nebenkosten Gesamt</td>
                    <td className="px-3.5 py-2.5 text-green font-display text-base">{result.gesamtkosten.kaufnebenkosten.gesamt}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Gesamtinvestition */}
            <div className="bg-green text-cream rounded-xl px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-cream/70 text-[10px] tracking-wider uppercase mb-0.5">Gesamtinvestition</div>
                <div className="text-xs text-cream/60">Kaufpreis + Nebenkosten + Sanierung</div>
              </div>
              <div className="font-display text-2xl font-medium">{result.gesamtkosten.gesamtinvestition}</div>
            </div>

            {/* Laufende Kosten */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">
                Laufende monatliche Kosten
              </div>
              <table className="w-full text-[13.5px]">
                <tbody>
                  {result.gesamtkosten.laufendeKosten.map((lk, i) => (
                    <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                      <td className="px-3.5 py-2 text-ink-light text-xs font-medium tracking-wide w-[45%]">{lk.position}</td>
                      <td className="px-3.5 py-2 text-right w-[25%]"><ValueCell>{lk.betragMonat}</ValueCell></td>
                      <td className="px-3.5 py-2 text-right text-ink-light text-xs"><ValueCell>{lk.betragJahr}</ValueCell>/J.</td>
                    </tr>
                  ))}
                  <tr className="bg-green/5 font-medium">
                    <td className="px-3.5 py-2.5 text-green text-xs tracking-wide">Gesamt</td>
                    <td className="px-3.5 py-2.5 text-green text-right font-display">{result.gesamtkosten.laufendeKostenGesamt.monat}</td>
                    <td className="px-3.5 py-2.5 text-green text-right text-xs">{result.gesamtkosten.laufendeKostenGesamt.jahr}/J.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════ 4. Energieanalyse ════ */}
      {result.energieanalyse && (
        <>
          <SectionHeader icon={<BoltIcon />} title="Energie-Analyse" />
          <div className="space-y-3 mb-5">
            {/* Effizienz-Badge */}
            <div className="bg-white border border-ink/10 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-3">
                <EnergyBadge klasse={result.energieanalyse.effizienzklasse} />
                <div>
                  <div className="text-sm font-medium">{result.energieanalyse.endenergiebedarf}</div>
                  <div className="text-xs text-ink-light">{result.energieanalyse.heizungstyp} · ~{result.energieanalyse.heizungsalter}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-medium text-amber-600">{result.energieanalyse.heizkostenJahr}/Jahr</div>
                  <div className="text-xs text-ink-light">Geschätzte Heizkosten</div>
                </div>
              </div>

              {/* GEG-Hinweis */}
              {result.energieanalyse.gegPflicht.besteht && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 text-xs text-amber-800">
                  <span className="font-medium">⚠️ GEG-Pflicht:</span> {result.energieanalyse.gegPflicht.details}
                </div>
              )}
            </div>

            {/* Sanierungsoptionen */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">
                Sanierungsoptionen & Förderung
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-ink/10 text-ink-light">
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Maßnahme</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Kosten</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Ersparnis</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Förderung</th>
                  </tr>
                </thead>
                <tbody>
                  {result.energieanalyse.sanierungsoptionen.map((opt, i) => (
                    <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                      <td className="px-3 py-2 font-medium text-ink">{opt.massnahme}</td>
                      <td className="px-3 py-2 text-ink-mid">{opt.kosten}</td>
                      <td className="px-3 py-2 text-emerald-600">{opt.ersparnis}</td>
                      <td className="px-3 py-2 text-ink-mid text-xs">{opt.foerderung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 font-medium">
                💰 {result.energieanalyse.foerdermittelGesamt}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════ 5. Modernisierungs-Check ════ */}
      {result.modernisierung && (
        <>
          <SectionHeader icon={<WrenchIcon />} title="Modernisierungs-Check" />
          <div className="space-y-3 mb-5">
            {/* Sanierungsstau Total */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-amber-800">
                <span className="font-medium">Geschätzter Sanierungsstau:</span>
              </div>
              <div className="font-display text-xl text-amber-700 font-medium">{result.modernisierung.sanierungsstauGesamt}</div>
            </div>

            {/* Items */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-ink/10 text-ink-light">
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Bauteil</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Alter</th>
                    <th className="px-3 py-2 text-center text-[10px] font-medium tracking-wider uppercase">Zustand</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Kosten</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Fällig in</th>
                  </tr>
                </thead>
                <tbody>
                  {result.modernisierung.items.map((item, i) => (
                    <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                      <td className="px-3 py-2 font-medium">{item.bauteil}</td>
                      <td className="px-3 py-2 text-ink-mid">{item.geschaetztesAlter}</td>
                      <td className="px-3 py-2 text-center">
                        <ZustandBadge zustand={item.zustand} />
                      </td>
                      <td className="px-3 py-2 text-ink-mid">{item.geschaetzteKosten}</td>
                      <td className="px-3 py-2 text-ink-mid">{item.faelligIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">
                Sanierungs-Timeline
              </div>
              {result.modernisierung.timeline.map((t, i) => (
                <div key={i} className={`px-4 py-3 flex items-start gap-3 border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <div className="w-2 h-2 rounded-full bg-green mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-green">{t.zeitraum}</div>
                    <div className="text-[13px] text-ink-mid">{t.massnahmen}</div>
                  </div>
                  <div className="text-sm font-medium text-ink shrink-0">{t.kosten}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ════ 6. Standortanalyse ════ */}
      {result.standortanalyse && (
        <>
          <SectionHeader icon={<LocationIcon />} title={`Standortanalyse — Score: ${result.standortanalyse.gesamtScore}/10`} />
          <div className="space-y-3 mb-5">
            {/* Kategorien */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              {result.standortanalyse.kategorien.map((kat, i) => (
                <div key={i} className={`px-4 py-2.5 flex items-center gap-3 border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-ink">{kat.kategorie}</div>
                    <div className="text-xs text-ink-light mt-0.5">{kat.details}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      kat.score >= 8 ? 'bg-emerald-50 text-emerald-700' :
                      kat.score >= 6 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {kat.bewertung}
                    </span>
                    <span className={`text-sm font-display font-medium w-8 text-right ${
                      kat.score >= 8 ? 'text-emerald-600' :
                      kat.score >= 6 ? 'text-amber-600' :
                      'text-red-500'
                    }`}>
                      {kat.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Demografie + Wirtschaft + Infrastruktur collapsible */}
            <CollapsibleCard
              title="Demografie & Bevölkerung"
              expanded={expandedSections['demo'] ?? false}
              onToggle={() => toggleSection('demo')}
            >
              <KVRow label="Bevölkerungsentwicklung" value={result.standortanalyse.demografie.bevoelkerungsentwicklung} i={0} />
              <KVRow label="Trend" value={
                result.standortanalyse.demografie.trend === 'wachsend' ? '🟢 Wachsend' :
                result.standortanalyse.demografie.trend === 'stabil' ? '🟡 Stabil' : '🔴 Schrumpfend'
              } i={1} />
              <KVRow label="Altersstruktur" value={result.standortanalyse.demografie.altersstruktur} i={2} />
              <KVRow label="Kaufkraftindex" value={result.standortanalyse.demografie.kaufkraftindex} i={3} />
            </CollapsibleCard>

            <CollapsibleCard
              title="Wirtschaft & Arbeitsmarkt"
              expanded={expandedSections['wirtschaft'] ?? false}
              onToggle={() => toggleSection('wirtschaft')}
            >
              <KVRow label="Arbeitslosenquote" value={result.standortanalyse.wirtschaft.arbeitslosenquote} i={0} />
              <KVRow label="Top-Arbeitgeber" value={result.standortanalyse.wirtschaft.topArbeitgeber.join(', ')} i={1} />
              <KVRow label="Branchenstruktur" value={result.standortanalyse.wirtschaft.branchenstruktur} i={2} />
            </CollapsibleCard>

            <CollapsibleCard
              title="Internet & Mobilfunk"
              expanded={expandedSections['infra'] ?? false}
              onToggle={() => toggleSection('infra')}
            >
              <KVRow label="Breitband" value={`${result.standortanalyse.infrastruktur.breitband} (${result.standortanalyse.infrastruktur.breitbandTyp})`} i={0} />
              <KVRow label="Mobilfunk" value={result.standortanalyse.infrastruktur.mobilfunk} i={1} />
            </CollapsibleCard>
          </div>
        </>
      )}

      {/* ════ 7. Risikobewertung ════ */}
      {result.risikobewertung && (
        <>
          <SectionHeader icon={<ShieldIcon />} title="Risikobewertung" />
          <div className="space-y-3 mb-5">
            {/* Gesamtrisiko Banner */}
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              result.risikobewertung.gesamtrisiko === 'niedrig' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              result.risikobewertung.gesamtrisiko === 'hoch' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {result.risikobewertung.gesamtrisiko === 'niedrig' && '✅ Gesamtrisiko: Niedrig'}
              {result.risikobewertung.gesamtrisiko === 'mittel' && '⚠️ Gesamtrisiko: Mittel'}
              {result.risikobewertung.gesamtrisiko === 'hoch' && '🚨 Gesamtrisiko: Hoch'}
            </div>

            {/* Risk items */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              {result.risikobewertung.items.map((item, i) => (
                <div key={i} className={`px-4 py-3 border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <RiskBadge risiko={item.risiko} />
                    <span className="text-[13px] font-medium">{item.kategorie}</span>
                  </div>
                  <div className="text-xs text-ink-mid mb-1">{item.details}</div>
                  <div className="text-xs text-green">→ {item.handlungsempfehlung}</div>
                </div>
              ))}
            </div>

            {/* Red Flags */}
            {result.risikobewertung.redFlags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <div className="text-xs font-medium text-red-700 mb-2 tracking-wider uppercase">🚩 Red Flags</div>
                {result.risikobewertung.redFlags.map((flag, i) => (
                  <div key={i} className="flex gap-2 items-start py-1.5 text-xs text-red-700">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════ 8. Finanzierung ════ */}
      {result.finanzierung && (
        <>
          <SectionHeader icon={<BankIcon />} title="Finanzierungs-Check" />
          <div className="space-y-3 mb-5">
            {/* Szenarien */}
            <div className="grid gap-2">
              {result.finanzierung.szenarien.map((sz, i) => (
                <div key={i} className={`bg-white border rounded-xl p-4 ${i === 0 ? 'border-green/30 ring-1 ring-green/10' : 'border-ink/10'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green">{sz.name}</div>
                    {i === 0 && <span className="text-[10px] bg-green text-cream px-2 py-0.5 rounded-full">Empfohlen</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-ink-light">Eigenkapital:</span><br/><span className="font-medium">{sz.eigenkapital}</span></div>
                    <div><span className="text-ink-light">Darlehen:</span><br/><span className="font-medium">{sz.darlehenssumme}</span></div>
                    <div><span className="text-ink-light">Rate/Monat:</span><br/><span className="font-medium text-green">{sz.monatlicheRate}</span></div>
                    <div><span className="text-ink-light">Laufzeit:</span><br/><span className="font-medium">{sz.gesamtlaufzeit}</span></div>
                  </div>
                  <div className="mt-2 text-[11px] text-ink-light">
                    Zins {sz.zinssatz} · Tilgung {sz.tilgung} · Restschuld nach 10 J.: {sz.restschuld10Jahre}
                  </div>
                </div>
              ))}
            </div>

            {/* Kaufen vs Mieten */}
            <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
              <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">
                Kaufen vs. Mieten (20-Jahres-Vergleich)
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center p-3 rounded-lg bg-cream">
                    <div className="text-[10px] text-ink-light tracking-wider uppercase mb-1">Mieten</div>
                    <div className="font-display text-lg text-ink font-medium">{result.finanzierung.kaufenVsMieten.kostenMiete20Jahre}</div>
                    <div className="text-[11px] text-ink-light">{result.finanzierung.kaufenVsMieten.mpiMieteMonat}/Monat</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${result.finanzierung.kaufenVsMieten.vorteil === 'kaufen' ? 'bg-emerald-50' : 'bg-cream'}`}>
                    <div className="text-[10px] text-ink-light tracking-wider uppercase mb-1">Kaufen</div>
                    <div className="font-display text-lg text-ink font-medium">{result.finanzierung.kaufenVsMieten.kostenKauf20Jahre}</div>
                    <div className="text-[11px] text-emerald-600 font-medium">{result.finanzierung.kaufenVsMieten.vorteil === 'kaufen' ? '✓ Empfohlen' : ''}</div>
                  </div>
                </div>
                <div className="text-xs text-ink-mid leading-relaxed">{result.finanzierung.kaufenVsMieten.differenz}</div>
              </div>
            </div>

            {/* Stresstest */}
            <CollapsibleCard
              title="💥 Finanzierungs-Stresstest"
              expanded={expandedSections['stress'] ?? false}
              onToggle={() => toggleSection('stress')}
            >
              {result.finanzierung.stresstest.map((st, i) => (
                <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                  <td className="px-3.5 py-2 text-xs text-ink-mid w-[40%]">{st.szenario}</td>
                  <td className="px-3.5 py-2 text-xs">{st.monatlicheRate}</td>
                  <td className="px-3.5 py-2 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      st.bewertung === 'tragbar' ? 'bg-emerald-50 text-emerald-700' :
                      st.bewertung === 'kritisch' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {st.bewertung === 'tragbar' ? '✓ Tragbar' : st.bewertung === 'kritisch' ? '✗ Kritisch' : '~ Grenzwertig'}
                    </span>
                  </td>
                </tr>
              ))}
            </CollapsibleCard>
          </div>
        </>
      )}

      {/* ════ 9. Verhandlungstipps ════ */}
      {options.verhandlungstipps && result.verhandlungstipps?.length > 0 && (
        <>
          <SectionHeader icon={<BulbIcon />} title="Verhandlungstipps" />
          <div className="bg-white border border-ink/10 rounded-xl px-4 py-3 mb-5">
            {result.verhandlungstipps.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start py-2 border-b border-ink/8 last:border-b-0 text-[13px]">
                <span className="bg-green text-cream rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-ink-mid">{tip}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════ 10. Makleranschreiben ════ */}
      {options.makleranschreiben && result.makleranschreiben && (
        <>
          <SectionHeader icon={<LetterIcon />} title="Makleranschreiben" />
          <div className="relative bg-white border border-ink/10 rounded-xl px-5 py-4 mb-5 whitespace-pre-wrap text-[13.5px] leading-7 text-ink">
            <button
              onClick={copyLetter}
              className="absolute top-2.5 right-2.5 bg-cream-dark border border-ink/20 text-ink-mid text-[11px] font-medium px-2.5 py-1 rounded cursor-pointer tracking-wide hover:bg-cream transition-colors"
            >
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
            {result.makleranschreiben}
          </div>
        </>
      )}

      {/* ════ Premium Report ════ */}
      {result.premiumReport && (
        <>
          <div className="mt-8 mb-4 flex items-center gap-3">
            <div className="flex-1 border-t-2 border-gold/30" />
            <span className="text-xs text-gold font-bold tracking-widest uppercase">Premium-Report</span>
            <div className="flex-1 border-t-2 border-gold/30" />
          </div>
          <PremiumReport report={result.premiumReport} />
        </>
      )}
    </div>
  )
}

// ════════════════════════════════════════════
// Shared sub-components
// ════════════════════════════════════════════

function KVRow({ label, value, i, highlight }: { label: string; value: string; i: number; highlight?: boolean }) {
  return (
    <tr className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
      <td className="px-3.5 py-2 text-ink-light text-xs font-medium tracking-wide w-[40%]">{label}</td>
      <td className={`px-3.5 py-2 text-[13.5px] ${highlight ? 'font-medium text-green' : ''}`}>
        <ValueCell>{value}</ValueCell>
      </td>
    </tr>
  )
}

function CollapsibleCard({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-green tracking-wider uppercase bg-green/5 hover:bg-green/8 transition-colors"
      >
        {title}
        <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {expanded && (
        <table className="w-full text-[13.5px]">
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  )
}

function EnergyBadge({ klasse }: { klasse: string }) {
  const colors: Record<string, string> = {
    'A+': 'bg-emerald-600', A: 'bg-emerald-500', B: 'bg-lime-500', C: 'bg-yellow-400',
    D: 'bg-amber-400', E: 'bg-orange-400', F: 'bg-orange-500', G: 'bg-red-400', H: 'bg-red-600',
  }
  return (
    <div className={`${colors[klasse] || 'bg-gray-400'} text-white font-display text-2xl font-bold w-12 h-12 rounded-lg flex items-center justify-center`}>
      {klasse}
    </div>
  )
}

function ZustandBadge({ zustand }: { zustand: 'gut' | 'mittel' | 'kritisch' }) {
  const cls = zustand === 'gut' ? 'bg-emerald-50 text-emerald-700' : zustand === 'kritisch' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
  const label = zustand === 'gut' ? '✓ Gut' : zustand === 'kritisch' ? '✗ Kritisch' : '~ Mittel'
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function RiskBadge({ risiko }: { risiko: 'niedrig' | 'mittel' | 'hoch' }) {
  const cls = risiko === 'niedrig' ? 'bg-emerald-500' : risiko === 'hoch' ? 'bg-red-500' : 'bg-amber-400'
  return <span className={`w-2 h-2 rounded-full ${cls} shrink-0`} />
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 mt-7">
      <div className="w-7 h-7 bg-green rounded-md flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="font-display text-base font-medium text-green">{title}</div>
    </div>
  )
}

// ════════════════════════════════════════════
// Icons
// ════════════════════════════════════════════
const iconClass = "w-3.5 h-3.5 fill-none stroke-cream [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round]"

function HouseIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function TagIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function EuroIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 8a5 5 0 0 0-8 0M8 16a5 5 0 0 0 8 0M6 10h8M6 14h8"/></svg>
}
function BoltIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function WrenchIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
}
function LocationIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function ShieldIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function BankIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
function BulbIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
}
function LetterIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
