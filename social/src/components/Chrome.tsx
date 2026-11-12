import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, body, display } from '../brand'

// Ruhiger Hintergrund: Creme mit langsam wandernden Farbflächen
export const Background: React.FC = () => {
  const frame = useCurrentFrame()
  const a = Math.sin(frame / 90) * 60
  const b = Math.cos(frame / 110) * 80
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: -300 + a, top: -250, background: 'radial-gradient(circle, rgba(61,100,85,0.18), rgba(61,100,85,0) 70%)' }} />
      <div style={{ position: 'absolute', width: 1000, height: 1000, borderRadius: '50%', right: -420 + b, bottom: -300, background: 'radial-gradient(circle, rgba(184,151,90,0.22), rgba(184,151,90,0) 70%)' }} />
    </AbsoluteFill>
  )
}

// Fortschrittsbalken oben (hält Zuschauer)
export const Progress: React.FC = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: C.gold }} />
  )
}

// Kleines Marken-Etikett oben links
export const Brand: React.FC<{ light?: boolean }> = ({ light }) => (
  <div style={{ position: 'absolute', left: 70, top: 70, display: 'flex', alignItems: 'center', gap: 16 }}>
    <Img src={staticFile(light ? 'logo-white.png' : 'logo-c.png')} style={{ width: 60, height: 60 }} />
    <div style={{ fontFamily: display, fontSize: 40, color: light ? '#fff' : C.green, fontWeight: 600 }}>
      Immo<span style={{ color: C.gold }}> Prüf</span>
    </div>
  </div>
)

// Überschrift über der Bildschirm-Karte: Kicker + Titel + Unterzeile, Wort für Wort
export const Caption: React.FC<{ from: number; to: number; kicker?: string; title: string; sub?: string; big?: boolean }> = ({ from, to, kicker, title, sub, big }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < from - 2 || frame > to + 12) return null
  const out = interpolate(frame, [to, to + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const outY = interpolate(frame, [to, to + 10], [0, -30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const words = title.split(' ')
  const subIn = interpolate(frame, [from + 10 + words.length * 2, from + 22 + words.length * 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const kickIn = spring({ frame: frame - from, fps, config: { damping: 200 }, durationInFrames: 14 })
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, top: 175, opacity: out, transform: `translateY(${outY}px)` }}>
      {kicker ? (
        <div style={{ display: 'inline-block', fontFamily: body, fontWeight: 700, fontSize: 30, letterSpacing: 3, textTransform: 'uppercase', color: '#fff', background: C.gold, padding: '8px 18px', borderRadius: 8, marginBottom: 22, opacity: kickIn, transform: `translateX(${(1 - kickIn) * -40}px)` }}>{kicker}</div>
      ) : null}
      <div style={{ fontFamily: display, fontWeight: 600, fontSize: big ? 96 : 74, lineHeight: 1.08, color: C.ink }}>
        {words.map((w, i) => {
          const p = spring({ frame: frame - from - i * 2, fps, config: { damping: 18, stiffness: 160 }, durationInFrames: 18 })
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: '0.24em', opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>{w}</span>
          )
        })}
      </div>
      {sub ? (
        <div style={{ fontFamily: body, fontSize: 38, lineHeight: 1.35, color: C.inkMid, marginTop: 18, opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)` }}>{sub}</div>
      ) : null}
    </div>
  )
}

// Hinweis unten (z. B. "Beispiel mit fiktiven Daten")
export const Footnote: React.FC<{ text: string; from?: number; to?: number }> = ({ text, from = 0, to = 99999 }) => {
  const frame = useCurrentFrame()
  if (frame < from || frame > to) return null
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1630, textAlign: 'center', fontFamily: body, fontSize: 26, color: C.inkLight }}>{text}</div>
  )
}

// Abschluss: grüne Fläche, Logo, Angebot, Domain
export const EndCard: React.FC<{ from: number; line1: string; line2: string; note?: string }> = ({ from, line1, line2, note = 'KI-gestützte Ersteinschätzung, kein Gutachten · Demo mit fiktiven Daten' }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < from) return null
  const wipe = interpolate(frame, [from, from + 16], [0, 100], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })
  const p = (d: number) => spring({ frame: frame - from - d, fps, config: { damping: 200 }, durationInFrames: 20 })
  return (
    <AbsoluteFill style={{ background: C.green, clipPath: `circle(${wipe * 1.5}% at 50% 60%)` }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34, padding: 90 }}>
        <Img src={staticFile('logo-white.png')} style={{ width: 170, height: 170, opacity: p(6), transform: `scale(${0.7 + 0.3 * p(6)})` }} />
        <div style={{ fontFamily: display, fontSize: 92, color: '#fff', fontWeight: 600, textAlign: 'center', lineHeight: 1.1, opacity: p(10), transform: `translateY(${(1 - p(10)) * 30}px)` }}>{line1}</div>
        <div style={{ fontFamily: body, fontSize: 40, color: C.goldLight, textAlign: 'center', opacity: p(16) }}>{line2}</div>
        <div style={{ marginTop: 30, fontFamily: body, fontWeight: 700, fontSize: 52, color: C.green, background: '#fff', padding: '22px 54px', borderRadius: 18, opacity: p(22), transform: `scale(${0.85 + 0.15 * p(22)})` }}>immopruef.de</div>
        <div style={{ position: 'absolute', bottom: 120, fontFamily: body, fontSize: 24, color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '0 90px' }}>{note}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
