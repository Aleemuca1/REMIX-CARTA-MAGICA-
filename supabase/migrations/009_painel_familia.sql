-- Carta Mágica — Painel da Família
-- 1) casinhas e árvores ficam ligadas à conta dos pais (para aparecerem no painel em qualquer aparelho)
alter table public.family_trees add column if not exists parent_id uuid references public.parents (id) on delete set null;
create index if not exists family_trees_parent_idx on public.family_trees (parent_id);
-- 2) troca de plano (Carta Completa -> Pacote Família pagando a diferença): guarda o código do pedido original
alter table public.orders add column if not exists upgrade_of text;
-- 3) acha rápido as compras de cada e-mail
create index if not exists orders_customer_email_idx on public.orders (lower(customer_email));
