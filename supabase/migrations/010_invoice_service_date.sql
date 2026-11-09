-- Leistungsdatum getrennt vom Rechnungsdatum, nötig bei nachträglich erstellten Rechnungen.
alter table invoices add column if not exists service_date date;
