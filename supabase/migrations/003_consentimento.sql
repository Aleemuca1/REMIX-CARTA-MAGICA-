-- Carta Mágica — registra quando o responsável autorizou o uso dos dados da criança (LGPD art. 14)
alter table public.letters add column if not exists parental_consent_at timestamptz;
