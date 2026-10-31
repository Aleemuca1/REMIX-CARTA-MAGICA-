-- Carta Mágica — login do responsável (código de 6 dígitos por e-mail) e "Minhas cartas".
-- Só o servidor (chave secreta) acessa estas tabelas: RLS ligado e sem políticas públicas.

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.auth_codes (
  id bigserial primary key,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists auth_codes_email_idx on public.auth_codes (email);

create table if not exists public.parent_sessions (
  token_hash text primary key,
  parent_id uuid not null references public.parents (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists parent_sessions_parent_idx on public.parent_sessions (parent_id);

alter table public.letters add column if not exists parent_id uuid references public.parents (id) on delete set null;
create index if not exists letters_parent_idx on public.letters (parent_id);

alter table public.parents enable row level security;
alter table public.auth_codes enable row level security;
alter table public.parent_sessions enable row level security;
