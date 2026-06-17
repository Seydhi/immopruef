-- Server-side processing safety net
-- ----------------------------------------------------------------------------
-- Bisher wurde die Analyse AUSSCHLIESSLICH durch Frontend-Polling getriggert.
-- Schloss der Kunde den Tab (v.a. bei Double/Triple), wurden die restlichen
-- Analysen nie verarbeitet und die Order nie abgeschlossen — trotz Zahlung.
--
-- Mit dem Stripe-Webhook-Anstoss + Self-Chaining in der analyze-Function laufen
-- jetzt mehrere Invocations potenziell parallel. Damit dieselbe Analyse nicht
-- doppelt (= doppelte Claude-Kosten) verarbeitet wird, claimt jede Invocation
-- ihre Analyse atomar (UPDATE ... WHERE status='pending'). processing_started_at
-- dient dabei (a) als Claim-Zeitstempel und (b) um nur WIRKLICH haengen
-- gebliebene "processing"-Analysen (aelter als ein Schwellwert) zurueckzusetzen,
-- statt eine gerade aktiv laufende Invocation zu unterbrechen.

alter table analyses add column if not exists processing_started_at timestamptz;
