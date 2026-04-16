# TODO nach UG-Gründung

**Kontext:** Die Neuralpfad UG (haftungsbeschränkt) wird am **28.04.2026** beim Notar beurkundet.
Die Handelsregister-Eintragung (HRB) erfolgt typischerweise 2–4 Wochen danach.

**Goldene Regel:** Erst nach HRB-Eintragung den ersten zahlenden Kunden annehmen,
sonst greift § 11 Abs. 2 GmbHG (Handelndenhaftung = persönliche Privathaftung trotz UG).

---

## 1. Sofort nach Notarbeurkundung (28.04.2026)

### 1.1 Firmenbank-Konto eröffnen
- [ ] Geschäftskonto für die UG i.G. eröffnen (Holvi, Kontist, N26 Business, Deutsche Bank etc.)
- [ ] Stammkapital (mindestens 1 €, empfohlen 1.000+ €) einzahlen
- [ ] Einzahlungsbeleg für das Registergericht aufbewahren

### 1.2 Finanzamt-Anmeldung
- [ ] Steuerlicher Erfassungsbogen einreichen (ELSTER oder per Post)
- [ ] **Kleinunternehmer-Option (§ 19 UStG)** aktiv beantragen, wenn gewünscht
- [ ] Vorläufige Steuernummer vom FA notieren
- [ ] USt-IdNr. beantragen (dauert 2–4 Wochen) — **optional bei Kleinunternehmer**

---

## 2. Nach HRB-Eintragung (~Mitte/Ende Mai 2026)

### 2.1 Platzhalter im Code schließen

**Datei: `src/components/legal/Impressum.tsx`**

- [ ] Registergericht eintragen (z.B. "Amtsgericht Walsrode")
  - Stelle: Abschnitt „Handelsregister" → `[Amtsgericht wird nachgetragen]`
- [ ] HRB-Nummer eintragen (z.B. "HRB 12345")
  - Stelle: Abschnitt „Handelsregister" → `[HRB-Nummer wird nachgetragen]`
- [ ] USt-IdNr. eintragen, **falls erteilt** (z.B. "DE123456789")
  - Stelle: Abschnitt „Umsatzsteuer-Identifikationsnummer" → `[USt-IdNr. wird nachgetragen, falls erteilt]`
- [ ] Den einleitenden Satz „Eingetragen im Handelsregister." + Hinweis-Absatz
      mit der „zeitnah zu ergänzen"-Anmerkung **entfernen**, sobald alle Daten drin sind

**Falls Kleinunternehmer-Regelung doch nicht greift:**
- [ ] In `src/components/legal/Impressum.tsx` den Fallback-Satz
      „Sofern keine USt-IdNr. vorliegt: Gemäß § 19 UStG …" entfernen
- [ ] In `src/components/legal/AGB.tsx` `§ 4 (1)` anpassen — „Kleinunternehmerregelung"-Satz streichen,
      nur noch „Alle Preise sind Endpreise in Euro inklusive der gesetzlichen Umsatzsteuer." behalten

### 2.2 AVV (Auftragsverarbeitungsverträge) abschließen

AVV sind nach Art. 28 DSGVO **Pflicht**. Die UG als neuer Vertragspartner muss alle DPAs
neu abschließen. Dauer insgesamt ~20 Min.

- [ ] **Supabase DPA**
  - URL: https://supabase.com/dashboard/project/_/settings/general → „Legal" / DPA
  - Oder: https://supabase.com/legal/dpa → Formular
  - Voraussetzung: Paid Plan (Pro)

- [ ] **Resend DPA**
  - URL: https://resend.com/settings/team → DPA-Abschnitt
  - Alternativ: Support-Anfrage an dpa@resend.com mit UG-Daten

- [ ] **Anthropic Commercial DPA**
  - URL: https://console.anthropic.com/settings/legal
  - Commercial Terms + DPA per Click akzeptieren
  - Bei API-Key für Production: Organization auf „Neuralpfad UG" umstellen

