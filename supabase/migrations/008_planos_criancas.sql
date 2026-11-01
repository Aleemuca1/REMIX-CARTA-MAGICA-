-- Carta Mágica — planos por número de crianças (Carta Completa: até 2 · Pacote Família: até 5).
-- Cada carta de irmão criada com o código do pedido pago guarda esse código, para contar o limite.
alter table public.letters add column if not exists access_code text;
create index if not exists letters_access_code_idx on public.letters (access_code);
