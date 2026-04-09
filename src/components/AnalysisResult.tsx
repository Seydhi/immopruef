import { useState } from 'react'
import type { AnalysisResult as AnalysisResultType, AnalysisOptions } from '../lib/types'

interface AnalysisResultProps {
  result: AnalysisResultType
  options: AnalysisOptions
  url: string
  showBackButton?: boolean
  onBack?: () => void
}

export default function AnalysisResult({ result, options, url, showBackButton = true, onBack }: AnalysisResultProps) {
  const [copied, setCopied] = useState(false)

  const copyLetter = () => {
    navigator.clipboard.writeText(result.makleranschreiben).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const badgeClass = (rating: string) => {
    if (rating === 'gut') return 'bg-emerald-50 text-emerald-700'
    if (rating === 'schlecht') return 'bg-red-50 text-red-700'
    return 'bg-amber-50 text-amber-700'
  }

  const badgeLabel = (rating: string) => {
    if (rating === 'gut') return '↑ Gut'
    if (rating === 'schlecht') return '↓ Kritisch'
    return '~ Mittel'
  }

  return (
    <div>
      {showBackButton && (
        <button
          onClick={onBack || (() => { window.location.href = '/' })}
          className="mb-6 text-sm text-green hover:text-green-mid transition-colors flex items-center gap-1"
        >
          ← Neue Analyse starten
        </button>
      )}

      {/* URL */}
      <p className="text-[11px] text-ink-light mb-3 truncate">Analyse für: {url}</p>

      {/* Zusammenfassung */}
      {result.zusammenfassung && (
        <div className="bg-green-light border border-green/18 rounded-xl px-5 py-4 mb-5 text-sm text-green leading-relaxed">
          {result.zusammenfassung}
        </div>
      )}

      {/* Scores */}
      {result.scores && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {([
            ['gesamtbewertung', 'Gesamt'],
            ['lage', 'Lage'],
            ['preis_leistung', 'Preis/Leistung'],
            ['zustand', 'Zustand'],
          ] as const).map(([key, label]) => (
            <div key={key} className="bg-white border border-ink/10 rounded-xl p-4 text-center">
              <div className="text-[11px] text-ink-light font-medium tracking-wider uppercase mb-1">{label}</div>
              <div className="font-display text-2xl font-medium text-green">
                {result.scores[key]}
                <span className="text-sm text-ink-light">/10</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Objektdaten */}
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
                      <td className="px-3.5 py-2.5 text-ink-light text-xs font-medium tracking-wide w-[38%] whitespace-nowrap">{row.merkmal}</td>
                      <td className="px-3.5 py-2.5">
                        {isPrice ? <span className="font-display text-lg text-green font-medium">{row.wert}</span> : row.wert}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Standortanalyse */}
      {result.standortanalyse?.length > 0 && (
        <>
          <SectionHeader icon={<LocationIcon />} title="Standortanalyse" />
          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-green">
                  <th className="px-3.5 py-2.5 text-left text-cream/70 font-medium text-[11px] tracking-wider uppercase">Kategorie</th>
                  <th className="px-3.5 py-2.5 text-left text-cream/70 font-medium text-[11px] tracking-wider uppercase">Bewertung</th>
                  <th className="px-3.5 py-2.5 text-left text-cream/70 font-medium text-[11px] tracking-wider uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {result.standortanalyse.map((row, i) => (
                  <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                    <td className="px-3.5 py-2.5 text-ink-mid">{row.kategorie}</td>
                    <td className="px-3.5 py-2.5">{row.bewertung}</td>
                    <td className="px-3.5 py-2.5 text-ink-mid">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Marktdaten */}
      {result.marktdaten?.length > 0 && (
        <>
          <SectionHeader icon={<ChartIcon />} title="Marktdaten & Preisanalyse" />
          <div className="bg-white border border-ink/10 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-[13.5px]">
              <tbody>
                {result.marktdaten.map((row, i) => (
                  <tr key={i} className={`border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/50' : ''}`}>
                    <td className="px-3.5 py-2.5 text-ink-light text-xs font-medium tracking-wide w-[38%]">{row.kennzahl}</td>
                    <td className="px-3.5 py-2.5">
                      {row.wert}{' '}
                      <span className={`inline-block ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass(row.einschaetzung)}`}>
                        {badgeLabel(row.einschaetzung)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Risiken */}
      {options.risiken && result.risiken?.length > 0 && (
        <>
          <SectionHeader icon={<WarningIcon />} title="Risikohinweise" />
          <div className="bg-white border border-ink/10 rounded-xl px-4 py-3 mb-5">
            {result.risiken.map((risk, i) => (
              <div key={i} className="flex gap-2 items-start py-2 border-b border-ink/8 last:border-b-0 text-[13.5px]">
                <span className="text-red-500 shrink-0 mt-0.5">▲</span>
                <span className="text-ink-mid">{risk}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Verhandlungstipps */}
      {options.verhandlungstipps && result.verhandlungstipps?.length > 0 && (
        <>
          <SectionHeader icon={<BulbIcon />} title="Verhandlungstipps" />
          <div className="bg-white border border-ink/10 rounded-xl px-4 py-3 mb-5">
            {result.verhandlungstipps.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start py-2 border-b border-ink/8 last:border-b-0 text-[13.5px]">
                <span className="bg-green text-cream rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-ink-mid">{tip}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Makleranschreiben */}
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
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 mt-6">
      <div className="w-7 h-7 bg-green rounded-md flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="font-display text-base font-medium text-green">{title}</div>
    </div>
  )
}

const iconClass = "w-3.5 h-3.5 fill-none stroke-cream [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round]"

function HouseIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function LocationIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function ChartIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function WarningIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="m10.29 3.86-8.46 14.64A2 2 0 0 0 3.56 21h17.88a2 2 0 0 0 1.73-3l-8.46-14.64a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function BulbIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
}
function LetterIcon() {
  return <svg className={iconClass} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
