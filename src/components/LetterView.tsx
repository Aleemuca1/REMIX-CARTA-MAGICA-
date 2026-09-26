import { X, Printer, Share2, Volume2, Sparkles, Stamp } from "lucide-react";
import { Letter } from "../types";

interface LetterViewProps {
  letter: Letter;
  onClose: () => void;
}

export default function LetterView({ letter, onClose }: LetterViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Carta do Papai Noel para ${letter.childName}`,
        text: `Veja a cartinha mágica oficial que o Papai Noel escreveu para ${letter.childName}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl parchment-bg text-[#1C2541] rounded-3xl p-6 sm:p-10 border-4 border-[#FFD166] shadow-2xl my-6 print:border-none print:shadow-none print:p-6 print:rounded-none">
        {/* Controls - Hidden on Print */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b-2 border-[#1C2541]/15 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs font-bold text-[#9B021A] uppercase tracking-wider">
              Carta Gerada com Sucesso
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#1C2541] hover:bg-[#2A3555] text-white p-2 rounded-full text-xs flex items-center gap-1.5 px-3 transition-colors cursor-pointer"
              title="Imprimir carta"
            >
              <Printer className="w-4 h-4 text-[#FFD166]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={handleShare}
              className="bg-[#1C2541] hover:bg-[#2A3555] text-white p-2 rounded-full text-xs flex items-center gap-1.5 px-3 transition-colors cursor-pointer"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4 text-[#FFD166]" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#1C2541]/70 hover:text-[#1C2541] p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Fechar carta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Letterhead */}
        <div className="flex justify-between items-center mb-6 border-b border-[#1C2541]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9B021A]" />
              <span className="font-cinzel text-xs sm:text-sm font-extrabold tracking-widest text-[#9B021A] uppercase">
                CORREIO REAL DO POLO NORTE
              </span>
            </div>
            <span className="text-xs text-[#1C2541]/70 font-serif italic">
              Expedição Oficial de Natal • Registro #{letter.trackingCode}
            </span>
          </div>
          <Stamp className="w-7 h-7 text-[#9B021A]/60" />
        </div>

        {/* Destination Details */}
        <div className="mb-6 flex justify-between items-center text-xs">
          <span className="bg-[#D90429]/10 text-[#9B021A] font-bold px-3 py-1 rounded-full border border-[#D90429]/20">
            Para: {letter.childName}, {letter.age} anos • {letter.city}
          </span>
          <span className="text-[#1C2541]/60 font-mono">
            {letter.date}
          </span>
        </div>

        {/* Letter Body */}
        <div className="font-serif text-sm sm:text-base leading-relaxed space-y-4 text-[#1C2541] whitespace-pre-line my-4">
          {letter.content}
        </div>

        {/* Footer with Seals and Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-[#1C2541]/15 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full wax-seal flex items-center justify-center text-[9px] font-bold text-[#FFD166] border border-[#FFD166]">
                2026
              </span>
              <div>
                <span className="text-[10px] uppercase font-cinzel font-bold text-[#9B021A] block">
                  Selo Real do Polo Norte
                </span>
                <span className="text-[9px] text-[#1C2541]/60">
                  Autenticidade Garantida
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="font-handwriting text-3xl sm:text-4xl text-[#9B021A] font-bold block -mb-2">
              Papai Noel
            </span>
            <span className="text-[10px] text-[#1C2541]/60 uppercase tracking-wider font-cinzel">
              Oficina Central de Brinquedos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
