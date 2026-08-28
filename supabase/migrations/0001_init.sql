-- Water bottle delivery e-commerce schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once your project exists.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Profiles — the account itself. This is NOT keyed to Supabase Auth's
-- auth.users: signup is just a phone number + name, no password, no OTP
-- (see src/lib/session.ts for why, and the trade-off that implies). A
-- signed session cookie holds a profiles.id directly.
-- ─────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  -- Grants access to /admin/zones (drawing delivery-area polygons). No
  -- signup flow sets this — promote yourself manually once your project
  -- exists:  update profiles set is_admin = true where phone = '+9665...';
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Service zones: admin-drawn polygons defining the delivery area
-- ─────────────────────────────────────────────────────────────
create table service_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- GeoJSON Polygon geometry, e.g. { "type": "Polygon", "coordinates": [[[lng,lat], ...]] }
  polygon jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Addresses (saved locations per user)
-- ─────────────────────────────────────────────────────────────
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text not null default 'Home',
  address_line text,
  city text,
  lat double precision not null,
  lng double precision not null,
  in_service_area boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on addresses (user_id);

-- ─────────────────────────────────────────────────────────────
-- Catalog: categories & products
-- ─────────────────────────────────────────────────────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  unit text, -- e.g. "5-gallon bottle", "case of 24"
  image_url text,
  in_stock boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on products (category_id);

-- ─────────────────────────────────────────────────────────────
-- Cart (persisted per user)
-- ─────────────────────────────────────────────────────────────
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ─────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  -- Short human-friendly ID, used as the join key with the Google Sheet (column A).
  order_number text not null unique,
  user_id uuid not null references profiles (id),
  address_id uuid references addresses (id),

  -- Denormalized snapshot fields (so the sheet/admin never needs a join):
  customer_name text not null,
  customer_phone text not null,
  lat double precision not null,
  lng double precision not null,
  items_summary text not null, -- e.g. "2x 5-Gallon Bottle, 1x Dispenser"
  total_amount numeric(10, 2) not null,

  payment_method text not null check (payment_method in ('cash', 'card')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'cod_pending')),
  moyasar_payment_id text,
  moyasar_invoice_id text,

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'out_for_delivery', 'completed', 'cancelled')),
  proof_photo_url text,

  -- Sync bookkeeping for the Google Sheets polling job (see lib/sheets.ts):
  sheet_row_number int,
  sheet_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);
create index orders_status_idx on orders (status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id),
  product_name text not null, -- snapshot at time of order
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null
);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now()
);

create function public.record_order_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into public.order_status_history (order_id, status)
    values (new.id, new.status);
  end if;
  return new;
end;
$$;

create trigger on_order_status_change
  after insert or update of status on orders
  for each row execute procedure public.record_order_status_change();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table service_zones enable row level security;
alter table categories enable row level security;
alter table products enable row level security;

-- profiles, addresses, cart_items, orders, order_items, and
-- order_status_history have NO policies below — that's deliberate, not an
-- oversight. There's no Supabase Auth session in this app (see
-- src/lib/session.ts), so auth.uid() is always null and any policy written
-- against it would be permanently dead code that misleadingly implies
-- client-side, per-user access is possible. Every read/write to these
-- tables goes through the service-role client server-side (src/lib/supabase/admin.ts),
-- which bypasses RLS entirely; authorization is enforced in application
-- code by filtering on the session's profile id. Leaving RLS *enabled* with
-- no policies still means these tables are inaccessible to the anon/publishable
-- key if it were ever used directly — a safe default.

-- Public read-only catalog data.
create policy "categories: public read" on categories for select using (true);
create policy "products: public read" on products for select using (true);
create policy "service_zones: public read active zones" on service_zones
  for select using (active = true);

-- ─────────────────────────────────────────────────────────────
-- Seed data (safe to delete/edit once you have real products)
--
-- Product/category `name` is stored in Arabic — the real, canonical name
-- for this market. English names are a code-side override keyed by slug,
-- see productTranslations / categoryTranslations in
-- src/lib/i18n/translations.ts — every slug below must have an entry there.
-- ─────────────────────────────────────────────────────────────
insert into categories (name, slug, sort_order) values
  ('مياه معبأة', 'bottled-water', 1),
  ('مناديل ورقية', 'tissues', 2),
  ('العناية الشخصية', 'personal-care', 3);

insert into products (category_id, name, slug, price, sort_order)
select id, 'مياه نبع مكيون 330 مل 20 عبوة', 'makyoon-water-330ml-20pack', 10.00, 1
from categories where slug = 'bottled-water'
union all
select id, 'مياه نبع مكيون 330 مل 24 عبوة', 'makyoon-water-330ml-24pack', 12.00, 2
from categories where slug = 'bottled-water'
union all
select id, 'مناديل نفحات 500 حبة ناعم', 'nafahat-tissues-500', 12.00, 1
from categories where slug = 'tissues'
union all
select id, 'مناديل نفحات 300 حبة ناعم', 'nafahat-tissues-300', 8.00, 2
from categories where slug = 'tissues'
union all
select id, 'مسواك', 'miswak', 3.00, 1
from categories where slug = 'personal-care';
