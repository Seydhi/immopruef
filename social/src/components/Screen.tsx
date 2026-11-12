import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import shots from '../shots.json'
import { C, SCREEN } from '../brand'

export type ShotName = keyof typeof shots
export type Box = { x: number; y: number; w: number; h: number }

// Kamera-Keyframe: f = Frame, cy = CSS-Pixel-Mitte (vertikal), zoom, cx optional
export type Key = { f: number; cy: number; zoom?: number; cx?: number }

const ease = Easing.bezier(0.65, 0, 0.35, 1)

export function camAt(keys: Key[], frame: number) {
  if (frame <= keys[0].f) return { cy: keys[0].cy, zoom: keys[0].zoom ?? 1, cx: keys[0].cx ?? 215 }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return {
        cy: a.cy + (b.cy - a.cy) * t,
        zoom: (a.zoom ?? 1) + ((b.zoom ?? 1) - (a.zoom ?? 1)) * t,
        cx: (a.cx ?? 215) + ((b.cx ?? 215) - (a.cx ?? 215)) * t,
      }
    }
  }
  const l = keys[keys.length - 1]
  return { cy: l.cy, zoom: l.zoom ?? 1, cx: l.cx ?? 215 }
}

export const mark = (shot: ShotName, name: string): Box => {
  const m = (shots[shot].marks as Record<string, Box>)[name]
  if (!m) throw new Error(`Markierung fehlt: ${shot}/${name}`)
  return m
}

// Zeigt einen Screenshot in der Bildschirm-Karte mit Kamerafahrt. Kinder werden in
// CSS-Koordinaten der Seite gezeichnet und bewegen sich mit der Kamera.
export const Screen: React.FC<{
  shot: ShotName
  keys: Key[]
  enterAt?: number
  children?: (scale: number) => React.ReactNode
  label?: string
}> = ({ shot, keys, enterAt = 0, children, label }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const meta = shots[shot]
  const k = SCREEN.w / SCREEN.css
  const cam = camAt(keys, frame)
  const s = k * cam.zoom
  const vw = SCREEN.w / s
  const vh = SCREEN.h / s
  const left = Math.max(0, Math.min(meta.width - vw, cam.cx - vw / 2))
  const top = Math.max(0, Math.min(meta.height - vh, cam.cy - vh / 2))

  const enter = spring({ frame: frame - enterAt, fps, config: { damping: 200 }, durationInFrames: 24 })
  const ty = interpolate(enter, [0, 1], [140, 0])
  const rot = interpolate(enter, [0, 1], [8, 0])

  return (
    <div
      style={{
        position: 'absolute',
        left: SCREEN.x,
        top: SCREEN.y,
        width: SCREEN.w,
        height: SCREEN.h,
        borderRadius: 44,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 40px 90px rgba(26,26,24,0.28), 0 0 0 10px rgba(255,255,255,0.65)',
        opacity: enter,
        transform: `perspective(1600px) translateY(${ty}px) rotateX(${rot}deg)`,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: meta.width, height: meta.height, transformOrigin: '0 0', transform: `scale(${s}) translate(${-left}px, ${-top}px)` }}>
        {meta.tiles.map((t) => (
          <Img key={t.file} src={staticFile(t.file)} style={{ position: 'absolute', left: 0, top: t.y, width: meta.width, height: t.h }} />
        ))}
        {children?.(s)}
      </div>
      {label ? (
        <div style={{ position: 'absolute', right: 18, bottom: 18, background: 'rgba(26,26,24,0.72)', color: '#fff', fontSize: 22, padding: '8px 16px', borderRadius: 99, fontFamily: 'sans-serif' }}>{label}</div>
      ) : null}
    </div>
  )
}

// Markierungsrahmen, zeichnet sich von links nach rechts auf
export const Highlight: React.FC<{ box: Box; from: number; to?: number; scale: number; pad?: number; color?: string }> = ({ box, from, to = 99999, scale, pad = 6, color = C.gold }) => {
  const frame = useCurrentFrame()
  const p = interpolate(frame, [from, from + 12], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const out = interpolate(frame, [to, to + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  if (frame < from) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x - pad,
        top: box.y - pad,
        width: box.w + pad * 2,
        height: box.h + pad * 2,
        border: `${4 / scale}px solid ${color}`,
        borderRadius: 8,
        background: 'rgba(184,151,90,0.16)',
        boxShadow: `0 0 ${18 / scale}px rgba(184,151,90,0.55)`,
        clipPath: `inset(0 ${100 - p}% 0 0)`,
        opacity: out,
      }}
    />
  )
}

// Finger-Tipp mit Welle
export const Tap: React.FC<{ x: number; y: number; at: number; scale: number }> = ({ x, y, at, scale }) => {
  const frame = useCurrentFrame()
  const d = frame - at
  if (d < -10 || d > 26) return null
  const appear = interpolate(d, [-10, 0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const press = interpolate(d, [0, 4, 10], [1, 0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring = interpolate(d, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fade = interpolate(d, [16, 26], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r = 26 / scale * 1.4
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: fade }}>
      <div style={{ position: 'absolute', left: -r * (1 + ring * 1.6), top: -r * (1 + ring * 1.6), width: r * 2 * (1 + ring * 1.6), height: r * 2 * (1 + ring * 1.6), borderRadius: '50%', border: `${3 / scale}px solid rgba(45,74,62,${0.6 * (1 - ring)})` }} />
      <div style={{ position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'rgba(45,74,62,0.35)', border: `${3 / scale}px solid rgba(255,255,255,0.9)`, transform: `scale(${press * appear})` }} />
    </div>
  )
}

export const Fill = AbsoluteFill