- [ ] **Stripe DPA** — automatisch Teil der Services Agreement
  - Prüfen: https://dashboard.stripe.com/settings/legal → „Data Processing Addendum"
  - Nur falls nötig: Firmenname / Rechtsform auf UG aktualisieren

- [ ] **Vercel DPA** — automatisch Teil der Vercel ToS
  - Prüfen: https://vercel.com/account/legal → DPA
  - Organisation / Billing-Email auf UG umstellen

- [ ] **OpenAI DPA** (nur falls genutzt)
  - URL: https://platform.openai.com/account/organization/dpa

### 2.3 Konten / Rechnungen auf UG umstellen

- [ ] Stripe: Firmenname, Rechtsform, HRB, USt-IdNr., Bankverbindung aktualisieren
- [ ] Vercel: Billing auf UG umstellen (Team-Namen, Adresse, Rechnungs-Email)
- [ ] Supabase: Billing auf UG
- [ ] Resend: Billing auf UG
- [ ] Anthropic: Billing auf UG
- [ ] Domain-Registrar (immopruef.de / .com): Inhaber auf UG umstellen (Whois!)
- [ ] Alle Dienstleister-Rechnungen künftig auf UG-Name + -Adresse ausstellen lassen
      (wichtig für Vorsteuer-Abzug falls später USt-pflichtig)

---

## 3. Frontend- & Backend-Deployment

### 3.1 Supabase-Migration deployen

```bash
supabase db push
```

- [ ] Migration `004_consent_tracking.sql` angewendet
- [ ] Prüfen in Supabase Dashboard → Table Editor → `orders`:
  - Spalte `agb_accepted` (boolean, default false) vorhanden
  - Spalte `widerruf_waived` (boolean, default false) vorhanden
  - Spalte `consent_timestamp` (timestamptz, nullable) vorhanden
  - Spalte `consent_ip` (text, nullable) vorhanden

### 3.2 Edge Function deployen

```bash
supabase functions deploy create-checkout
```

- [ ] Deploy erfolgreich
- [ ] Manuell testen: Ein Checkout mit `curl` ohne `consents` → 400-Fehler
- [ ] Manuell testen: Checkout mit `consents: {agbAccepted:true, widerrufWaived:true, timestamp:"..."}` → 200 + Stripe-URL

### 3.3 Frontend deployen (Vercel)

- [ ] Git push auf `main` → automatischer Vercel-Deploy
- [ ] Lighthouse-Check nach Deploy: Accessibility-Score prüfen
- [ ] Test auf Mobile (375px): Checkbox-UI + Button nicht abgeschnitten

---

## 4. Echter End-to-End-Test (Launch-Voraussetzung)

Ohne diesen Test kein Launch. ~15 Min + Anthropic-Kosten ~5 $.

- [ ] Echten ImmoScout-Link besorgen (keine Mock-URL)
- [ ] Auf immopruef.de (PROD): Premium-Paket (79 €) wählen
- [ ] Beide Zustimmungs-Checkboxen setzen
- [ ] Button „Kostenpflichtig bestellen — Premium-Report (79 €)" klicken
- [ ] Bei Stripe mit **eigener Kreditkarte** bezahlen
- [ ] Warten: Landing → Stripe → Webhook → Supabase → Claude → Resend → Permalink
- [ ] Prüfen: Kommt die Bestätigungs-E-Mail an?
- [ ] Prüfen: Funktioniert der Permalink-Link in der E-Mail?
- [ ] Prüfen: Stimmt die Analyse-Qualität? Alle Premium-Module gerendert?
- [ ] Prüfen: Sind die Disclaimer-Banner (oben + Footer) sichtbar?
- [ ] Prüfen in Supabase: Order hat `agb_accepted=true`, `widerruf_waived=true`,
      `consent_timestamp`, `consent_ip` gesetzt?
