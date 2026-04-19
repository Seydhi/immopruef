import { useMemo, useState, type ReactNode } from 'react'
import type { AnalysisResult as AnalysisResultType, AnalysisOptions, Scores, Objektdaten } from '../lib/types'
import PremiumReport from './PremiumReport'
import {
  isUnavailable,
  parseObjektdaten,
  estimateKaufenVsMieten,
  estimateVermoegensvergleich,
  estimateWertermittlung,
  estimateMaklerProfil,
  estimateSanierung,
} from '../lib/fallbacks'

// ════════════════════════════════════════════════════════════════════
// AnalysisResult — strukturierter Aufbau (vom Großen zum Kleinen)
//
//   1. DECKBLATT       — Adresse + Hero-Stats + Ampel + Fazit + Link
//   2. SCORES          — 6 Kennzahlen-Karten
//   3. PREIS           — Marktband + Preisbewertung + Trend + Stärken/Schwächen
//   4. KOSTEN          — Gesamtkosten + Finanzierung + Mietrendite + Vermögen
//   5. ZUSTAND/ENERGIE — Energie + Modernisierung + Wertermittlung
//   6. STANDORT        — Standortanalyse + Standort-Dossier
//   7. VERKÄUFER       — Maklerprofil
//   8. RISIKEN         — Risikobewertung + Gutachter-Empfehlung
//   9. AKTION          — Verhandlungstipps + Checkliste + Besichtigungsfragen + Steuern
//  10. VORLAGEN        — Makleranschreiben
//  11. QUELLEN         — externe Datenquellen
// ════════════════════════════════════════════════════════════════════

interface AnalysisResultProps {
  result: AnalysisResultType
  options: AnalysisOptions
  url: string
  showBackButton?: boolean
  onBack?: () => void
}

