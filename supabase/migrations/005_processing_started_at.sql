-- Hintergrund-Verarbeitung (EdgeRuntime.waitUntil): analyze antwortet sofort,
-- rechnet im Hintergrund. processing_started_at erlaubt (a) atomares Claiming
-- ohne Doppel-Läufe bei parallelen Polls und (b) zeitbasiertes Wiederanlaufen
-- echter Abbrüche (Reset nur, wenn der Lauf älter als ~8 Minuten ist).
alter table analyses add column if not exists processing_started_at timestamptz;
