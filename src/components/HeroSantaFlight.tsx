import { useState, useEffect } from "react";
import santaSleighHeroImg from "../assets/images/santa_sleigh_hero_1789648784565.jpg";

/**
 * Componente HeroSantaFlight
 * 
 * Renderiza o Papai Noel com trenó e renas no céu do HERO.
 * Utiliza animação CSS 'keyframes' com alteração suave de 'transform: translate'
 * criando o efeito de voo oscilante natural e cinematográfico.
 * Respeita estritamente a preferência do usuário por redução de movimento ('prefers-reduced-motion').
 */
export default function HeroSantaFlight() {
  const [hasReducedMotion, setHasReducedMotion] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Detecta preferência do sistema operacional por redução de movimento
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setHasReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      id="hero-santa-container"
      className="relative flex items-center justify-end w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] pointer-events-none select-none"
      role="img"
      aria-label="Papai Noel voando em seu trenó de Natal"
    >
      {/* Estilos CSS Scoped com keyframes para oscilação com transform: translate */}
      <style>{`
        @keyframes santaOscillatingFlight {
          0% {
            transform: translate(0px, 0px);
          }
          20% {
            transform: translate(-5px, -10px);
          }
          40% {
            transform: translate(4px, -4px);
          }
          60% {
            transform: translate(-3px, -12px);
          }
          80% {
            transform: translate(5px, -6px);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }

        @keyframes santaGentleTilt {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-1.5deg);
          }
          75% {
            transform: rotate(1deg);
          }
        }

        @keyframes santaStardustShimmer {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        .santa-flying-motion {
          animation: santaOscillatingFlight 5.8s ease-in-out infinite;
          will-change: transform;
        }

        .santa-tilt-motion {
          animation: santaGentleTilt 5.8s ease-in-out infinite;
          will-change: transform;
        }

        .santa-stardust {
          animation: santaStardustShimmer 3s ease-in-out infinite;
        }

        /* Respeito estrito a prefers-reduced-motion via CSS Media Query */
        @media (prefers-reduced-motion: reduce) {
          .santa-flying-motion,
          .santa-tilt-motion,
          .santa-stardust {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Camada externa com voo oscilante via CSS keyframes transform: translate */}
      <div
        className={`relative w-full flex items-center justify-end ${
          hasReducedMotion ? "" : "santa-flying-motion"
        }`}
        id="hero-santa-flight-wrapper"
      >
        {/* Brilho celestial e poeira estelar suave atrás do trenó */}
        <div
          className={`absolute -inset-2 bg-radial from-[#FFD166]/20 via-[#D90429]/10 to-transparent blur-xl rounded-full -z-10 ${
            hasReducedMotion ? "opacity-40" : "santa-stardust"
          }`}
        />

        {/* Camada de inclinação sutil acompanhando a aerodinâmica do voo */}
        <div className={`relative w-full flex justify-end ${hasReducedMotion ? "" : "santa-tilt-motion"}`}>
          {!imgError ? (
            <img
              src={santaSleighHeroImg}
              alt="Papai Noel oficial voando em seu trenó mágico"
              className="w-full h-auto max-h-[130px] sm:max-h-[160px] lg:max-h-[175px] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)] drop-shadow-[0_0_15px_rgba(255,209,102,0.3)] rounded-2xl"
              onError={() => setImgError(true)}
              loading="eager"
            />
          ) : (
            /* Ilustração SVG vetorial de alta precisão como fallback seguro */
            <div className="relative w-full h-[120px] sm:h-[140px] flex items-center justify-end">
              <svg
                viewBox="0 0 360 140"
                className="w-full h-full max-w-[340px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] drop-shadow-[0_0_18px_rgba(255,209,102,0.35)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Rastro Mágico Dourado */}
                <path
                  d="M10 80 Q 70 70, 140 85 T 230 82"
                  stroke="url(#goldTrail)"
                  strokeWidth="2.5"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <circle cx="45" cy="74" r="1.5" fill="#FFE194" />
                <circle cx="85" cy="79" r="2" fill="#FFD166" />
                <circle cx="120" cy="73" r="1.5" fill="#FFF" />
                <circle cx="160" cy="84" r="2" fill="#FFE194" />

                {/* Rena Rudolph à Frente */}
                <g id="rudolph-lead" transform="translate(235, 30)">
                  {/* Nariz Vermelho Brilhante */}
                  <circle cx="88" cy="22" r="3.5" fill="#EF233C" />
                  <circle cx="88" cy="22" r="7" fill="#EF233C" opacity="0.35" className="animate-ping" />
                  {/* Cabeça e Chifres */}
                  <path d="M72 26 C 72 20, 80 18, 86 22 C 86 28, 76 34, 70 32 Z" fill="#8B4513" />
                  {/* Chifre dourado */}
                  <path d="M74 18 L 72 8 M 73 13 L 78 9 M 72 8 L 68 5" stroke="#C49A45" strokeWidth="2" strokeLinecap="round" />
                  {/* Corpo da rena */}
                  <ellipse cx="50" cy="40" rx="22" ry="12" fill="#8B4513" />
                  <path d="M66 32 C 60 30, 52 32, 45 35" stroke="#A0522D" strokeWidth="3" strokeLinecap="round" />
                  {/* Pernas em voo */}
                  <path d="M60 48 L 74 65 M 56 49 L 68 68" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M38 48 L 22 62 M 42 48 L 30 64" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Coleira com Guizos */}
                  <path d="M68 30 L 63 42" stroke="#D90429" strokeWidth="2.5" />
                  <circle cx="65" cy="36" r="2" fill="#FFD166" />
                </g>

                {/* Rédeas Mágicas */}
                <path d="M195 62 Q 230 60, 270 58" stroke="#FFD166" strokeWidth="1.2" opacity="0.8" />

                {/* Trenó Tradicional de Madeira e Ouro */}
                <g id="sleigh-group" transform="translate(70, 35)">
                  {/* Saco de Presentes */}
                  <path
                    d="M38 32 C 30 18, 55 12, 65 24 C 72 32, 70 45, 62 48 C 48 50, 42 42, 38 32 Z"
                    fill="#2D5A27"
                  />
                  {/* Fita dourada no saco */}
                  <path d="M48 20 C 52 24, 58 22, 60 20" stroke="#FFD166" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="54" cy="20" r="2.5" fill="#EF233C" />

                  {/* Papai Noel */}
                  <g id="santa-figure">
                    {/* Corpo casaco vermelho */}
                    <path d="M72 40 C 66 28, 86 24, 94 36 C 98 44, 94 54, 88 56 Z" fill="#D90429" />
                    {/* Cinto preto com fivela de ouro */}
                    <path d="M75 46 L 93 45" stroke="#1C2541" strokeWidth="4" />
                    <rect x="81" y="43" width="6" height="6" fill="#FFD166" rx="1" />
                    {/* Barba Branca */}
                    <path
                      d="M86 32 C 86 42, 98 44, 98 34 C 98 28, 92 26, 86 32 Z"
                      fill="#FFF"
                    />
                    {/* Rosto */}
                    <circle cx="92" cy="28" r="4.5" fill="#FDDEC0" />
                    {/* Nariz vermelho */}
                    <circle cx="95" cy="29" r="1.2" fill="#EF233C" />
                    {/* Gorro Vermelho com Pom-pom */}
                    <path d="M88 26 C 90 20, 100 20, 96 25 Z" fill="#D90429" />
                    <circle cx="100" cy="26" r="2.2" fill="#FFF" />
                    {/* Braço acenando */}
                    <path d="M88 38 Q 96 32, 102 34" stroke="#D90429" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="103" cy="34" r="3" fill="#FFF" />
                  </g>

                  {/* Corpo do Trenó */}
                  <path
                    d="M25 48 C 25 35, 60 35, 95 44 C 115 50, 120 62, 110 68 C 75 70, 35 68, 25 48 Z"
                    fill="url(#sleighRed)"
                  />
                  {/* Borda Dourada Imperial */}
                  <path
                    d="M23 48 C 25 33, 62 33, 98 43 C 118 49, 122 62, 110 68"
                    stroke="#FFD166"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Patins de Ouro com Voluta Elegante */}
                  <path
                    d="M15 76 C 45 74, 95 75, 125 74 C 135 74, 142 66, 138 58"
                    stroke="#FFD166"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path d="M40 68 L 42 75 M 85 68 L 87 75" stroke="#FFE194" strokeWidth="2.5" />
                </g>

                {/* Definições de Gradientes */}
                <defs>
                  <linearGradient id="goldTrail" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFE194" stopOpacity="0" />
                    <stop offset="50%" stopColor="#FFD166" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFF" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="sleighRed" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#EF233C" />
                    <stop offset="100%" stopColor="#800016" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
