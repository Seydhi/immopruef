import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Background, Brand, Caption, EndCard, Footnote, Progress } from '../components/Chrome'
import { Highlight, Screen, Tap, mark } from '../components/Screen'
import { C, body, display } from '../brand'

// Format 1: Exposé rein, Analyse raus (780 Frames = 26 s)
export const ANALYSE_DEMO_FRAMES = 780

const URL_TEXT = 'musterimmobilien.de/expose/B-2711'

// Getippter Link im Eingabefeld der Startseite
const Typed: React.FC<{ from: number; scale: number }> = ({ from, scale }) => {
  const frame = useCurrentFrame()
  const box = mark('home', 'input:input[type=url]')
  const n = Math.floor(interpolate(frame, [from, from + 40], [0, URL_TEXT.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  if (frame < from) return null
  const caret = Math.floor(frame / 8) % 2 === 0
  return (
    <div style={{ position: 'absolute', left: box.x + 2, top: box.y + 2, width: box.w - 4, height: box.h - 4, background: '#fff', borderRadius: 10, border: `${2 / scale}px solid ${C.green}`, display: 'flex', alignItems: 'center', paddingLeft: 14, fontFamily: body, fontSize: 15, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {URL_TEXT.slice(0, n)}
      <span style={{ opacity: caret ? 1 : 0, marginLeft: 1 }}>|</span>
    </div>
  )
}

// Übergang „Wenige Minuten später“
const Later: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame()
  if (frame < from || frame > to) return null
  const o = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0])
  return (
    <AbsoluteFill style={{ background: C.green, opacity: o, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: display, fontSize: 90, color: '#fff', fontWeight: 600 }}>Wenige Minuten später …</div>
    </AbsoluteFill>
  )
}

export const AnalyseDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const input = mark('home', 'input:input[type=url]')
  const linkTab = mark('home', 'btn:Link zum Inserat')
  const sec = (name: string) => mark('analyse', name)
  const cardH = 430
  const box = (name: string, h = cardH) => ({ x: 24, y: sec(name).y - 30, w: 382, h })
  const showHome = frame < 250
  return (
    <AbsoluteFill>
      <Background />
      <Brand />
      <Caption from={8} to={100} big kicker="So funktioniert's" title="Exposé rein. Klarheit raus." sub="Was ImmoPrüf aus einem Inserat macht, in 25 Sekunden." />
      {showHome ? (
        <Screen
          shot="home"
          enterAt={30}
          keys={[
            { f: 0, cy: 420 },
            { f: 105, cy: 420 },
            { f: 150, cy: linkTab.y + 60, zoom: 1.35 },
            { f: 250, cy: linkTab.y + 60, zoom: 1.35 },
          ]}
        >
          {(s) => (
            <>
              <Tap x={linkTab.x + 70} y={linkTab.y + 20} at={160} scale={s} />
              <Tap x={input.x + 60} y={input.y + 22} at={180} scale={s} />
              <Typed from={186} scale={s} />
            </>
          )}
        </Screen>
      ) : (
        <Screen
          shot="analyse"
          enterAt={262}
          label="Beispiel-Analyse"
          keys={[
            { f: 250, cy: 450 },
            { f: 300, cy: 450 },
            { f: 335, cy: sec('Wo liegt der Preis?').y + 170, zoom: 1.1 },
            { f: 420, cy: sec('Wo liegt der Preis?').y + 170, zoom: 1.1 },
            { f: 455, cy: sec('Was kostet es insgesamt?').y + 170, zoom: 1.1 },
            { f: 530, cy: sec('Was kostet es insgesamt?').y + 170, zoom: 1.1 },
            { f: 565, cy: sec('Risiken & Fallstricke').y + 170, zoom: 1.1 },
            { f: 630, cy: sec('Risiken & Fallstricke').y + 170, zoom: 1.1 },
            { f: 665, cy: sec('Vorlage: Makleranschreiben').y + 170, zoom: 1.1 },
            { f: 720, cy: sec('Vorlage: Makleranschreiben').y + 170, zoom: 1.1 },
          ]}
        >
          {(s) => (
            <>
              <Highlight box={box('Wo liegt der Preis?')} from={340} to={425} scale={s} pad={0} />
              <Highlight box={box('Was kostet es insgesamt?')} from={460} to={535} scale={s} pad={0} />
              <Highlight box={box('Risiken & Fallstricke')} from={570} to={635} scale={s} pad={0} />
              <Highlight box={box('Vorlage: Makleranschreiben')} from={670} to={725} scale={s} pad={0} />
            </>
          )}
        </Screen>
      )}
      <Caption from={150} to={240} title="Link zum Inserat einfügen" sub="Oder das Exposé als PDF hochladen." />
      <Later from={240} to={275} />
      <Caption from={300} to={425} kicker="1 · Preis" title="Ist der Preis fair?" sub="Vergleich mit regionalen Preisen und Bodenrichtwert." />
      <Caption from={445} to={535} kicker="2 · Kosten" title="Was kostet es wirklich?" sub="Kaufnebenkosten und Finanzierung in drei Szenarien." />
      <Caption from={555} to={635} kicker="3 · Risiken" title="Was fehlt im Exposé?" sub="Offene Punkte und Fragen für die Besichtigung." />
      <Caption from={655} to={725} kicker="4 · Verhandeln" title="Fertiges Makleranschreiben" sub="Mit Argumenten für den Preis." />
      <Footnote text="Beispiel-Analyse mit fiktiven Daten" from={262} to={730} />
      <EndCard from={730} line1="Ihr Exposé prüfen" line2="Ersteinschätzung ab 19 € · Ergebnis per E-Mail" />
      <Progress />
    </AbsoluteFill>
  )
}
