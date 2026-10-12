import { ArrowLeft } from "lucide-react";

/** Botão "Voltar" grande e claro, usado em todas as janelas do site. */
export default function BackButton({
  onClick,
  light = false,
  className = "",
  label = "Voltar",
}: {
  onClick: () => void;
  light?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 min-h-[40px] text-sm font-bold transition-colors cursor-pointer ${
        light
          ? "bg-[#1C2541]/10 hover:bg-[#1C2541]/20 text-[#1C2541]"
          : "bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-sm"
      } ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
