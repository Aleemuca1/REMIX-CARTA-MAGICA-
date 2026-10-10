/** Divisória ondulada de neve entre as seções, com flocos caindo. */
export default function SnowDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative w-full h-14 sm:h-20 pointer-events-none ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0 40 C 180 10, 360 70, 540 40 S 900 10, 1080 40 S 1320 70, 1440 38 V80 H0Z" fill="#0B132B" opacity="0.9" />
        <path d="M0 52 C 200 30, 380 78, 600 52 S 980 26, 1180 54 S 1380 70, 1440 56 V80 H0Z" fill="#101A36" />
        <path d="M0 46 C 180 16, 360 76, 540 46 S 900 16, 1080 46 S 1320 76, 1440 44" fill="none" stroke="#EEF4FF" strokeOpacity="0.35" strokeWidth="2" />
      </svg>
      {[8, 22, 37, 51, 64, 79, 92].map((l, i) => (
        <span
          key={i}
          className="absolute text-white/60 divider-flake"
          style={{ left: `${l}%`, top: 0, fontSize: 10 + (i % 3) * 4, animationDelay: `${i * 0.6}s` }}
        >
          ❄
        </span>
      ))}
    </div>
  );
}
