import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Background, Brand, Caption, EndCard, Footnote, Progress } from '../components/Chrome'
import { C, body, display } from '../brand'

// Format 4: Rechner in Aktion – Kaufnebenkosten je Bundesland (660 Frames = 22 s)
export const NEBENKOSTEN_FRAMES = 660

// Grunderwerbsteuer Stand 2026 (identisch mit src/lib/kaufnebenkosten.ts der Website)
const GREST: [string, number][] = [
  ['Baden-Württemberg', 5.0], ['Bayern', 3.5], ['Berlin', 6.0], ['Brandenburg', 6.5], ['Bremen', 5.5], ['Hamburg', 5.5],
  ['Hessen', 6.0], ['Mecklenburg-Vorpommern', 6.0], ['Niedersachsen', 5.0], ['Nordrhein-Westfalen', 6.5], ['Rheinland-Pfalz', 5.0],
  ['Saarland', 6.5], ['Sachsen', 5.5], ['Sachsen-Anhalt', 5.0], ['Schleswig-Holstein', 6.5], ['Thüringen', 5.0],
]
const PREIS = 400000
const NOTAR_GRUNDBUCH = 2.0
const MAKLER = 3.57
const rows = GREST.map(([land, g]) => ({ land, g, sum: Math.round((PREIS * (g + NOTAR_GRUNDBUCH + MAKLER)) / 100) })).sort((a, b) => b.sum - a.sum)
const MAX = rows[0].sum
const MIN = rows[rows.length - 1].sum
const eur = (n: number) => n.toLocaleString('de-DE') + ' €'

const Bars: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const top = 640
  const rowH = 54
  const focus = frame > from + 150
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top }}>
      {rows.map((r, i) => {
        const p = spring({ frame: frame - from - i * 4, fps, config: { damping: 200 }, durationInFrames: 26 })
        const value = Math.round(r.sum * p)
        const isMin = r.sum === MIN
        const isMax = r.sum === MAX
        const dim = focus && !isMin && !isMax ? 0.35 : 1
        return (
          <div key={r.land} style={{ position: 'absolute', top: i * rowH, left: 0, right: 0, height: rowH - 12, display: 'flex', alignItems: 'center', opacity: dim }}>
            <div style={{ width: 330, fontFamily: body, fontSize: 27, color: C.ink, fontWeight: isMin || isMax ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.land}</div>
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: `${(r.sum / MAX) * 72 * p}%`, borderRadius: 8, background: isMin ? C.greenMid : isMax ? C.red : C.gold }} />
              <div style={{ position: 'absolute', left: `${(r.sum / MAX) * 72 * p + 2}%`, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: body, fontWeight: 700, fontSize: 27, color: C.ink, opacity: p }}>{eur(value)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const Diff: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < from || frame > to + 10) return null
  const p = spring({ frame: frame - from, fps, config: { damping: 14, stiffness: 140 }, durationInFrames: 24 })
  const n = Math.round(interpolate(frame, [from, from + 30], [0, MAX - MIN], { extrapolateRight: 'clamp' }))
  const out = interpolate(frame, [to, to + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 1570, height: 0, opacity: out }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -40, textAlign: 'center', transform: `scale(${0.6 + 0.4 * p})` }}>
        <span style={{ fontFamily: display, fontSize: 64, fontWeight: 700, color: C.green, background: '#fff', padding: '14px 34px', borderRadius: 18, boxShadow: '0 20px 50px rgba(26,26,24,0.15)' }}>{eur(n)} Unterschied</span>
      </div>
    </div>
  )
}

export const NebenkostenLaender: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Brand />
    <Caption from={8} to={560} kicker="Kaufpreis 400.000 €" title="So viel Nebenkosten zahlen Sie je Bundesland" sub="Grunderwerbsteuer, Notar und Grundbuch, Makleranteil 3,57 %." />
    <Bars from={70} />
    <Diff from={250} to={560} />
    <Footnote text="Grunderwerbsteuer Stand 2026 · Notar + Grundbuch ca. 2 % · gerundet" from={70} to={570} />
    <EndCard from={570} line1="Alle 16 Länder vergleichen" line2="Kostenloser Kaufnebenkosten-Rechner" note="Werte gerundet · Stand 2026" />
    <Progress />
  </AbsoluteFill>
)
