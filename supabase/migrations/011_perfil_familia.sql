-- Perfil da família (Painel dos Pais) + página pública /familia/:slug + lembretes por e-mail
create table if not exists public.family_profiles (
  parent_id uuid primary key references public.parents(id) on delete cascade,
  family_name text,
  bio text,
  avatar text,
  children jsonb not null default '[]'::jsonb,
  slug text unique,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.family_profiles enable row level security;
alter table public.letters add column if not exists reminder_sent_at timestamptz;
alter table public.letters add column if not exists eve_reminder_at timestamptz;
