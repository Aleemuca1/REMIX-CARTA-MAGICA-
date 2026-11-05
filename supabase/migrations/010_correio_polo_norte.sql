-- Carta Mágica — Correio do Polo Norte (a criança escreve, o Papai Noel responde)
-- A foto da cartinha NUNCA é guardada: só o texto que a IA leu.
alter table public.letters add column if not exists child_text     text;          -- o que a criança escreveu (transcrição)
alter table public.letters add column if not exists wishes         jsonb;         -- {pedidos:[], perguntas:[], contou:[]}
alter table public.letters add column if not exists deliver_at     timestamptz;   -- quando a resposta fica visível para a criança
alter table public.letters add column if not exists review_status  text;          -- null | 'pending' (tema sensível, aguarda revisão) | 'approved' | 'blocked'
alter table public.letters add column if not exists protocol       bigint;        -- "Sua carta é a nº 12.384"
alter table public.letters add column if not exists preview_key    text;          -- quem enviou vê a prévia antes da entrega
create sequence if not exists public.polo_norte_protocolo start 12001;
create index if not exists letters_protocol_idx on public.letters (protocol);
