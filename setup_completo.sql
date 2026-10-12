-- Carta Mágica — CONFIGURAÇÃO COMPLETA DO BANCO (001 + 002 + 003)
-- Pode rodar quantas vezes quiser: não apaga nenhum dado.

-- Carta Mágica — tabelas principais
-- Rode este arquivo no Supabase: SQL Editor > New query > colar > Run.

create table if not exists public.letters (
  id               text primary key,
  token            text not null unique,
  child_name       text not null,
  age              int  not null check (age between 0 and 18),
  city             text not null,
  achievements     text default '',
  gift_request     text default '',
  parent_notes     text default '',
  style            text not null default 'mágico',
  plan             text not null default 'free' check (plan in ('free','pro')),
  content          text not null,
  letter_date      text,
  photo_url        text,
  delivery_status  text not null default 'digital_only',
  tracking_code    text,
  shipping_address jsonb,
  secret_message   text,
  child_reaction   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.orders (
  order_id                  text primary key,
  letter_id                 text references public.letters(id) on delete set null,
  child_name                text,
  amount                    numeric(10,2) not null,
  plan                      text not null default 'pro',
  include_physical_dispatch boolean not null default false,
  status                    text not null default 'pending'
                            check (status in ('pending','paid','failed','refunded','canceled')),
  payment_method            text,
  gateway_charge_id         text,
  created_at                timestamptz not null default now(),
  paid_at                   timestamptz
);

create index if not exists letters_created_at_idx on public.letters (created_at desc);
create index if not exists orders_letter_id_idx   on public.orders (letter_id);
create index if not exists orders_created_at_idx  on public.orders (created_at desc);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists letters_set_updated_at on public.letters;
create trigger letters_set_updated_at before update on public.letters
  for each row execute function public.set_updated_at();

-- Segurança: RLS ligado e SEM políticas públicas.
-- Só o servidor (com a chave secreta) lê e grava. O navegador nunca acessa direto.
alter table public.letters enable row level security;
alter table public.orders  enable row level security;

-- Carta Mágica — permite o plano "Natal Completo" (natal) nas cartas
alter table public.letters drop constraint if exists letters_plan_check;
alter table public.letters add constraint letters_plan_check check (plan in ('free','pro','natal'));

-- Carta Mágica — registra quando o responsável autorizou o uso dos dados da criança (LGPD art. 14)
alter table public.letters add column if not exists parental_consent_at timestamptz;

-- Carta Mágica — código mágico (abrir o plano em outro aparelho) e e-mail do comprador
alter table public.orders add column if not exists access_code text;
alter table public.orders add column if not exists customer_email text;
create unique index if not exists orders_access_code_idx on public.orders (access_code) where access_code is not null;
