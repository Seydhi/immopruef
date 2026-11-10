// Stand- und Quellenangaben für Rechner- und Länderseiten.
// STAND_ISO nur anheben, wenn die Inhalte (Steuersätze, Gebühren, Formeln) tatsächlich geprüft wurden.
export const STAND_ISO = '2026-11-10'
export const STAND_TEXT = '10. November 2026'

export interface Quelle { label: string; url: string }

const GII = 'https://www.gesetze-im-internet.de'
const BUNDESBANK: Quelle = {
  label: 'Deutsche Bundesbank: Zinsstatistik',
  url: 'https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen',
}
const KNK: Quelle[] = [
  { label: '§ 11 GrEStG (Steuersatz)', url: `${GII}/grestg_1983/__11.html` },
  { label: 'Art. 105 Abs. 2a GG (Ländersteuersätze)', url: `${GII}/gg/art_105.html` },
  { label: 'GNotKG (Notar- und Gerichtskosten)', url: `${GII}/gnotkg/` },
  { label: '§ 656c BGB (Teilung der Maklerprovision)', url: `${GII}/bgb/__656c.html` },
]

export const QUELLEN = {
  kaufnebenkosten: KNK,
  notar: [
    { label: '§ 34 GNotKG (Wertgebühren)', url: `${GII}/gnotkg/__34.html` },
    { label: 'GNotKG Anlage 1 (Kostenverzeichnis)', url: `${GII}/gnotkg/anlage_1.html` },
    { label: 'GNotKG Anlage 2 (Gebührentabelle B)', url: `${GII}/gnotkg/anlage_2.html` },
  ],
  bodenrichtwert: [
    { label: '§ 196 BauGB (Bodenrichtwerte)', url: `${GII}/bbaug/__196.html` },
    { label: 'BORIS-D (Bodenrichtwertinformationssystem der Länder)', url: 'https://www.bodenrichtwerte-boris.de/' },
  ],
  instandhaltung: [
    { label: '§ 19 WEG (Erhaltungsrücklage)', url: `${GII}/woeigg/__19.html` },
  ],
  wohnflaeche: [
    { label: 'Wohnflächenverordnung (WoFlV)', url: `${GII}/woflv/` },
    { label: '§ 4 WoFlV (Anrechnung der Grundflächen)', url: `${GII}/woflv/__4.html` },
  ],
  finanzierung: [BUNDESBANK],
} satisfies Record<string, Quelle[]>
