import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function ChristmasCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let target = new Date(currentYear, 11, 25, 0, 0, 0);
      if (now.getTime() > target.getTime()) {
        target = new Date(currentYear + 1, 11, 25, 0, 0, 0);
      }
      const diff = Math.max(0, target.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 bg-[#0B132B]/80 border border-[#FFD166]/30 px-3.5 py-1.5 rounded-full text-xs text-[#EDF2F4]/90 shadow-sm backdrop-blur-sm">
      <Clock className="w-3.5 h-3.5 text-[#FFD166] shrink-0" />
      <span className="text-[11px] sm:text-xs font-medium text-[#FFD166]">Faltam para o Natal:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-white text-[11px] sm:text-xs">
        <span className="bg-[#D90429]/40 px-1.5 py-0.5 rounded border border-[#EF233C]/40">{timeLeft.days}d</span>
        <span>:</span>
        <span className="bg-[#D90429]/40 px-1.5 py-0.5 rounded border border-[#EF233C]/40">{String(timeLeft.hours).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="bg-[#D90429]/40 px-1.5 py-0.5 rounded border border-[#EF233C]/40">{String(timeLeft.minutes).padStart(2, "0")}m</span>
        <span>:</span>
        <span className="bg-[#D90429]/40 px-1.5 py-0.5 rounded border border-[#EF233C]/40">{String(timeLeft.seconds).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
