import { useSEO, breadcrumbSchema } from '../../lib/useSEO'

// Eigenständige Widerrufsbelehrung unter /widerruf — inhaltlich identisch mit
// § 5 der AGB (dort bleibt sie ebenfalls stehen). Eine eigene, direkt
// verlinkbare URL ist abmahnsicherer als ein Link "in die AGB".

export default function Widerruf() {
  useSEO({
    title: 'Widerrufsbelehrung',
    description:
      'Widerrufsbelehrung für ImmoPrüf-Analysen: 14 Tage Widerrufsrecht, Folgen des Widerrufs und vorzeitiges Erlöschen bei digitalen Inhalten nach § 356 Abs. 5 BGB.',
    canonical: 'https://immopruef.de/widerruf',
    type: 'website',
    jsonLd: [
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Widerrufsbelehrung', url: 'https://immopruef.de/widerruf' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto text-sm text-ink-mid leading-relaxed">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Widerrufsbelehrung</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
        <p className="font-semibold text-ink text-sm mb-2">Widerrufsrecht</p>
        <p>
          Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu
          widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsschlusses.
        </p>
        <p className="mt-2">
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Neuralpfad UG (haftungsbeschränkt),
          Auf dem Paß 10, 27711 Osterholz-Scharmbeck, E-Mail: info@immopruef.com) mittels einer
          eindeutigen Erklärung (z.B. per E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren.
        </p>
        <p className="mt-2">
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
          Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="font-semibold text-ink text-sm mb-2">Folgen des Widerrufs</p>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
          erhalten haben, unverzüglich und spätestens binnen 14 Tagen ab dem Tag zurückzuzahlen,
          an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist. Für diese
          Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen
          Transaktion eingesetzt haben.
        </p>
      </div>

      <p className="mt-4">
        <strong className="text-ink">Vorzeitiges Erlöschen des Widerrufsrechts:</strong> Das Widerrufsrecht
        erlischt bei einem Vertrag über die Lieferung von nicht auf einem körperlichen
        Datenträger befindlichen digitalen Inhalten, wenn der Unternehmer mit der Ausführung
        des Vertrags begonnen hat, nachdem der Verbraucher
      </p>
      <ul className="list-none pl-4 space-y-1 mt-2">
        <li>a) ausdrücklich zugestimmt hat, dass der Unternehmer mit der Ausführung des
          Vertrags vor Ablauf der Widerrufsfrist beginnt, und</li>
        <li>b) seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn
          der Ausführung des Vertrags sein Widerrufsrecht verliert (§ 356 Abs. 5 BGB).</li>
      </ul>

      <p className="mt-4">
        <strong className="text-ink">Hinweis:</strong> Mit dem Setzen der entsprechenden Checkbox im
        Bestellvorgang und dem Klick auf "Kostenpflichtig bestellen" geben Sie diese
        ausdrückliche Zustimmung ab und bestätigen Ihre Kenntnis vom Verlust des
        Widerrufsrechts. Die Ausführung des Vertrags (Erstellung der Analyse) beginnt
        unmittelbar nach erfolgreicher Zahlung. Ihr Widerrufsrecht erlischt daher mit Beginn
        der Analyseerstellung.
      </p>

      <p className="mt-6 text-[12px] text-ink-light">
        Diese Widerrufsbelehrung ist ebenfalls Bestandteil unserer{' '}
        <a href="/agb" className="text-green hover:text-green-mid underline">AGB (§ 5)</a>.
      </p>
    </div>
  )
}
