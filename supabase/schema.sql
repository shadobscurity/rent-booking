-- Enable UUID extension if desired
-- create extension if not exists "uuid-ossp";

create table if not exists products (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  brand text,
  description text,
  base_price int not null default 0,
  extra_day int not null default 0,
  deposit int not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  size text not null,
  sku text unique,
  notes text
);

create table if not exists inventories (
  id bigint generated always as identity primary key,
  variant_id bigint not null references variants(id) on delete cascade,
  code text unique not null
);

create type delivery_type as enum ('PICKUP','INSTANT','SAME_DAY','REGULAR');

create table if not exists orders (
  id bigint generated always as identity primary key,
  total int not null default 0,
  deposit int not null default 0,
  status text not null default 'PENDING',
  created_at timestamp with time zone default now()
);

create table if not exists bookings (
  id bigint generated always as identity primary key,
  inventory_id bigint not null references inventories(id) on delete cascade,
  wear_date date not null,
  base_duration int not null default 4,
  extra_duration int not null default 0,
  delivery_type delivery_type not null default 'INSTANT',
  status text not null default 'PENDING',
  order_id bigint references orders(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Helpful RPC to create an order + booking atomically
create or replace function create_order_with_booking(
  p_inventory_id bigint,
  p_wear_date date,
  p_extra_duration int,
  p_delivery_type delivery_type,
  p_total int,
  p_deposit int
) returns json language plpgsql security definer as $$
declare v_order_id bigint;
begin
  insert into orders (total, deposit) values (p_total, p_deposit) returning id into v_order_id;
  insert into bookings (inventory_id, wear_date, extra_duration, delivery_type, order_id)
  values (p_inventory_id, p_wear_date, p_extra_duration, p_delivery_type, v_order_id);
  return json_build_object('order_id', v_order_id);
end $$;

-- RLS off for simplicity (server uses service role). You can enable later.
alter table products disable row level security;
alter table variants disable row level security;
alter table inventories disable row level security;
alter table orders disable row level security;
alter table bookings disable row level security;
