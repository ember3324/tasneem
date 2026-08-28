-- ─────────────────────────────────────────────────────────────
-- Allow deleting an address that was used in a past order.
--
-- orders.address_id previously had no ON DELETE clause (default RESTRICT),
-- so deleting an address referenced by any order failed with Postgres
-- error 23503 — silently, from the app's point of view, since the delete
-- action didn't check for it. orders already denormalizes everything it
-- needs to display (customer_name, customer_phone, lat, lng,
-- items_summary, ...) — address_id is write-once at checkout and never
-- read back, so it's safe to let it go null instead of blocking the delete.
-- ─────────────────────────────────────────────────────────────
alter table orders drop constraint orders_address_id_fkey;

alter table orders
  add constraint orders_address_id_fkey
  foreign key (address_id) references addresses (id) on delete set null;
