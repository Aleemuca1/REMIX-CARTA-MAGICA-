import { X, Volume2, Stamp } from "lucide-react";

interface SampleLetterPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomization: () => void;
}

export default function SampleLetterPreview({
  isOpen,
  onClose,
  onStartCustomization,
}: SampleLetterPreviewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg parchment-bg text-[#1C2541] rounded-3xl p-6 sm:p-8 border-4 border-[#FFD166] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C2541]/60 hover:text-[#1C2541] p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Fechar amostra"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header bar */}
        <div className="flex justify-between items-center border-b-2 border-[#1C2541]/20 pb-4 mb-4">
          <div>
            <span className="font-cinzel text-[10px] font-extrabold tracking-widest text-[#9B021A] uppercase block">
              CORREIO OFICIAL DO POLO NORTE
            </span>
            <span className="text-xs text-[#1C2541]/70 font-serif italic">
              Exemplo de carta gerada com carinho e precisão
            </span>
          </div>
          <Stamp className="w-6 h-6 text-[#9B021A]/60" />
        </div>

        {/* Sample Content */}
        <div className="font-serif text-sm sm:text-base leading-relaxed space-y-3 text-[#1C2541] max-h-[60vh] overflow-y-auto pr-2">
          <p className="font-cinzel font-bold text-[#9B021A] text-lg">
            Ho Ho Ho! Olá, meu querido Lucas!
          </p>
          <p>
            Daqui do alto da montanha gelada do Polo Norte, onde as luzes da Aurora Boreal dançam no céu estrelado, olhei através do meu grande telescópio de cristal dourado e avistei você aí em São Paulo!
          </p>
          <p>
            Você nem imagina o quanto os duendes artesãos e a Mamãe Noel vibraram quando souberam da sua grande coragem neste ano: aprender a andar de bicicleta sem rodinhas! É preciso ter um coração muito valente para tentar, cair, levantar e conseguir pedalar com o vento no rosto.
          </p>
          <p>
            O Rudolph, a rena de nariz vermelho brilhante, já separou com todo carinho a sua cartinha sobre o dinossauro robô. Nossos elfos inventores estão dando os últimos retoques na oficina mágica.
          </p>
          <p className="italic text-[#1C2541]/85">
            Lembre-se sempre de ser esse menino gentil, amoroso e obediente.
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#1C2541]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#9B021A] font-semibold">
            <Volume2 className="w-4 h-4 text-[#D90429]" />
            <span>Áudio narrado em alta fidelidade no plano Pro</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onStartCustomization();
            }}
            className="w-full sm:w-auto bg-[#D90429] hover:bg-[#EF233C] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            Personalizar para meu filho
          </button>
        </div>
      </div>
    </div>
  );
}
