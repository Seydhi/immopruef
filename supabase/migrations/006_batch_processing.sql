-- Batch-Architektur: Die Claude-Analyse läuft als Anthropic Message Batch
-- (50% Token-Rabatt, kein Edge-Wall-Clock-Limit mehr). analyze submittet den
-- Batch (Phase A) und holt bei späteren Polls das Ergebnis ab (Phase B).
alter table analyses add column if not exists batch_id text;
alter table analyses add column if not exists retry_count int not null default 0;
