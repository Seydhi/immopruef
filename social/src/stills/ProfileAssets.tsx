import React from 'react'
import { AbsoluteFill, Img, staticFile } from 'remotion'
import { C, body, display } from '../brand'

// Profilbild (quadratisch, wird rund beschnitten): weißes Logo auf Grün
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: C.green, alignItems: 'center', justifyContent: 'center' }}>
    <Img src={staticFile('logo-white.png')} style={{ width: 400, height: 'auto' }} />
  </AbsoluteFill>
)

// Titelbild Facebook (1640×624). Wichtiges mittig halten: am Handy wird links/rechts beschnitten.
export const FbCover: React.FC = () => (
  <AbsoluteFill style={{ background: C.cream }}>
    <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: -320, top: -360, background: 'radial-gradient(circle, rgba(61,100,85,0.20), rgba(61,100,85,0) 70%)' }} />
    <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', right: -300, bottom: -420, background: 'radial-gradient(circle, rgba(184,151,90,0.26), rgba(184,151,90,0) 70%)' }} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: body, fontWeight: 700, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#fff', background: C.gold, padding: '8px 20px', borderRadius: 8 }}>Für alle Immobilienkäufer</div>
      <div style={{ fontFamily: display, fontWeight: 600, fontSize: 84, color: C.green, textAlign: 'center', lineHeight: 1.08 }}>Immobilienangebote besser einordnen</div>
      <div style={{ fontFamily: body, fontSize: 36, color: C.inkMid, textAlign: 'center' }}>Exposé prüfen lassen · Preis, Nebenkosten, Risiken · ab 19 €</div>
      <div style={{ marginTop: 10, fontFamily: body, fontWeight: 700, fontSize: 38, color: '#fff', background: C.green, padding: '14px 40px', borderRadius: 14 }}>immopruef.de</div>
    </AbsoluteFill>
  </AbsoluteFill>
)