export default function AnalysisResult({ result: rawResult, options, url, showBackButton = true, onBack }: AnalysisResultProps) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Patched Result: fehlende Premium-Felder werden durch deterministische
  // Schätzungen ersetzt. `schaetzungen` listet, welche Sections substituiert
  // wurden, damit das UI eine klare "Schätzung"-Kennzeichnung zeigt.
  const { result, schaetzungen } = useMemo(() => applyFallbacks(rawResult), [rawResult])

  const copyLetter = () => {
    navigator.clipboard.writeText(result.makleranschreiben).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isPremium = !!result.premiumReport
  const cleanUrl = url.split('#')[0].split('?')[0]

  return (
    <div className="pb-8">
      {showBackButton && (
        <button
          onClick={onBack || (() => { window.location.href = '/' })}
          className="mb-6 text-sm text-green hover:text-green-mid transition-colors flex items-center gap-1 no-print"
        >
          ← Neue Analyse starten
        </button>
      )}

      {/* ════════════════════════════════════════════════════════════
          DISCLAIMER — oben sichtbar vor der Analyse
          ════════════════════════════════════════════════════════════ */}
      <DisclaimerBanner />

      {/* ════════════════════════════════════════════════════════════
          1. DECKBLATT
          ════════════════════════════════════════════════════════════ */}
      <CoverPage
        objektdaten={result.objektdaten}
        ampel={result.preisbewertung?.ampel}
        ampelText={result.preisbewertung?.abweichung}
        preisProQm={result.preisbewertung?.preisProQm}
        regionalerDurchschnitt={result.preisbewertung?.regionalerDurchschnitt}
        zusammenfassung={result.zusammenfassung}
        cleanUrl={cleanUrl}
        isPremium={isPremium}
      />

      {/* Premium-Header (Report-Nr + PDF-Button) */}
      {isPremium && result.premiumReport && (
        <PremiumReport report={result.premiumReport} slot="header" />
      )}

      {/* ════════════════════════════════════════════════════════════
          2. SCORES
          ════════════════════════════════════════════════════════════ */}
      {result.scores && <ScoreCards scores={result.scores} />}

      {/* ════════════════════════════════════════════════════════════
          3. PREIS — Wo liegt der Preis?
          ════════════════════════════════════════════════════════════ */}
      <SectionDivider icon="💰" title="Wo liegt der Preis?" />

      {/* Premium: Marktband ZUERST (visuell stärkstes Element) */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="marktband" />
        </div>
      )}

      {/* Standard: Preisbewertung Tabelle */}
      {result.preisbewertung && (
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden mb-5">
          <div className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            result.preisbewertung.ampel === 'guenstig' ? 'bg-emerald-50 text-emerald-700' :
            result.preisbewertung.ampel === 'teuer' ? 'bg-red-50 text-red-700' :
            'bg-amber-50 text-amber-700'
          }`}>
            <span className="text-lg">{result.preisbewertung.ampel === 'guenstig' ? '✅' : result.preisbewertung.ampel === 'teuer' ? '🚨' : '⚠️'}</span>
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
      )}

      {/* Premium: Preistrend-Chart */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="preistrend" />
        </div>
      )}

      {/* Premium: Stärken & Schwächen Berater-Style */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="staerken" />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          4. KOSTEN — Was kostet es insgesamt?
          ════════════════════════════════════════════════════════════ */}
      <SectionDivider icon="🧮" title="Was kostet es insgesamt?" />

      {/* Standard: Gesamtkosten */}
      {result.gesamtkosten && (
        <div className="space-y-3 mb-5">
          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">Kaufnebenkosten</div>
            <table className="w-full text-[13.5px]">
              <tbody>
                <KVRow label={`Grunderwerbsteuer (${result.gesamtkosten.kaufnebenkosten?.grunderwerbsteuer?.satz || '—'})`} value={result.gesamtkosten.kaufnebenkosten?.grunderwerbsteuer?.betrag || '—'} i={0} />
                <KVRow label={`Notar (${result.gesamtkosten.kaufnebenkosten?.notar?.satz || '—'})`} value={result.gesamtkosten.kaufnebenkosten?.notar?.betrag || '—'} i={1} />
                <KVRow label={`Grundbuch (${result.gesamtkosten.kaufnebenkosten?.grundbuch?.satz || '—'})`} value={result.gesamtkosten.kaufnebenkosten?.grundbuch?.betrag || '—'} i={2} />
                <KVRow label={`Makler (${result.gesamtkosten.kaufnebenkosten?.makler?.satz || '—'})`} value={result.gesamtkosten.kaufnebenkosten?.makler?.betrag || '—'} i={3} />
                <tr className="bg-green/5 font-medium">
                  <td className="px-3.5 py-2.5 text-green text-xs tracking-wide">Nebenkosten Gesamt</td>
                  <td className="px-3.5 py-2.5 text-green font-display text-base">{result.gesamtkosten.kaufnebenkosten.gesamt}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">Investitionsübersicht</div>
            <table className="w-full text-[13.5px]">
              <tbody>
                {result.gesamtkosten?.kaufpreis && <KVRow label="Kaufpreis" value={result.gesamtkosten.kaufpreis} i={0} />}
                <KVRow label="Kaufnebenkosten" value={result.gesamtkosten.kaufnebenkosten?.gesamt || '—'} i={1} />
                {result.gesamtkosten?.geschaetzteSanierung && <KVRow label={schaetzungen.has('sanierung') ? 'Geschätzte Sanierung (Schätzung)' : 'Geschätzte Sanierung'} value={result.gesamtkosten.geschaetzteSanierung} i={2} />}
              </tbody>
            </table>
          </div>

          <div className="bg-green text-cream rounded-xl px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-cream/70 text-[10px] tracking-wider uppercase mb-0.5">Gesamtinvestition</div>
              <div className="text-xs text-cream/60">Kaufpreis + Nebenkosten + Sanierung</div>
            </div>
            <div className="font-display text-2xl font-medium">{result.gesamtkosten?.gesamtinvestition || '—'}</div>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">Laufende monatliche Kosten</div>
            <table className="w-full text-[13.5px]">
              <tbody>
                {(result.gesamtkosten?.laufendeKosten || []).map((lk, i) => (
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
      )}

      {/* Standard: Finanzierungs-Szenarien (3 Stück) */}
      {result.finanzierung && (
        <div className="space-y-3 mb-5">
          <SubSectionHeader icon={<BankIcon />} title="Finanzierungs-Szenarien" />
          {result.finanzierung?.empfohleneEigenkapitalquote && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-blue-800">Empfohlene Eigenkapitalquote</div>
              <div className="font-display text-lg font-medium text-blue-900">{result.finanzierung.empfohleneEigenkapitalquote}</div>
            </div>
          )}
          <div className="grid gap-2">
            {(result.finanzierung?.szenarien || []).map((sz, i) => (
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
                <div className="mt-2 text-[11px] text-ink-light">Zins {sz.zinssatz} · Tilgung {sz.tilgung} · Restschuld nach 10 J.: {sz.restschuld10Jahre}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium: Finanzierungs-Cashflow Detail */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="finanzierung" />
        </div>
      )}

      {/* Premium: Mietrendite (Anleger-Sicht) */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="mietrendite" />
        </div>
      )}

      {/* Standard: Kaufen vs Mieten */}
      {result.finanzierung && (
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden mb-5">
          <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8 flex items-center justify-between">
            <span>Kaufen vs. Mieten (20-Jahres-Vergleich)</span>
            {schaetzungen.has('kaufenVsMieten') && <SchaetzungBadge />}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-3 rounded-lg bg-cream">
                <div className="text-[10px] text-ink-light tracking-wider uppercase mb-1">Mieten</div>
                <div className="font-display text-lg text-ink font-medium">{result.finanzierung?.kaufenVsMieten?.kostenMiete20Jahre}</div>
                <div className="text-[11px] text-ink-light">{result.finanzierung?.kaufenVsMieten?.mpiMieteMonat}/Monat</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${result.finanzierung?.kaufenVsMieten?.vorteil === 'kaufen' ? 'bg-emerald-50' : 'bg-cream'}`}>
                <div className="text-[10px] text-ink-light tracking-wider uppercase mb-1">Kaufen</div>
                <div className="font-display text-lg text-ink font-medium">{result.finanzierung?.kaufenVsMieten?.kostenKauf20Jahre}</div>
                <div className="text-[11px] text-emerald-600 font-medium">{result.finanzierung?.kaufenVsMieten?.vorteil === 'kaufen' ? '✓ Empfohlen' : ''}</div>
              </div>
            </div>
            <div className="text-xs text-ink-mid leading-relaxed">{result.finanzierung?.kaufenVsMieten?.differenz}</div>
          </div>
        </div>
      )}

      {/* Premium: 30-Jahres Vermögensvergleich */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          {schaetzungen.has('vermoegen') && <SchaetzungHinweis scope="Vermögensvergleich" />}
          <PremiumReport report={result.premiumReport} slot="vermoegen" />
        </div>
      )}

      {/* Standard: Stresstest collapsible */}
      {result.finanzierung?.stresstest && result.finanzierung.stresstest.length > 0 && (
        <div className="mb-5">
          <CollapsibleCard title="💥 Finanzierungs-Stresstest" expanded={expandedSections['stress'] ?? false} onToggle={() => toggleSection('stress')}>
            {(result.finanzierung?.stresstest || []).map((st, i) => (
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
      )}

      {/* ════════════════════════════════════════════════════════════
          5. ZUSTAND & ENERGIE
          ════════════════════════════════════════════════════════════ */}
      <SectionDivider icon="🏗️" title="Zustand & Energie" />

      {/* Standard: Energieanalyse */}
      {result.energieanalyse && (
        <div className="space-y-3 mb-5">
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
            {result.energieanalyse.gegPflicht.besteht && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 text-xs text-amber-800">
                <span className="font-medium">⚠️ GEG-Pflicht:</span> {result.energieanalyse.gegPflicht.details}
              </div>
            )}
          </div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">Sanierungsoptionen & Förderung</div>
            <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[500px]">
              <thead>
                <tr className="border-b border-ink/10 text-ink-light">
                  <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Maßnahme</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Kosten</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Ersparnis</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium tracking-wider uppercase">Förderung</th>
                </tr>
              </thead>
              <tbody>
                {(result.energieanalyse?.sanierungsoptionen || []).map((opt, i) => (
                  <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                    <td className="px-3 py-2 font-medium text-ink">{opt.massnahme}</td>
                    <td className="px-3 py-2 text-ink-mid">{opt.kosten}</td>
                    <td className="px-3 py-2 text-emerald-600">{opt.ersparnis}</td>
                    <td className="px-3 py-2 text-ink-mid text-xs">{opt.foerderung}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 font-medium">💰 {result.energieanalyse.foerdermittelGesamt}</div>
          </div>
        </div>
      )}

      {/* Standard: Modernisierungs-Check */}
      {result.modernisierung && (
        <div className="space-y-3 mb-5">
          <SubSectionHeader icon={<WrenchIcon />} title="Modernisierungs-Check" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-amber-800"><span className="font-medium">Geschätzter Sanierungsstau:</span></div>
            <div className="font-display text-xl text-amber-700 font-medium">{result.modernisierung.sanierungsstauGesamt}</div>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-x-auto">
            <table className="w-full text-[13px] min-w-[520px]">
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
                {(result.modernisierung?.items || []).map((item, i) => (
                  <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                    <td className="px-3 py-2 font-medium">{item.bauteil}</td>
                    <td className="px-3 py-2 text-ink-mid">{item.geschaetztesAlter}</td>
                    <td className="px-3 py-2 text-center"><ZustandBadge zustand={item.zustand} /></td>
                    <td className="px-3 py-2 text-ink-mid">{item.geschaetzteKosten}</td>
                    <td className="px-3 py-2 text-ink-mid">{item.faelligIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            <div className="bg-green/5 px-4 py-2.5 text-xs font-medium text-green tracking-wider uppercase border-b border-ink/8">Sanierungs-Timeline</div>
            {(result.modernisierung?.timeline || []).map((t, i) => (
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
      )}

      {/* Premium: Wertermittlung (3 Verfahren — am Ende des Zustand-Blocks weil juristisch) */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          {schaetzungen.has('wertermittlung') && <SchaetzungHinweis scope="Wertermittlung" />}
          <PremiumReport report={result.premiumReport} slot="wertermittlung" />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          6. STANDORT — Wo liegt die Immobilie?
          ════════════════════════════════════════════════════════════ */}
      <SectionDivider icon="📍" title="Wo liegt die Immobilie?" />

      {/* Standard: Standortanalyse */}
      {result.standortanalyse && (
        <div className="space-y-3 mb-5">
          <div className="text-xs text-ink-light mb-2">Gesamt-Score: <span className="font-medium text-ink">{result.standortanalyse.gesamtScore}/10</span></div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            {(result.standortanalyse?.kategorien || []).map((kat, i) => (
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
                  }`}>{kat.bewertung}</span>
                  <span className={`text-sm font-display font-medium w-8 text-right ${
                    kat.score >= 8 ? 'text-emerald-600' :
                    kat.score >= 6 ? 'text-amber-600' :
                    'text-red-500'
                  }`}>{kat.score}</span>
                </div>
              </div>
            ))}
          </div>

          <CollapsibleCard title="Demografie & Bevölkerung" expanded={expandedSections['demo'] ?? false} onToggle={() => toggleSection('demo')}>
            <KVRow label="Bevölkerungsentwicklung" value={result.standortanalyse.demografie.bevoelkerungsentwicklung} i={0} />
            <KVRow label="Trend" value={result.standortanalyse.demografie.trend === 'wachsend' ? '🟢 Wachsend' : result.standortanalyse.demografie.trend === 'stabil' ? '🟡 Stabil' : '🔴 Schrumpfend'} i={1} />
            <KVRow label="Altersstruktur" value={result.standortanalyse.demografie.altersstruktur} i={2} />
            <KVRow label="Kaufkraftindex" value={result.standortanalyse.demografie.kaufkraftindex} i={3} />
          </CollapsibleCard>

          <CollapsibleCard title="Wirtschaft & Arbeitsmarkt" expanded={expandedSections['wirtschaft'] ?? false} onToggle={() => toggleSection('wirtschaft')}>
            <KVRow label="Arbeitslosenquote" value={result.standortanalyse.wirtschaft.arbeitslosenquote} i={0} />
            <KVRow label="Top-Arbeitgeber" value={result.standortanalyse.wirtschaft.topArbeitgeber.join(', ')} i={1} />
            <KVRow label="Branchenstruktur" value={result.standortanalyse.wirtschaft.branchenstruktur} i={2} />
          </CollapsibleCard>

          <CollapsibleCard title="Internet & Mobilfunk" expanded={expandedSections['infra'] ?? false} onToggle={() => toggleSection('infra')}>
            <KVRow label="Breitband" value={`${result.standortanalyse.infrastruktur.breitband} (${result.standortanalyse.infrastruktur.breitbandTyp})`} i={0} />
            <KVRow label="Mobilfunk" value={result.standortanalyse.infrastruktur.mobilfunk} i={1} />
          </CollapsibleCard>
        </div>
      )}

      {/* Premium: Standort-Dossier */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="standortDossier" />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          7. VERKÄUFER (nur Premium)
          ════════════════════════════════════════════════════════════ */}
      {isPremium && result.premiumReport && result.premiumReport.maklerProfil && (
        <>
          <SectionDivider icon="👔" title="Wer verkauft?" />
          <div className="mb-5">
            {schaetzungen.has('makler') && <SchaetzungHinweis scope="Makler-Check" />}
            <PremiumReport report={result.premiumReport} slot="maklerProfil" />
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          8. RISIKEN & FALLSTRICKE
          ════════════════════════════════════════════════════════════ */}
      <SectionDivider icon="⚠️" title="Risiken & Fallstricke" />

      {result.risikobewertung && (
        <div className="space-y-3 mb-5">
          <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            result.risikobewertung.gesamtrisiko === 'niedrig' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            result.risikobewertung.gesamtrisiko === 'hoch' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {result.risikobewertung.gesamtrisiko === 'niedrig' && '✅ Gesamtrisiko: Niedrig'}
            {result.risikobewertung.gesamtrisiko === 'mittel' && '⚠️ Gesamtrisiko: Mittel'}
            {result.risikobewertung.gesamtrisiko === 'hoch' && '🚨 Gesamtrisiko: Hoch'}
          </div>

          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
            {(result.risikobewertung?.items || []).map((item, i) => (
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

          {result.risikobewertung.redFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <div className="text-xs font-medium text-red-700 mb-2 tracking-wider uppercase">🚩 Red Flags</div>
              {(result.risikobewertung?.redFlags || []).map((flag, i) => (
                <div key={i} className="flex gap-2 items-start py-1.5 text-xs text-red-700">
                  <span className="shrink-0 mt-0.5">•</span><span>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Premium: Gutachter-Empfehlung */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="gutachter" />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          9. AKTION — Was jetzt tun?
          ════════════════════════════════════════════════════════════ */}
      <SectionDivider icon="🎯" title="Was jetzt tun?" />

      {/* Standard: Verhandlungstipps */}
      {options.verhandlungstipps && result.verhandlungstipps?.length > 0 && (
        <div className="mb-5">
          <SubSectionHeader icon={<BulbIcon />} title="Verhandlungstipps" />
          <div className="bg-white border border-ink/10 rounded-xl px-4 py-3">
            {(result.verhandlungstipps || []).map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start py-2 border-b border-ink/8 last:border-b-0 text-[13px]">
                <span className="bg-green text-cream rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-ink-mid">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium: Vor-Kauf-Checkliste */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="checkliste" />
        </div>
      )}

      {/* Premium: Kontextuelle Besichtigungsfragen */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="besichtigung" />
        </div>
      )}

      {/* Premium: Steuerliche Aspekte */}
      {isPremium && result.premiumReport && (
        <div className="mb-5">
          <PremiumReport report={result.premiumReport} slot="steuern" />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          10. VORLAGEN — Makleranschreiben
          ════════════════════════════════════════════════════════════ */}
      {options.makleranschreiben && result.makleranschreiben && (
        <>
          <SectionDivider icon="✉️" title="Vorlage: Makleranschreiben" />
          <div className="relative bg-white border border-ink/10 rounded-xl px-5 py-4 mb-5 whitespace-pre-wrap text-[13.5px] leading-7 text-ink">
            <button
              onClick={copyLetter}
              className="absolute top-2.5 right-2.5 bg-cream-dark border border-ink/20 text-ink-mid text-[11px] font-medium px-2.5 py-1 rounded cursor-pointer tracking-wide hover:bg-cream transition-colors no-print"
            >
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
            {result.makleranschreiben}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          11. QUELLEN — externe Datenquellen
          ════════════════════════════════════════════════════════════ */}
      {result.quellen && result.quellen.length > 0 && (
        <>
          <SectionDivider icon="🔗" title="Quellen & Datenbasis" />
          <div className="bg-white border border-ink/10 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs text-ink-light mb-3 leading-relaxed">
              Diese Analyse basiert auf öffentlich verfügbaren Daten aus den folgenden Quellen.
              Alle Werte wurden zum Stand der Erstellung recherchiert.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              {result.quellen.map((q, i) => (
                <a
                  key={i}
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 py-1.5 border-b border-ink/5 last:border-b-0 hover:bg-cream/50 -mx-1 px-1 rounded transition-colors"
                >
                  <span className="bg-green/10 text-green text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0 mt-0.5 tracking-wider uppercase whitespace-nowrap">{q.kategorie}</span>
                  <span className="text-[12px] text-ink-mid group-hover:text-green flex-1 leading-snug">
                    {q.titel}<span className="text-ink-light text-[10px] ml-1">↗</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          LEGAL FOOTER — formaler Haftungsausschluss am Ende der Analyse
          ════════════════════════════════════════════════════════════ */}
      <LegalDisclaimerFooter />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DISCLAIMER-KOMPONENTEN
// ════════════════════════════════════════════════════════════════════

function DisclaimerBanner() {
  return (
    <div
      role="note"
      aria-label="Rechtlicher Hinweis zur Analyse"
      className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3"
    >
      <span aria-hidden="true" className="text-lg leading-none mt-0.5 shrink-0">⚠️</span>
      <div className="text-[12.5px] leading-relaxed text-amber-900">
        <span className="font-medium">Wichtiger Hinweis: </span>
        Diese Analyse ist eine <strong>automatisierte KI-Auswertung</strong> öffentlich
        verfügbarer Daten und dient als <strong>Informationsgrundlage</strong> — sie stellt
        keine Rechts-, Steuer- oder Finanzberatung dar und ersetzt keinen Sachverständigen
        oder Gutachter. Vor einer Kaufentscheidung bitte stets offizielle Dokumente
        (Grundbuch, Bebauungsplan, Energieausweis) und bei Bedarf einen Fachmann hinzuziehen.{' '}
        <a href="/agb" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-950">
          Vollständiger Haftungsausschluss
        </a>
        .
      </div>
    </div>
  )
}

function LegalDisclaimerFooter() {
  return (
    <section
      aria-labelledby="legal-disclaimer-title"
      className="mt-8 bg-ink/[0.03] border border-ink/10 rounded-xl p-5"
    >
      <h2 id="legal-disclaimer-title" className="text-xs font-medium text-ink-light tracking-wider uppercase mb-3">
        Rechtlicher Hinweis & Haftungsausschluss
      </h2>
      <div className="space-y-3 text-[12px] text-ink-mid leading-relaxed">
        <p>
          <strong className="text-ink">Keine individuelle Beratung.</strong> Diese Analyse ist
          eine automatisierte, KI-gestützte Auswertung öffentlich verfügbarer Daten. Sie stellt
          <strong> keine</strong> Rechts-, Steuer-, Immobilien-, Finanz- oder Anlageberatung dar
          und ersetzt nicht die Beauftragung eines Sachverständigen, Gutachters, Rechtsanwalts,
          Steuerberaters oder Finanzberaters. Für rechtsverbindliche Aussagen zu Bebauung,
          Belastungen, Grundbuch oder Erschließung ziehen Sie bitte die offiziellen Dokumente
          (Grundbuchauszug, Bebauungsplan, Flurkartenauszug, Energieausweis) sowie einen
          entsprechenden Fachmann hinzu.
        </p>
        <p>
          <strong className="text-ink">Keine Gewähr.</strong> Wir übernehmen keine Gewähr für
          die Vollständigkeit, Richtigkeit oder Aktualität der in dieser Analyse enthaltenen
          Informationen. Marktdaten, Preisentwicklungen, Energiekosten, Rendite-Berechnungen,
          Zinssätze und Sanierungs-Schätzungen basieren auf generalisierten Annahmen und können
          erheblich von der tatsächlichen Situation des Einzelobjekts abweichen.
        </p>
        <p>
          <strong className="text-ink">Keine Kaufempfehlung.</strong> Diese Analyse ist weder
          eine Aufforderung zum Kauf noch zum Verkauf einer Immobilie. Die finale
          Kaufentscheidung trifft allein der Kunde in eigener Verantwortung und auf Basis
          eigener Prüfungen — insbesondere einer persönlichen Besichtigung vor Ort, der
          Einsichtnahme in alle verkaufsrelevanten Unterlagen und — sofern erforderlich —
          einer gutachterlichen Bewertung.
        </p>
        <p>
          <strong className="text-ink">Keine automatisierte Entscheidung nach Art. 22 DSGVO.</strong>{' '}
          Die Analyse stellt keine automatisierte Entscheidung im Sinne des Art. 22 DSGVO dar —
          sie ist eine von Ihnen aktiv bestellte Informationsleistung und trifft keine
          Entscheidung über oder gegen Sie.
        </p>
        <p className="pt-2 border-t border-ink/10 text-ink-light">
          Weitere Informationen finden Sie in unseren{' '}
          <a href="/agb" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">AGB</a>
          {', '}in unserer{' '}
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">Datenschutzerklärung</a>
          {' '}sowie im{' '}
          <a href="/impressum" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">Impressum</a>.
        </p>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// 1. DECKBLATT
// ════════════════════════════════════════════════════════════════════

function CoverPage({ objektdaten, ampel, ampelText, preisProQm, regionalerDurchschnitt, zusammenfassung, cleanUrl, isPremium }: {
  objektdaten?: Objektdaten[]
  ampel?: 'guenstig' | 'fair' | 'teuer'
  ampelText?: string
  preisProQm?: string
  regionalerDurchschnitt?: string
  zusammenfassung?: string
  cleanUrl: string
  isPremium: boolean
}) {
  const find = (keys: string[]) => objektdaten?.find(o => keys.some(k => o.merkmal?.toLowerCase().includes(k)))?.wert || '—'
  const adresse = find(['adresse', 'lage', 'standort', 'ort'])
  const objektTyp = find(['typ', 'art', 'objekttyp', 'immobilienart'])
  const baujahr = find(['baujahr'])
  const kaufpreis = find(['kaufpreis', 'preis']).replace(/\s*\(.*\)/, '')
  const wohnflaeche = find(['wohnfläche', 'wohnflaeche', 'fläche', 'flaeche'])
  const zimmer = find(['zimmer'])
  const energie = find(['energieeffizienz', 'energieklasse', 'effizienzklasse'])

  const ampelBg = ampel === 'guenstig' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                  ampel === 'teuer' ? 'bg-red-50 border-red-300 text-red-700' :
                  'bg-amber-50 border-amber-300 text-amber-700'
  const ampelEmoji = ampel === 'guenstig' ? '✅' : ampel === 'teuer' ? '🚨' : '⚠️'
  const ampelLabel = ampel === 'guenstig' ? 'Günstig' : ampel === 'teuer' ? 'Über Markt' : 'Marktüblich'

  return (
    <div className="bg-gradient-to-br from-cream-dark to-cream border border-ink/15 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
      {/* Top: Label + Adresse */}
      <div className="mb-5">
        <div className="text-[10px] text-ink-light tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
          {isPremium ? <span className="bg-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">Premium-Analyse</span> : 'Immobilienanalyse'}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight font-medium mb-1">{adresse}</h1>
        <div className="text-sm text-ink-mid">
          {objektTyp !== '—' && <span>{objektTyp}</span>}
          {objektTyp !== '—' && baujahr !== '—' && <span className="mx-1.5 text-ink/30">·</span>}
          {baujahr !== '—' && <span>Baujahr {baujahr}</span>}
        </div>
      </div>

      {/* Hero-Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        <HeroStat label="Kaufpreis" value={kaufpreis} highlight />
        <HeroStat label="Wohnfläche" value={wohnflaeche} />
        <HeroStat label="Zimmer" value={zimmer} />
        <HeroStat label="Energieklasse" value={energie} />
      </div>

      {/* Ampel-Banner */}
      {ampel && (
        <div className={`${ampelBg} border-2 rounded-xl px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-2`}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{ampelEmoji}</span>
            <div>
              <div className="text-xs font-medium tracking-wider uppercase opacity-80">Preiseinordnung</div>
              <div className="text-sm font-medium">{ampelLabel} — {ampelText}</div>
            </div>
          </div>
          {preisProQm && regionalerDurchschnitt && (
            <div className="text-right text-xs">
              <div className="opacity-70">Diese Immobilie</div>
              <div className="font-medium">{preisProQm} · Region: {regionalerDurchschnitt}</div>
            </div>
          )}
        </div>
      )}

      {/* Fazit */}
      {zusammenfassung && (
        <div className="bg-green-light border border-green/18 rounded-xl px-5 py-4 mb-4 text-sm text-green leading-relaxed">
          <span className="font-display font-medium">Fazit:</span> {zusammenfassung}
        </div>
      )}

      {/* Original-Link */}
      <a
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-green hover:text-green-mid transition-colors"
      >
        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        Original-Exposé öffnen
      </a>
    </div>
  )
}

function HeroStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-white border rounded-xl p-3 sm:p-3.5 ${highlight ? 'border-green/40 ring-1 ring-green/15' : 'border-ink/10'}`}>
      <div className="text-[10px] text-ink-light tracking-wider uppercase font-medium mb-1">{label}</div>
      <div className={`font-display ${highlight ? 'text-green text-base sm:text-lg' : 'text-ink text-sm sm:text-base'} font-medium leading-tight break-words`}>
        <ValueCell>{value}</ValueCell>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// 2. SCORE-KARTEN
// ════════════════════════════════════════════════════════════════════

const SCORE_CONFIG: { key: keyof Scores; label: string; weight: string; desc: string }[] = [
  { key: 'gesamtbewertung', label: 'Gesamt', weight: 'Gewichteter Durchschnitt', desc: 'Lage 25% + Preis 25% + Zustand 20% + Energie 15% + Finanzierung 15%' },
  { key: 'lage', label: 'Lage', weight: '25%', desc: 'ÖPNV, Schulen, Einkauf, Ärzte, Lärm, Sicherheit, Entwicklung' },
  { key: 'preis_leistung', label: 'Preis', weight: '25%', desc: 'Preis/m² vs. Region, Bodenrichtwert, Kaufpreis-Miete-Verhältnis' },
  { key: 'zustand', label: 'Zustand', weight: '20%', desc: 'Baujahr, Sanierungsstau, Modernisierungsbedarf, Bausubstanz' },
  { key: 'energie', label: 'Energie', weight: '15%', desc: 'Effizienzklasse, Heizkosten, GEG-Pflichten, Sanierungsoptionen' },
  { key: 'finanzierung', label: 'Finanz.', weight: '15%', desc: 'Tragbarkeit, Eigenkapitalquote, Stresstest-Ergebnis' },
]

function ScoreCards({ scores }: { scores: Scores }) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
      {SCORE_CONFIG.map(({ key, label, weight, desc }) => {
        const rawVal = scores[key]
        const val = typeof rawVal === 'number' && rawVal >= 1 && rawVal <= 10 ? rawVal : null
        const color = val === null ? 'text-ink-light' : val >= 7 ? 'text-emerald-600' : val >= 5 ? 'text-amber-600' : 'text-red-500'
        const isOpen = activeTooltip === key
        return (
          <div
            key={key}
            className="relative bg-white border border-ink/10 rounded-xl p-3 text-center cursor-pointer hover:border-green/30 transition-colors"
            onMouseEnter={() => setActiveTooltip(key)}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => setActiveTooltip(isOpen ? null : key)}
          >
            <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-0.5">{label}</div>
            <div className={`font-display text-xl font-medium ${color}`}>
              {val !== null ? val : '–'}
              <span className="text-xs text-ink-light">/10</span>
            </div>
            {isOpen && (
              <div className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-ink text-cream rounded-lg px-3.5 py-3 text-left shadow-lg">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-ink rotate-45 rounded-sm" />
                <div className="text-[11px] font-semibold mb-1">{label} — Gewichtung: {weight}</div>
                <div className="text-[10px] text-cream/70 leading-relaxed">{desc}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// SECTION-DIVIDER (große thematische Trenner)
// ════════════════════════════════════════════════════════════════════

function SectionDivider({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-10 first:mt-0">
      <span className="text-2xl">{icon}</span>
      <h2 className="font-display text-2xl sm:text-3xl font-medium text-green">{title}</h2>
      <div className="flex-1 border-t border-ink/15 ml-2" />
    </div>
  )
}

function SubSectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 mt-2">
      <div className="w-7 h-7 bg-green rounded-md flex items-center justify-center shrink-0">{icon}</div>
      <div className="font-display text-base font-medium text-green">{title}</div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

const REGION_HINTS = ['Regionsdurchschnitt', 'nicht im Exposé', 'Nicht im Exposé', 'nicht angegeben', 'Durchschnitt der Region', 'Proxy aus', 'Bundesschnitt', 'Landesdurchschnitt']

function ValueCell({ children }: { children: ReactNode }) {
  if (typeof children !== 'string') return <>{children}</>
  if (children.trim() === '') return <span className="text-ink-light">—</span>
  if (!REGION_HINTS.some(hint => children.toLowerCase().includes(hint.toLowerCase()))) return <>{children}</>

  const idx = children.indexOf('(')
  const value = idx > 0 ? children.slice(0, idx).trim() : children
  if (!value || value === children) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-600 font-medium">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
        Nicht im Exposé
      </span>
    )
  }
  return (
    <span>
      {value}
      <span className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-600 font-medium whitespace-nowrap">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
        Regionsdurchschnitt
      </span>
    </span>
  )
}

function KVRow({ label, value, i, highlight }: { label: string; value: string; i: number; highlight?: boolean }) {
  return (
    <tr className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
      <td className="px-3.5 py-2 text-ink-light text-xs font-medium tracking-wide w-[40%]">{label}</td>
      <td className={`px-3.5 py-2 text-[13.5px] ${highlight ? 'font-medium text-green' : ''}`}><ValueCell>{value}</ValueCell></td>
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
      {expanded && <table className="w-full text-[13.5px]"><tbody>{children}</tbody></table>}
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

// ════════════════════════════════════════════════════════════════════
// ICONS
// ════════════════════════════════════════════════════════════════════
const iconClass = "w-3.5 h-3.5 fill-none stroke-cream [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round]"

function WrenchIcon() {
  return <svg aria-hidden="true" className={iconClass} viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
}
function BankIcon() {
  return <svg aria-hidden="true" className={iconClass} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
function BulbIcon() {
  return <svg aria-hidden="true" className={iconClass} viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
}

// ════════════════════════════════════════════════════════════════════
// Schätzung-Kennzeichnung für gepatchte Sections
// ════════════════════════════════════════════════════════════════════
function SchaetzungBadge() {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 tracking-wider uppercase"
      title="Schätzung: berechnet aus Kaufpreis, Fläche, Baujahr und regionalen Kennzahlen"
    >
      Schätzung
    </span>
  )
}

function SchaetzungHinweis({ scope }: { scope: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-t-xl px-4 py-2 text-[11px] text-amber-800 flex items-center gap-2 mb-[-1px]">
      <span className="font-medium">ℹ️ Schätzung ({scope}):</span>
      <span className="text-amber-700">
        Berechnet aus Kaufpreis, Fläche, Baujahr und regionalen Kennzahlen. Keine Live-Marktdaten verfügbar — Werte dienen zur Orientierung.
      </span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// FALLBACK-PATCHER
// Ersetzt "nicht verfügbar"/"nicht berechenbar"-Platzhalter durch
// deterministische Schätzungen basierend auf Kaufpreis, Fläche, Baujahr
// und regionalen Kennzahlen. Jede Substitution wird in `schaetzungen`
// vermerkt, damit das UI eine Schätzung-Kennzeichnung zeigen kann.
// ════════════════════════════════════════════════════════════════════
function applyFallbacks(raw: AnalysisResultType): { result: AnalysisResultType; schaetzungen: Set<string> } {
  const schaetzungen = new Set<string>()
  const result: AnalysisResultType = { ...raw }
  const parsed = parseObjektdaten(raw)

  // 1. Sanierung (Standard-Block)
  if (isUnavailable(raw.gesamtkosten?.geschaetzteSanierung)) {
    const est = estimateSanierung(parsed)
    if (est && raw.gesamtkosten) {
      result.gesamtkosten = { ...raw.gesamtkosten, geschaetzteSanierung: est.wert }
      schaetzungen.add('sanierung')
    }
  }

  // 2. Kaufen-vs-Mieten
  const kvm = raw.finanzierung?.kaufenVsMieten
  if (
    raw.finanzierung &&
    (!kvm ||
      isUnavailable(kvm.mpiMieteMonat) ||
      isUnavailable(kvm.kostenMiete20Jahre) ||
      isUnavailable(kvm.kostenKauf20Jahre) ||
      isUnavailable(kvm.differenz))
  ) {
    const est = estimateKaufenVsMieten(parsed)
    if (est) {
      result.finanzierung = { ...raw.finanzierung, kaufenVsMieten: est }
      schaetzungen.add('kaufenVsMieten')
    }
  }

  // 3. Premium-Report Felder
  if (raw.premiumReport) {
    let patchedPremium = raw.premiumReport
    let touched = false

    // Vermögensvergleich
    const vv = raw.premiumReport.vermoegensvergleich
    const vvFehlt = !vv || vv.vermoegenKauf?.some(isUnavailable) || vv.vermoegenMieteEtf?.some(isUnavailable)
    if (vvFehlt) {
      const est = estimateVermoegensvergleich(parsed)
      if (est) {
        patchedPremium = { ...patchedPremium, vermoegensvergleich: est }
        schaetzungen.add('vermoegen')
        touched = true
      }
    }

    // Wertermittlung
    const we = raw.premiumReport.wertermittlung
    const weFehlt =
      !we ||
      isUnavailable(we.vergleichswert?.wert) ||
      isUnavailable(we.sachwert?.sachwert) ||
      isUnavailable(we.ertragswert?.ertragswert) ||
      isUnavailable(we.fazit?.empfohlenerKaufpreis)
    if (weFehlt) {
      const est = estimateWertermittlung(parsed)
      if (est) {
        patchedPremium = { ...patchedPremium, wertermittlung: est }
        schaetzungen.add('wertermittlung')
        touched = true
      }
    }

    // Makler-Profil
    const mp = raw.premiumReport.maklerProfil
    const mpFehlt =
      !mp ||
      mp.art === 'unbekannt' ||
      isUnavailable(mp.name) ||
      /nicht im expos[ée] erkennbar|nicht erkennbar/i.test(mp.name || '')
    if (mpFehlt) {
      const est = estimateMaklerProfil(raw)
      if (est) {
        patchedPremium = { ...patchedPremium, maklerProfil: est }
        schaetzungen.add('makler')
        touched = true
      }
    }

    if (touched) result.premiumReport = patchedPremium
  }

  return { result, schaetzungen }
}
