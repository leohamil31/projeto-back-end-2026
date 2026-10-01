create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  image text not null,
  is_available boolean not null default true,
  category_id uuid not null references public.categories(id),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  table_number integer not null check (table_number > 0),
  status text not null default 'Recebido' check (status in ('Recebido', 'Preparando', 'Pronto', 'Entregue')),
  total numeric(10,2) not null check (total >= 0),
  payment_method text not null default 'Dinheiro' check (payment_method in ('PIX', 'Cartão', 'Dinheiro')),
  payment_status text not null default 'Aguardando no caixa' check (payment_status in ('Aguardando no caixa', 'Pago')),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists payment_method text not null default 'Dinheiro';
alter table public.orders add column if not exists payment_status text not null default 'Aguardando no caixa';

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  options text[] not null default '{}'
);

alter table public.order_items add column if not exists options text[] not null default '{}';

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- O backend usa a service role key e bypassa RLS. Nunca exponha essa chave no navegador.
