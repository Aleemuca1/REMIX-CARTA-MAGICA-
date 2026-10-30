-- Carta Mágica — cor escolhida para a carta (classico, rosa, lilas, azul, verde)
alter table public.letters add column if not exists theme text;
