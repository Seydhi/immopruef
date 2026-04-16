-- Consent tracking for orders (AGB + Widerrufsverzicht nach BGB § 356 Abs. 5)
-- Rechtliche Pflicht: Nachweis der ausdruecklichen Zustimmung zum Verlust
-- des Widerrufsrechts vor Beginn der Leistungsausfuehrung.
-- Beweislast fuer die Zustimmung liegt beim Unternehmer.

alter table orders
  add column if not exists agb_accepted boolean not null default false,
  add column if not exists widerruf_waived boolean not null default false,
  add column if not exists consent_timestamp timestamptz,
  add column if not exists consent_ip text;

create index if not exists idx_orders_consent_timestamp on orders(consent_timestamp);

comment on column orders.agb_accepted is 'Kunde hat AGB aktiv akzeptiert (Checkbox im Checkout)';
comment on column orders.widerruf_waived is 'Kunde hat Widerrufsrecht ausdruecklich verwirkt (§ 356 Abs. 5 BGB)';
comment on column orders.consent_timestamp is 'Zeitpunkt der Zustimmungserklaerung (client-side, UTC)';
comment on column orders.consent_ip is 'IP-Adresse des Zustimmenden (Beweissicherung)';
