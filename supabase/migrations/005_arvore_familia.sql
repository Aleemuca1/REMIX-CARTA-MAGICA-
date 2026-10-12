-- Carta Mágica — Árvore de Natal da Família (enfeites com frases, compartilhada por link)
create table if not exists public.family_trees (
  token          text primary key,
  edit_key_hash  text not null,
  title          text not null default '',
  ornaments      jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
-- Só o servidor (chave secreta) lê e grava.
alter table public.family_trees enable row level security;
