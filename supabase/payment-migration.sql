alter table public.orders add column if not exists payment_method text not null default 'Dinheiro';
alter table public.orders add column if not exists payment_status text not null default 'Aguardando no caixa';
