import React from 'react'
import { AbsoluteFill } from 'remotion'
import { Background, Brand, Caption, EndCard, Footnote, Progress } from '../components/Chrome'
import { Highlight, Screen, Tap, mark } from '../components/Screen'

// Format 2: Exposé-Check in 25 Sekunden (750 Frames)
export const EXPOSE_CHECK_FRAMES = 750

export const ExposeCheck: React.FC = () => {
  const baujahr = mark('expose', 'baujahr')
  const energie = mark('expose', 'energie')
  const text = mark('expose', 'beschreibung')
  const bad = mark('expose', 'bad')
  return (
    <AbsoluteFill>
      <Background />
      <Brand />
      <Caption from={8} to={95} big kicker="Exposé-Check" title="3 Warnsignale in diesem Exposé" sub="Ein Beispiel-Exposé, Zeile für Zeile geprüft." />
      <Screen
        shot="expose"
        enterAt={30}
        keys={[
          { f: 0, cy: 300 },
          { f: 100, cy: 300 },
          { f: 140, cy: 620 },
          { f: 175, cy: baujahr.y + 40, zoom: 1.15, cx: 210 },
          { f: 280, cy: baujahr.y + 40, zoom: 1.15, cx: 210 },
          { f: 310, cy: energie.y, zoom: 1.15, cx: 210 },
          { f: 410, cy: energie.y, zoom: 1.15, cx: 210 },
          { f: 445, cy: text.y + 45, zoom: 1.3 },
          { f: 505, cy: text.y + 45, zoom: 1.3 },
          { f: 540, cy: bad.y + 65, zoom: 1.9, cx: bad.x + 91 },
          { f: 610, cy: bad.y + 65, zoom: 1.9, cx: bad.x + 91 },
          { f: 640, cy: 300, zoom: 1 },
        ]}
      >
        {(s) => (
          <>
            <Highlight box={baujahr} from={185} to={300} scale={s} />
            <Tap x={baujahr.x + 20} y={baujahr.y + 8} at={182} scale={s} />
            <Highlight box={energie} from={318} to={430} scale={s} />
            <Tap x={energie.x + 40} y={energie.y + 8} at={316} scale={s} />
            <Highlight box={text} from={452} to={520} scale={s} pad={4} />
            <Highlight box={bad} from={548} to={620} scale={s} pad={3} />
          </>
        )}
      </Screen>
      <Caption from={110} to={160} title="Auf den ersten Blick: alles schön." />
      <Caption from={175} to={295} kicker="Warnsignal 1 / 3" title="Baujahr fehlt" sub="Ohne Baujahr lässt sich der Sanierungsbedarf kaum abschätzen." />
      <Caption from={310} to={428} kicker="Warnsignal 2 / 3" title="Energieausweis „in Erstellung“" sub="Er muss spätestens bei der Besichtigung vorliegen. Bis dahin bleiben die Heizkosten offen." />
      <Caption from={445} to={615} kicker="Warnsignal 3 / 3" title="„Charme vergangener Jahrzehnte“" sub="Heißt oft: Das Bad ist alt. Komplett neu kostet es meist 12.000 bis 20.000 €." />
      <Caption from={632} to={690} title="Das prüft ImmoPrüf für Sie." sub="Link oder PDF einfügen, Ersteinschätzung per E-Mail." />
      <Footnote text="Beispiel-Exposé · Adresse, Anbieter und Angaben frei erfunden" from={30} to={690} />
      <EndCard from={690} line1="Exposé prüfen lassen" line2="Ersteinschätzung ab 19 € · Ergebnis per E-Mail" />
      <Progress />
    </AbsoluteFill>
  )
}
