import { useEffect, useState } from "react";

/** Recursos ligados/desligados na Vercel (ex.: Música de Natal com MUSICA_ATIVA=sim). */
export type Features = { music: boolean };
let cache: Promise<Features> | null = null;
export function loadFeatures(): Promise<Features> {
  if (!cache)
    cache = fetch("/api/features")
      .then((r) => (r.ok ? r.json() : { music: false }))
      .catch(() => ({ music: false }));
  return cache;
}
export function useFeatures(): Features {
  const [f, setF] = useState<Features>({ music: false });
  useEffect(() => {
    let alive = true;
    loadFeatures().then((x) => alive && setF(x));
    return () => {
      alive = false;
    };
  }, []);
  return f;
}
