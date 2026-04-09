# ImmoAnalyse

KI-gestützte Immobilienanalyse für den deutschen Markt. Nutzer geben einen Immobilien-Link ein, bezahlen via Stripe und erhalten eine umfassende Analyse mit Standortbewertung, Marktdaten, Risikohinweisen, Verhandlungstipps und einem Makleranschreiben.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Die App läuft standardmäßig im **Mock-Modus** (`VITE_USE_MOCKS=true`). Alle API-Calls werden simuliert und es werden realistische Beispieldaten angezeigt.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Vite
- **Backend:** Supabase Edge Functions (Deno)
- **Payments:** Stripe Checkout
- **KI:** Claude Opus (Anthropic API mit Web Search)
- **E-Mail:** Resend

## Deployment

### 1. Supabase einrichten
- Neues Supabase-Projekt erstellen
- SQL-Migration ausführen: `supabase/migrations/001_initial_schema.sql`
- Edge Functions deployen: `supabase functions deploy`

### 2. Stripe einrichten
- Drei Produkte/Preise erstellen: 19€ (Single), 29€ (Double), 34€ (Triple)
- Webhook erstellen auf `https://<supabase-url>/functions/v1/stripe-webhook`
- Event: `checkout.session.completed`

### 3. Resend einrichten
- Domain verifizieren
- API-Key erstellen

### 4. Umgebungsvariablen

Frontend (`.env`):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://immoanalyse.de
VITE_USE_MOCKS=false
```

Supabase Edge Functions (Dashboard > Settings > Edge Functions):
```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SINGLE=price_...
STRIPE_PRICE_DOUBLE=price_...
STRIPE_PRICE_TRIPLE=price_...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@immoanalyse.de
APP_URL=https://immoanalyse.de
```

### 5. Frontend deployen
```bash
npm run build
# Deploy dist/ auf Vercel, Netlify, oder Cloudflare Pages
```

## Preise

| Paket | Preis | Analysen | Pro Stück |
|-------|-------|----------|-----------|
| Single | 19,00 € | 1 | 19,00 € |
| Double | 29,00 € | 2 | 14,50 € |
| Triple | 34,00 € | 3 | 11,33 € |
