-- Der Cleanup-Job löscht Bestellungen nach 180 Tagen. Rechnungen unterliegen der
-- gesetzlichen Aufbewahrungspflicht und müssen das überleben: Die Verknüpfung wird
-- beim Löschen der Bestellung geleert, statt den Job zu blockieren.
alter table invoices alter column order_id drop not null;
alter table invoices drop constraint if exists invoices_order_id_fkey;
alter table invoices add constraint invoices_order_id_fkey
  foreign key (order_id) references orders(id) on delete set null;
