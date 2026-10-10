-- Carta Mágica — permite o plano "Natal Completo" (natal) nas cartas
alter table public.letters drop constraint if exists letters_plan_check;
alter table public.letters add constraint letters_plan_check check (plan in ('free','pro','natal'));
