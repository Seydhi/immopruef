# Deploy-Checkliste — ImmoPrüf

Technische Schritt-für-Schritt-Anleitung für den Produktiv-Deploy. Ergänzt
`TODO_NACH_GRUENDUNG.md` (rechtliche/gründungsbezogene Punkte).

Reihenfolge einhalten: **Supabase (DB → Functions) vor Frontend**, sonst laufen
Edge Functions gegen ein veraltetes Schema.

---

## 1. Supabase — Datenbank-Migrationen

`supabase db push` (oder via SQL-Editor) in dieser Reihenfolge anwenden:

- [ ] `001_initial_schema.sql` … `004_consent_tracking.sql` (Basis, falls noch nicht angewendet)
- [ ] **`005_server_side_processing.sql`** — Spalte `analyses.processing_started_at`
      (atomares Claiming + zeitgesteuertes Stuck-Reset). **MUSS vor dem `analyze`-Deploy laufen.**
- [ ] **`006_secure_analysis_read.sql`** — entfernt permissive RLS-Policy, legt
      `get_analysis_by_token`-RPC an. **MUSS vor dem Frontend-Deploy laufen** (Permalinks
      nutzen jetzt die RPC).
- [ ] **`007_stuck_order_watchdog.sql`** — pg_cron-Watchdog + `pg_net`.
- [ ] Verifizieren: `select * from cron.job;` — Jobs `cleanup-old-analyses` (002) und
      `watchdog-stuck-orders` (007) vorhanden.

### 1a. Vault-Secrets für den Watchdog (007) — EINMALIG
Der Watchdog NO-OPt sauber, bis diese zwei Secrets gesetzt sind:
```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<SERVICE_ROLE_KEY>',                'service_role_key');
```
- [ ] Beide gesetzt (Dashboard → Project Settings → Vault, oder SQL-Editor).
- [ ] `pg_net` + `pg_cron` Extensions aktiv (Dashboard → Database → Extensions).

---

## 2. Supabase — Edge Functions

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy analyze
supabase functions deploy retry-analysis
```

- [ ] `stripe-webhook` hat `verify_jwt = false` (in `supabase/config.toml` gesetzt) —
      Stripe sendet keinen JWT, sondern eine Signatur.

### 2a. Function-Secrets (`supabase secrets set KEY=VALUE`)
Service-Role-Key: Der Code liest `SB_SERVICE_ROLE_KEY` **mit Fallback** auf das von
Supabase automatisch injizierte `SUPABASE_SERVICE_ROLE_KEY` → i. d. R. **nichts zu setzen**.
Nur bei bewusstem Override `SB_SERVICE_ROLE_KEY` setzen.

- [ ] `ANTHROPIC_API_KEY`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_SINGLE`, `STRIPE_PRICE_DOUBLE`, `STRIPE_PRICE_TRIPLE`, `STRIPE_PRICE_PREMIUM`
- [ ] `RESEND_API_KEY`, `EMAIL_FROM` (z. B. `ImmoPrüf <info@immopruef.de>`)
- [ ] `APP_URL=https://immopruef.de`
- [ ] Scraper (optional, aber empfohlen gegen Bot-Schutz von ImmoScout24/Immowelt):
      `BRIGHTDATA_API_TOKEN`, `BRIGHTDATA_ZONE`, `JINA_API_KEY`, ggf. `SCRAPER_URL`, `SCRAPER_API_KEY`.

---

## 3. Stripe

- [ ] 4 Preise angelegt: 19 € / 29 € / 34 € / 79 € — IDs in die Function-Secrets eingetragen.
- [ ] Webhook-Endpoint: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
- [ ] Webhook-Events aktiviert: **`checkout.session.completed`**,
      **`checkout.session.async_payment_succeeded`**, `checkout.session.async_payment_failed`
      (SEPA/Klarna-Absicherung).
- [ ] `STRIPE_WEBHOOK_SECRET` (Signing-Secret des Endpoints) als Function-Secret gesetzt.