- [ ] Prüfen in Stripe-Dashboard: Metadata enthält `agb_accepted`, `widerruf_waived`, `consent_timestamp`?
- [ ] **Refund** über Stripe-Dashboard (Zahlung rückerstatten) — NICHT über Widerruf
      (Widerruf ist durch Checkbox verwirkt)

---

## 5. Optional — Phase 1 Punkte aus ursprünglichem Plan

### 5.1 Analytics einbauen (Plausible)
- [ ] Plausible-Account anlegen (~9 €/Monat oder 30 Tage gratis)
- [ ] Domain hinzufügen (immopruef.de)
- [ ] Script-Tag in `index.html` einbauen
- [ ] Events tracken: `landing_viewed`, `pricing_selected`, `checkout_started`,
      `checkout_completed`, `blog_viewed`

### 5.2 Error-Tracking (Sentry)
- [ ] Sentry-Account (Free-Tier)
- [ ] DSN als Env-Var in Vercel
- [ ] `@sentry/react` einbauen in `main.tsx`
- [ ] Für Edge Functions: `@sentry/deno` einbauen in alle Edge Functions

### 5.3 Google Search Console
- [ ] Domain verifizieren (DNS-TXT oder Meta-Tag)
- [ ] Sitemap einreichen: `https://immopruef.de/sitemap.xml`
- [ ] Erste 8 Top-URLs via „Indexierung beantragen" anstoßen
- [ ] Bing Webmaster Tools dasselbe

---

## 6. Dokumentation / interne Pflichten

### 6.1 Verzeichnis der Verarbeitungstätigkeiten (VVT)
Nach Art. 30 DSGVO Pflicht — auch für Kleinunternehmen. Ist auf Nachfrage der
Aufsichtsbehörde vorzulegen.

- [ ] VVT-Vorlage erstellen (Excel oder DSGVO-Tool)
- [ ] Alle Verarbeitungen aufnehmen:
  - Bestellabwicklung (Stripe)
  - Analyse-Erstellung (Anthropic/OpenAI)
  - E-Mail-Versand (Resend)
  - Hosting (Vercel, Supabase)
  - Rechnungs-Archiv (10 Jahre)

### 6.2 Rechnungs-Vorlage
- [ ] Rechnungs-Template erstellen mit:
  - Pflichtangaben § 14 UStG (UG-Name, Adresse, Steuernummer / USt-IdNr., fortlaufende Rechnungsnummer)
  - Kleinunternehmer-Hinweis: „Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen."
- [ ] Rechnungs-Automation in Stripe (Stripe Invoicing) oder via Resend
- [ ] Archivierung der Rechnungen für 10 Jahre (§ 147 AO)

### 6.3 Buchhaltung
- [ ] Steuerberater beauftragen (empfohlen bei UG, auch bei Kleinunternehmer)
  - Oder: EÜR-Tool (Lexoffice, Sevdesk) für Minimal-Buchhaltung
- [ ] Trennung privat / geschäftlich strikt einhalten (keine Misch-Konten)

---

## 7. Vor dem finalen Launch (Checkliste)

- [ ] Alle Punkte aus Abschnitt 2 erledigt
- [ ] Alle Punkte aus Abschnitt 3 erledigt
- [ ] Abschnitt 4 (E2E-Test) erfolgreich
- [ ] HRB-Eintragung liegt vor
- [ ] Geschäftskonto aktiv
- [ ] Steuerliche Erfassung abgeschlossen
- [ ] VVT erstellt
- [ ] Backup-Plan: was passiert, wenn Edge Function crasht oder Anthropic-API ausfällt?
- [ ] Anwalts-Kurz-Check (30 Min, 200–400 €) — **stark empfohlen** vor erstem Kunden

**→ Danach: Launch.**

---

*Erstellt: 2026-04-17 · Zuletzt geändert: 2026-04-17*
