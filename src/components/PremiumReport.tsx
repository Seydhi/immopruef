import type { PremiumReport as PremiumReportType } from '../lib/types'

interface PremiumReportProps {
  report: PremiumReportType
}

export default function PremiumReport({ report }: PremiumReportProps) {
  if (!report) return null

  const handlePdfDownload = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-gold/30 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <span className="font-display text-lg font-medium text-amber-900">Kaufentscheidungs-Report</span>
              <span className="bg-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">Premium</span>
            </div>
            <div className="text-xs text-amber-700">Report-Nr. {report.reportNummer || '—'} · Erstellt am {report.reportDatum || '—'}</div>
          </div>
          <button
            onClick={handlePdfDownload}
            className="bg-green text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-mid transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            PDF herunterladen
          </button>
        </div>
      </div>

      {/* ════ NEU: Stärken & Schwächen (Berater-Style — ZUERST!) ════ */}
      {report.staerkenSchwaechenNarrativ && <PremiumSection icon="⚖️" title="Stärken & Schwächen — meine Einschätzung">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Stärken */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5">
            <div className="text-emerald-800 text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">✓ Stärken</div>
            <div className="space-y-3">
              {report.staerkenSchwaechenNarrativ.staerken.map((s, i) => (
                <div key={i} className="border-b border-emerald-200/50 last:border-b-0 pb-2.5 last:pb-0">
                  <div className="text-[13px] font-medium text-ink mb-1 flex items-start gap-2">
                    <span className="text-emerald-600 shrink-0">▸</span>
                    <span className="flex-1">{s.punkt}</span>
                    <EinflussBadge einfluss={s.einfluss} />
                  </div>
                  <div className="text-xs text-ink-mid leading-relaxed pl-4">{s.begruendung}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Schwächen */}
          <div className="bg-red-50/60 border border-red-200 rounded-lg p-3.5">
            <div className="text-red-800 text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">⚠ Schwächen / Risiken</div>
            <div className="space-y-3">
              {report.staerkenSchwaechenNarrativ.schwaechen.map((s, i) => (
                <div key={i} className="border-b border-red-200/50 last:border-b-0 pb-2.5 last:pb-0">
                  <div className="text-[13px] font-medium text-ink mb-1 flex items-start gap-2">
                    <span className="text-red-600 shrink-0">▸</span>
                    <span className="flex-1">{s.punkt}</span>
                    <EinflussBadge einfluss={s.einfluss} />
                  </div>
                  <div className="text-xs text-ink-mid leading-relaxed pl-4">{s.begruendung}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Konkrete Empfehlung */}
        <div className="bg-green text-cream rounded-xl p-4">
          <div className="text-cream/70 text-[10px] tracking-wider uppercase mb-1">🎯 Meine Empfehlung</div>
          <div className="text-sm leading-relaxed">{report.staerkenSchwaechenNarrativ.empfehlung}</div>
        </div>
      </PremiumSection>}

      {/* ════ NEU: Marktband-Visualisierung ════ */}
      {report.marktband && <PremiumSection icon="📊" title="Wo liegt der Preis im Markt?">
        {/* Quartil-Balken */}
        <div className="bg-white border border-ink/10 rounded-lg p-4 mb-3">
          <div className="text-xs text-ink-light mb-3">Preisband Stadtteil ({report.marktband.einheit})</div>
          <div className="relative h-10 mb-1.5 rounded-md overflow-hidden flex">
            <div className="bg-emerald-300/70 flex-1" />
            <div className="bg-yellow-300/70 flex-1" />
            <div className="bg-orange-300/70 flex-1" />
            <div className="bg-red-300/70 flex-1" />
            {/* Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-ink"
              style={{ left: `${Math.min(98, Math.max(2, report.marktband.diesesObjekt.positionProzent))}%` }}
            >
              <div className="absolute -top-1 -left-2 w-4 h-4 bg-ink rounded-full ring-2 ring-cream" />
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink text-cream text-[10px] font-bold px-2 py-0.5 rounded">
                {report.marktband.diesesObjekt.wert}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 text-[10px] text-ink-light text-center mt-8">
            <div><div className="font-medium text-ink">{report.marktband.guenstig.wert}</div><div className="leading-tight mt-0.5">{report.marktband.guenstig.label}</div></div>
            <div><div className="font-medium text-ink">{report.marktband.durchschnittLow.wert}</div><div className="leading-tight mt-0.5">{report.marktband.durchschnittLow.label}</div></div>
            <div><div className="font-medium text-ink">{report.marktband.durchschnittHigh.wert}</div><div className="leading-tight mt-0.5">{report.marktband.durchschnittHigh.label}</div></div>
            <div><div className="font-medium text-ink">{report.marktband.top.wert}</div><div className="leading-tight mt-0.5">{report.marktband.top.label}</div></div>
          </div>
        </div>
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5">
          <div className="text-xs text-amber-900 font-medium mb-1">{report.marktband.diesesObjekt.einordnung}</div>
          <div className="text-[12px] text-ink-mid leading-relaxed">{report.marktband.einschaetzung}</div>
        </div>
      </PremiumSection>}

      {/* ════ NEU: Preistrend Historisch ════ */}
      {report.preistrendHistorisch && <PremiumSection icon="📈" title="Preisentwicklung Stadtteil — historisch">
        <div className="bg-white border border-ink/10 rounded-lg p-4 mb-3">
          {/* Mini-Bar-Chart */}
          {(() => {
            const max = Math.max(...report.preistrendHistorisch.zeitreihe.map(p => p.wertNum))
            const min = Math.min(...report.preistrendHistorisch.zeitreihe.map(p => p.wertNum))
            const range = max - min || 1
            return (
              <div className="flex items-end gap-2 h-32 mb-2">
                {report.preistrendHistorisch.zeitreihe.map((p, i) => {
                  const heightPct = 30 + ((p.wertNum - min) / range) * 70
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] font-medium text-ink-mid">{p.wert.split(' ')[0]}</div>
                      <div
                        className="w-full bg-green/80 rounded-t-sm hover:bg-green transition-colors"
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="text-[10px] text-ink-light">{p.jahr}</div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-ink/8 text-xs">
            <div>
              <span className="text-ink-light">Trend:</span>{' '}
              <TrendBadge trend={report.preistrendHistorisch.trend} />
            </div>
            <div className="font-medium text-green">{report.preistrendHistorisch.veraenderungProzent}</div>
          </div>
        </div>
        <div className="text-[12px] text-ink-mid leading-relaxed bg-amber-50/30 border border-amber-100 rounded-lg p-3">
          {report.preistrendHistorisch.prognoseHinweis}
        </div>
      </PremiumSection>}

      {/* ════ NEU: Maklerprofil ════ */}
      {report.maklerProfil && <PremiumSection icon="👔" title="Makler-Check & Seriositätsprüfung">
        {report.maklerProfil.art === 'privatverkauf' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="font-medium text-blue-900 mb-2">📋 Privatverkauf</div>
            <div className="text-xs text-blue-800 leading-relaxed">{report.maklerProfil.fazit}</div>
          </div>
        ) : (
          <>
            <div className="bg-white border border-ink/10 rounded-lg overflow-hidden mb-3 text-[13px]">
              <Row label="Name" value={report.maklerProfil.name} i={0} />
              <Row label="Gegründet" value={report.maklerProfil.gegruendet} i={1} />
              <Row label="Mitarbeiter" value={report.maklerProfil.mitarbeiter} i={2} />
              <Row label="Qualifikation" value={report.maklerProfil.qualifikation} i={3} />
              <Row label="Sitz" value={report.maklerProfil.sitz} i={4} />
              <Row label="Ansprechpartner" value={report.maklerProfil.ansprechpartner} i={5} />
              {report.maklerProfil.ranking && report.maklerProfil.ranking !== '—' && (
                <Row label="Ranking" value={report.maklerProfil.ranking} i={6} />
              )}
            </div>
            {/* Bewertungen */}
            {report.maklerProfil.bewertungen.length > 0 && (
              <>
                <SubHeading>Bewertungen auf Plattformen</SubHeading>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {report.maklerProfil.bewertungen.map((b, i) => (
                    <div key={i} className="bg-white border border-ink/10 rounded-lg p-3 text-center">
                      <div className="text-xs text-ink-light mb-1">{b.plattform}</div>
                      <div className="font-display text-lg font-medium text-amber-600">{b.score}</div>
                      <div className="text-[10px] text-ink-light">{b.anzahl}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* Red Flags */}
            {report.maklerProfil.redFlags.length > 0 && (
              <div className={`rounded-lg p-3 mb-3 text-xs ${
                report.maklerProfil.redFlags[0].toLowerCase().includes('keine') || report.maklerProfil.redFlags[0].toLowerCase().includes('solide')
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="font-medium mb-1">{
                  report.maklerProfil.redFlags[0].toLowerCase().includes('keine') ? '✓ Keine Red Flags' : '🚩 Red Flags'
                }</div>
                {report.maklerProfil.redFlags.map((f, i) => (
                  <div key={i} className="leading-relaxed">{f}</div>
                ))}
              </div>
            )}
            {/* Berater-Fazit */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5">
              <div className="text-xs font-medium text-amber-900 mb-1">Mein Fazit zum Makler:</div>
              <div className="text-[12px] text-ink-mid leading-relaxed">{report.maklerProfil.fazit}</div>
            </div>
          </>
        )}
      </PremiumSection>}

      {/* ════ NEU: Mietrendite ════ */}
      {report.mietrendite && <PremiumSection icon="💰" title="Mietrendite-Analyse (Anleger-Sicht)">
        {!report.mietrendite.verfuegbar ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="font-medium text-blue-900 mb-2">🤷 Renditeberechnung nicht möglich</div>
            <div className="text-xs text-blue-800 leading-relaxed">{report.mietrendite.fallbackHinweis}</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white border border-ink/10 rounded-lg p-4 text-center">
                <div className="text-[10px] text-ink-light tracking-wider uppercase mb-1">Bruttorendite</div>
                <div className="font-display text-2xl font-medium text-green">{report.mietrendite.bruttorendite}</div>
                <div className="text-[10px] text-ink-light mt-1">vor Bewirtschaftungskosten</div>
              </div>
              <div className="bg-white border border-ink/10 rounded-lg p-4 text-center">
                <div className="text-[10px] text-ink-light tracking-wider uppercase mb-1">Nettorendite</div>
                <div className="font-display text-2xl font-medium text-green">{report.mietrendite.nettorendite}</div>
                <div className="text-[10px] text-ink-light mt-1">nach Bewirtschaftungskosten</div>
              </div>
            </div>
            <div className="bg-white border border-ink/10 rounded-lg overflow-hidden mb-3 text-[13px]">
              <Row label="Ortsübliche Kaltmiete" value={report.mietrendite.ortsuebliche_kaltmiete} i={0} />
              <Row label="Jahresrohertrag" value={report.mietrendite.jahresrohertrag} i={1} />
              <Row label="Bewirtschaftungskosten" value={report.mietrendite.bewirtschaftungskosten} i={2} />
              <Row label="Nettomietertrag" value={report.mietrendite.nettomietertrag} i={3} />
            </div>
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 mb-2">
              <div className="text-xs font-medium text-amber-900 mb-1">Marktvergleich:</div>
              <div className="text-[12px] text-ink-mid leading-relaxed">{report.mietrendite.benchmark}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[12px] text-blue-800 leading-relaxed">
              <span className="font-medium">💡 Hinweis:</span> {report.mietrendite.hinweis}
            </div>
          </>
        )}
      </PremiumSection>}

      {/* ════ NEU: Finanzierungs-Detail (3 EK-Quoten) ════ */}
      {report.finanzierungsDetail && <PremiumSection icon="🏦" title="Finanzierungs-Cashflow im Detail">
        {/* Cashflow-Tabelle */}
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden mb-3">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-cream text-ink-light">
                <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">EK-Quote</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">EK</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Darlehen</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Zins/Tilg.</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Rate/M.</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Restschuld 10J</th>
                <th className="px-3 py-2 text-center font-medium tracking-wider uppercase text-[10px]">Bewertung</th>
              </tr>
            </thead>
            <tbody>
              {report.finanzierungsDetail.cashflow.map((c, i) => (
                <tr key={i} className={`border-t border-ink/8 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
                  <td className="px-3 py-2 font-medium">{c.eigenkapitalQuote}</td>
                  <td className="px-3 py-2 text-right text-ink-mid">{c.eigenkapitalBetrag}</td>
                  <td className="px-3 py-2 text-right text-ink-mid">{c.darlehen}</td>
                  <td className="px-3 py-2 text-right text-ink-mid text-[11px]">{c.zinssatz}/{c.tilgung}</td>
                  <td className="px-3 py-2 text-right font-medium text-green">{c.monatlicheRate}</td>
                  <td className="px-3 py-2 text-right text-ink-mid">{c.restschuld10Jahre}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      c.bewertung === 'tragbar' ? 'bg-emerald-50 text-emerald-700' :
                      c.bewertung === 'kritisch' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{c.bewertung === 'tragbar' ? '✓' : c.bewertung === 'kritisch' ? '✗' : '~'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Empfehlung */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 mb-3">
          <div className="text-xs font-medium text-amber-900 mb-1">Meine Empfehlung:</div>
          <div className="text-[12px] text-ink-mid leading-relaxed">{report.finanzierungsDetail.empfehlung}</div>
        </div>
        {/* Tilgungsplan */}
        <SubHeading>Tilgungsplan (Standardszenario)</SubHeading>
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden text-[12px]">
          <table className="w-full">
            <thead>
              <tr className="bg-cream text-ink-light">
                <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">Jahr</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Restschuld</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Bisher Zinsen</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Bisher Tilgung</th>
              </tr>
            </thead>
            <tbody>
              {report.finanzierungsDetail.beispielTilgungsplan.map((t, i) => (
                <tr key={i} className={`border-t border-ink/8 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
                  <td className="px-3 py-2 font-medium">Jahr {t.jahr}</td>
                  <td className="px-3 py-2 text-right">{t.restschuld}</td>
                  <td className="px-3 py-2 text-right text-ink-mid">{t.bisherZinsen}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{t.bisherTilgung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumSection>}

      {/* ════ NEU: Kontextuelle Besichtigungsfragen ════ */}
      {report.besichtigungsFragenSpezifisch && <PremiumSection icon="🔍" title="Besichtigungsfragen — auf dieses Objekt zugeschnitten">
        <p className="text-xs text-ink-mid mb-3 leading-relaxed">
          Generische Checklisten gibt es überall. Diese Fragen sind explizit auf die Daten Ihrer Immobilie abgestimmt — Baujahr, Lage, Heizungstyp und WEG-Spezifika fließen ein.
        </p>
        <div className="space-y-4">
          {report.besichtigungsFragenSpezifisch.fragenProThema.map((th, ti) => (
            <div key={ti}>
              <SubHeading>{th.thema}</SubHeading>
              <div className="space-y-2">
                {th.fragen.map((f, fi) => (
                  <div key={fi} className="bg-white border border-ink/10 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-[13px] font-medium text-ink flex-1">{f.frage}</div>
                      <PrioritaetBadge prio={f.prioritaet} />
                    </div>
                    <div className="text-xs text-ink-mid leading-relaxed mb-1">
                      <span className="text-ink-light font-medium">Warum?</span> {f.begruendung}
                    </div>
                    <div className="text-[11px] text-amber-700 italic">
                      🎯 Bezug: {f.bezugZumObjekt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PremiumSection>}

      {/* ════ Professionelle Wertermittlung ════ */}
      {report.wertermittlung && <PremiumSection icon="💎" title="Professionelle Wertermittlung">
        {/* Vergleichswertverfahren */}
        <div className="mb-4">
          <SubHeading>Vergleichswertverfahren (§15 ImmoWertV)</SubHeading>
          <p className="text-xs text-ink-mid mb-3">{report.wertermittlung.vergleichswert.methode}</p>
          <div className="bg-white border border-ink/10 rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-cream text-ink-light">
                  <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">Vergleichsobjekt</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">Kaufpreis</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">Fläche (€/m²)</th>
                  <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Abweichung</th>
                </tr>
              </thead>
              <tbody>
                {report.wertermittlung.vergleichswert.vergleichsobjekte.map((obj, i) => (
                  <tr key={i} className={`border-t border-ink/8 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
                    <td className="px-3 py-2 text-ink-mid">{obj.adresse}</td>
                    <td className="px-3 py-2 font-medium">{obj.preis}</td>
                    <td className="px-3 py-2 text-ink-mid">{obj.qm}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-medium ${obj.abweichung.startsWith('-') ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {obj.abweichung}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right text-sm font-medium text-green">
            Vergleichswert: {report.wertermittlung.vergleichswert.wert}
          </div>
        </div>

        {/* Sachwertverfahren */}
        <div className="mb-4">
          <SubHeading>Sachwertverfahren (§21 ImmoWertV)</SubHeading>
          <div className="bg-white border border-ink/10 rounded-lg overflow-hidden text-[13px]">
            <Row label="Bodenwert" value={report.wertermittlung.sachwert.bodenwert} i={0} />
            <Row label="Gebäudewert (NHK)" value={report.wertermittlung.sachwert.gebaeudewert} i={1} />
            <Row label="Alterswertminderung" value={report.wertermittlung.sachwert.alterswertminderung} i={2} />
            <div className="px-3.5 py-2.5 bg-green/5 font-medium text-green flex justify-between">
              <span className="text-xs tracking-wide">Sachwert</span>
              <span className="font-display">{report.wertermittlung.sachwert.sachwert}</span>
            </div>
          </div>
        </div>

        {/* Ertragswertverfahren */}
        <div className="mb-4">
          <SubHeading>Ertragswertverfahren (§27 ImmoWertV)</SubHeading>
          <div className="bg-white border border-ink/10 rounded-lg overflow-hidden text-[13px]">
            <Row label="Jahresrohertrag" value={report.wertermittlung.ertragswert.jahresrohertrag} i={0} />
            <Row label="Bewirtschaftungskosten" value={report.wertermittlung.ertragswert.bewirtschaftungskosten} i={1} />
            <Row label="Reinertrag" value={report.wertermittlung.ertragswert.reinertrag} i={2} />
            <Row label="Liegenschaftszins" value={report.wertermittlung.ertragswert.liegenschaftszins} i={3} />
            <div className="px-3.5 py-2.5 bg-green/5 font-medium text-green flex justify-between">
              <span className="text-xs tracking-wide">Ertragswert</span>
              <span className="font-display">{report.wertermittlung.ertragswert.ertragswert}</span>
            </div>
          </div>
        </div>

        {/* Fazit */}
        <div className="bg-green text-cream rounded-xl p-4">
          <div className="text-cream/70 text-[10px] tracking-wider uppercase mb-1">Empfohlener Kaufpreis</div>
          <div className="font-display text-2xl font-medium mb-2">{report.wertermittlung.fazit.empfohlenerKaufpreis}</div>
          <div className="text-xs text-cream/70 mb-2">Marktwertspanne: {report.wertermittlung.fazit.marktwertSpanne}</div>
          <div className="text-sm text-cream/90 leading-relaxed">{report.wertermittlung.fazit.einschaetzung}</div>
        </div>
      </PremiumSection>}

      {/* ════ Standort-Dossier ════ */}
      {report.standortDossier && <PremiumSection icon="📍" title="Vollständiges Standort-Dossier">
        {/* Entfernungen */}
        <SubHeading>Entfernungen & Infrastruktur</SubHeading>
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-cream text-ink-light">
                <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">Ziel</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Entfernung</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Fahrzeit</th>
              </tr>
            </thead>
            <tbody>
              {report.standortDossier.entfernungen.map((ent, i) => (
                <tr key={i} className={`border-t border-ink/8 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
                  <td className="px-3 py-1.5">{ent.ziel}</td>
                  <td className="px-3 py-1.5 text-right text-ink-mid">{ent.entfernung}</td>
                  <td className="px-3 py-1.5 text-right text-ink-mid">{ent.fahrzeit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <RiskCard
            title="🌊 Hochwasserrisiko"
            risiko={report.standortDossier.hochwasserrisiko.risiko}
            zone={report.standortDossier.hochwasserrisiko.zone}
            details={report.standortDossier.hochwasserrisiko.details}
          />
          <RiskCard
            title="☢️ Radon"
            risiko={report.standortDossier.radon.risiko}
            zone={report.standortDossier.radon.wert}
            details=""
          />
        </div>

        {/* Lärm */}
        <SubHeading>Lärmbelastung</SubHeading>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-4 text-xs">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><span className="text-amber-700 font-medium">Tagsüber:</span> {report.standortDossier.laermbelastung.tags}</div>
            <div><span className="text-amber-700 font-medium">Nachts:</span> {report.standortDossier.laermbelastung.nachts}</div>
          </div>
          <div className="text-amber-700">{report.standortDossier.laermbelastung.bewertung}</div>
        </div>

        {/* Bebauungsplan */}
        <SubHeading>Bebauungsplan & Rechtliches</SubHeading>
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden mb-4 text-[13px]">
          <Row label="Nutzungsart" value={report.standortDossier.bebauungsplan.nutzung} i={0} />
          <Row label="GFZ / GRZ" value={`${report.standortDossier.bebauungsplan.gfz} / ${report.standortDossier.bebauungsplan.grz}`} i={1} />
          <Row label="Besonderheiten" value={report.standortDossier.bebauungsplan.besonderheiten} i={2} />
        </div>

        {/* Milieuschutz Warning */}
        {report.standortDossier.sozialstruktur.milieuschutz && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700">
            <span className="font-medium">⚠️ Milieuschutzgebiet:</span> Die Gemeinde hat ein Vorkaufsrecht.
            Dies kann den Kauf um 2–3 Monate verzögern. Der Bezirk prüft, ob er das Vorkaufsrecht ausübt.
          </div>
        )}
      </PremiumSection>}

      {/* ════ 30-Jahres Vermögensvergleich ════ */}
      {report.vermoegensvergleich && <PremiumSection icon="📈" title="30-Jahres Vermögensvergleich (Kaufen vs. Mieten + ETF)">
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden mb-3">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-cream text-ink-light">
                <th className="px-3 py-2 text-left font-medium tracking-wider uppercase text-[10px]">Jahr</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Vermögen (Kauf)</th>
                <th className="px-3 py-2 text-right font-medium tracking-wider uppercase text-[10px]">Vermögen (Miete + ETF)</th>
              </tr>
            </thead>
            <tbody>
              {report.vermoegensvergleich.jahre.map((jahr, i) => (
                <tr key={i} className={`border-t border-ink/8 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
                  <td className="px-3 py-2 font-medium">Jahr {jahr}</td>
                  <td className="px-3 py-2 text-right text-green font-medium">{report.vermoegensvergleich.vermoegenKauf[i]}</td>
                  <td className="px-3 py-2 text-right text-amber-600 font-medium">{report.vermoegensvergleich.vermoegenMieteEtf[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-green-light border border-green/18 rounded-lg px-4 py-3 text-sm text-green">
          <span className="font-medium">Break-Even:</span> Ab Jahr {report.vermoegensvergleich.breakEvenJahr} übersteigt das Immobilienvermögen das ETF-Portfolio.
          Bei einer Haltedauer von über {report.vermoegensvergleich.breakEvenJahr} Jahren lohnt sich der Kauf finanziell.
        </div>
      </PremiumSection>}

      {/* ════ Steuerliche Aspekte ════ */}
      {report.steuerlicheAspekte?.length > 0 && <PremiumSection icon="🧾" title="Steuerliche Aspekte">
        <div className="space-y-2">
          {report.steuerlicheAspekte.map((asp, i) => (
            <div key={i} className="bg-white border border-ink/10 rounded-lg p-3.5">
              <div className="text-sm font-medium text-ink mb-1">{asp.aspekt}</div>
              <div className="text-xs text-ink-mid mb-2">{asp.details}</div>
              <div className="text-xs text-emerald-600 font-medium">→ {asp.vorteil}</div>
            </div>
          ))}
        </div>
      </PremiumSection>}

      {/* ════ Vor-Kauf-Checkliste ════ */}
      {report.vorKaufCheckliste?.length > 0 && <PremiumSection icon="✅" title="Vor-Kauf-Checkliste">
        <div className="space-y-4">
          {report.vorKaufCheckliste.map((kat, ki) => (
            <div key={ki}>
              <SubHeading>{kat.kategorie}</SubHeading>
              <div className="bg-white border border-ink/10 rounded-lg overflow-hidden">
                {kat.items.map((item, i) => (
                  <div key={i} className={`px-3.5 py-2 flex items-start gap-2.5 border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
                    <span className="text-ink-light mt-0.5">☐</span>
                    <span className="text-[13px] text-ink flex-1">{item.text}</span>
                    <WichtigkeitBadge wichtigkeit={item.wichtigkeit} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PremiumSection>}

      {/* ════ Gutachter-Empfehlung ════ */}
      {report.gutachterEmpfehlung && <PremiumSection icon="👷" title="Gutachter-Empfehlung">
        <div className={`rounded-xl p-4 ${report.gutachterEmpfehlung.empfohlen ? 'bg-amber-50 border-2 border-amber-200' : 'bg-emerald-50 border-2 border-emerald-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{report.gutachterEmpfehlung.empfohlen ? '⚠️' : '✅'}</span>
            <span className="font-medium text-sm">
              {report.gutachterEmpfehlung.empfohlen
                ? 'Vor-Ort-Gutachten empfohlen'
                : 'Vor-Ort-Gutachten optional'}
            </span>
          </div>
          <p className="text-xs text-ink-mid mb-2 leading-relaxed">{report.gutachterEmpfehlung.grund}</p>
          <div className="text-xs font-medium text-ink">
            💰 Geschätzte Kosten: {report.gutachterEmpfehlung.geschaetzteKosten}
          </div>
        </div>
      </PremiumSection>}
    </div>
  )
}

// ═══════════════════════════════
// Sub-Components
// ═══════════════════════════════

function PremiumSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3 mt-2">
        <span className="text-lg">{icon}</span>
        <div className="font-display text-base font-medium text-amber-900">{title}</div>
      </div>
      <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-4">
        {children}
      </div>
    </div>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-amber-800 tracking-wider uppercase mb-2 mt-3 first:mt-0">{children}</div>
}

function Row({ label, value, i }: { label: string; value: string; i: number }) {
  return (
    <div className={`px-3.5 py-2 flex justify-between items-start border-b border-ink/8 last:border-b-0 ${i % 2 === 1 ? 'bg-cream/30' : ''}`}>
      <span className="text-ink-light text-xs font-medium tracking-wide w-[40%] shrink-0">{label}</span>
      <span className="text-right text-[13px]">{value}</span>
    </div>
  )
}

function RiskCard({ title, risiko, zone, details }: { title: string; risiko: 'niedrig' | 'mittel' | 'hoch'; zone: string; details: string }) {
  const cls = risiko === 'niedrig' ? 'bg-emerald-50 border-emerald-200' : risiko === 'hoch' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
  const dot = risiko === 'niedrig' ? '🟢' : risiko === 'hoch' ? '🔴' : '🟡'
  return (
    <div className={`${cls} border rounded-lg p-3.5`}>
      <div className="flex items-center gap-1.5 text-sm font-medium mb-1">{title} {dot}</div>
      <div className="text-xs font-medium mb-1">{zone}</div>
      {details && <div className="text-[11px] text-ink-mid leading-relaxed">{details}</div>}
    </div>
  )
}

function WichtigkeitBadge({ wichtigkeit }: { wichtigkeit: 'muss' | 'soll' | 'kann' }) {
  const cls = wichtigkeit === 'muss' ? 'bg-red-50 text-red-600' : wichtigkeit === 'soll' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
  return <span className={`${cls} text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0`}>{wichtigkeit}</span>
}

function EinflussBadge({ einfluss }: { einfluss: 'hoch' | 'mittel' | 'niedrig' }) {
  const cls = einfluss === 'hoch' ? 'bg-ink/80 text-cream' : einfluss === 'mittel' ? 'bg-ink/40 text-cream' : 'bg-ink/15 text-ink-mid'
  return <span className={`${cls} text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0`}>Einfluss: {einfluss}</span>
}

function TrendBadge({ trend }: { trend: 'steigend' | 'stabil' | 'fallend' }) {
  const map = {
    steigend: { cls: 'bg-emerald-50 text-emerald-700', label: '↗ Steigend' },
    stabil: { cls: 'bg-amber-50 text-amber-700', label: '→ Stabil' },
    fallend: { cls: 'bg-red-50 text-red-700', label: '↘ Fallend' },
  }
  return <span className={`${map[trend].cls} text-[10px] font-medium px-2 py-0.5 rounded`}>{map[trend].label}</span>
}

function PrioritaetBadge({ prio }: { prio: 'kritisch' | 'wichtig' | 'optional' }) {
  const map = {
    kritisch: { cls: 'bg-red-50 text-red-700 border-red-200', label: '🔴 Kritisch' },
    wichtig: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: '🟡 Wichtig' },
    optional: { cls: 'bg-gray-50 text-gray-600 border-gray-200', label: '⚪ Optional' },
  }
  return <span className={`${map[prio].cls} text-[10px] font-medium px-2 py-0.5 rounded border shrink-0`}>{map[prio].label}</span>
}
