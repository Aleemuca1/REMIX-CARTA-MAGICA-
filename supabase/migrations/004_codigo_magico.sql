-- Carta Mágica — código mágico (abrir o plano em outro aparelho) e e-mail do comprador
alter table public.orders add column if not exists access_code text;
alter table public.orders add column if not exists customer_email text;
create unique index if not exists orders_access_code_idx on public.orders (access_code) where access_code is not null;