---

## 4. Resend (E-Mail)

- [ ] Versand-Domain **immopruef.de** verifiziert (SPF, DKIM, DMARC) — Kontakt/Absender
      wurden projektweit auf `@immopruef.de` vereinheitlicht.
- [ ] Testmail kommt an und landet nicht im Spam.

---

## 5. Frontend (Vercel)

Environment-Variablen (Project Settings → Environment Variables):
- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_APP_URL=https://immopruef.de`
- [ ] **`VITE_USE_MOCKS=false`** — wird auf dem Prod-Host zwar zusätzlich hart ignoriert
      (Sicherheitsnetz in `api.ts`), trotzdem korrekt setzen.
- [ ] Deploy von Branch (Merge nach `main`). Build: `npm run build` (inkl. Sitemap + Prerender).
- [ ] Security-Header sind in `vercel.json` hinterlegt (HSTS, X-Frame-Options, nosniff,
      Referrer-Policy, Permissions-Policy) — nach Deploy via Response-Header prüfen.
- [ ] Prerender: Build ist fehlertolerant (einzelne Routen brechen den Build nicht ab;
      `PRERENDER_STRICT=true` für strikten Modus). Deploy-Log auf fehlgeschlagene Routen prüfen.

---

## 6. Rechtliches (vor erstem zahlenden Kunden)

- [ ] **HRB-Nummer** im Impressum nachtragen (`src/components/legal/Impressum.tsx`,
      Registergericht Amtsgericht Walsrode steht bereits).
- [ ] USt-IdNr. nachtragen, falls erteilt (sonst Kleinunternehmer-Hinweis korrekt).
- [ ] `Stand:`-Daten in den Legal-Seiten aktualisieren.
- [ ] AVV/DPA mit allen Auftragsverarbeitern abgeschlossen (Supabase, Stripe, Resend,
      Anthropic, Vercel, **Bright Data, Jina** — letztere jetzt in der Datenschutzerklärung).

---

## 7. End-to-End-Echttest (Launch-Voraussetzung)

- [ ] Echten ImmoScout-/Immowelt-Link besorgen (keine Mock-URL).
- [ ] **Single (19 €)** durchspielen: Landing → Stripe-Zahlung → Bestätigungsmail →
      Ergebnis-Permalink. Analyse vollständig? Disclaimer-Banner sichtbar?
- [ ] **Premium (79 €)** durchspielen: alle Premium-Module gerendert? Report-Tiefe ok?
- [ ] **Watchdog-/Tab-schließen-Test (Triple, 34 €):** Nach der Zahlung den Tab sofort
      schließen. Erwartung: Webhook stößt die Verarbeitung serverseitig an, `analyze`
      arbeitet sich per Self-Chaining durch alle 3 URLs, der pg_cron-Watchdog fängt
      Hänger ab → die „fertig"-Mail mit allen 3 Links kommt **ohne** offenen Tab an.
- [ ] **Teilausfall:** Falls eine Analyse fehlschlägt — kommt der Hinweis „X von Y …
      kostenfrei neu starten" in der Ergebnismail?
- [ ] Supabase prüfen: Order hat `agb_accepted`, `widerruf_waived`, `consent_timestamp`,
      `consent_ip`; Stripe-Metadata enthält dieselben Consent-Felder.
- [ ] **Refund** über Stripe-Dashboard (nicht über Widerruf — der ist per Checkbox verwirkt).

---

## 8. Post-Deploy-Smoke

- [ ] `https://immopruef.de/sitemap.xml` erreichbar, in `robots.txt` referenziert.
- [ ] Eine Blog-Seite: FAQPage-Schema + sichtbare „Häufige Fragen" + „Passende Rechner".
- [ ] Unbekannte URL (z. B. `/gibtsnicht`) → 404-View mit `noindex`.
- [ ] Google Search Console: Sitemap einreichen, Top-URLs indexieren lassen.
