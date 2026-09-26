import { useState, type FormEvent } from "react";
import { X, Sparkles, Wand2 } from "lucide-react";
import { PlanType, Letter } from "../types";

interface CreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanType;
  onGenerated: (letter: Letter) => void;
}

export default function CreationWizard({
  isOpen,
  onClose,
  plan,
  onGenerated,
}: CreationWizardProps) {
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number>(6);
  const [city, setCity] = useState("");
  const [achievements, setAchievements] = useState("");
  const [giftRequest, setGiftRequest] = useState("");
  const [parentNotes, setParentNotes] = useState("");
  const [style, setStyle] = useState("mágico");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName,
          age,
          city,
          achievements,
          giftRequest,
          parentNotes,
          style,
          plan,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onGenerated(data);
      } else {
        // Fallback local se o backend não responder
        const mockLetter: Letter = {
          id: `cm-${Date.now()}`,
          childName,
          age,
          city: city || "Brasil",
          achievements: achievements || "Foi uma criança muito dedicada e generosa neste ano.",
          giftRequest: giftRequest || "Uma surpresa especial de Natal",
          parentNotes,
          style,
          plan,
          date: new Date().toLocaleDateString("pt-BR"),
          token: `${childName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
          deliveryStatus: "dispatched",
          trackingCode: `NP-${Math.floor(100000 + Math.random() * 900000)}-BR`,
          content: `Ho Ho Ho! Olá, meu querido ${childName}!

Daqui do alto do Polo Norte, onde a neve fofa cobre as colinas e a Aurora Boreal ilumina a nossa oficina mágica, observei no meu telescópio de cristal o quanto você cresceu e foi especial este ano!

Soube com muita alegria da sua grande conquista: ${achievements || "sua bondade e dedicação em tudo o que faz"}. É preciso ter um coração generoso e corajoso, e a Mamãe Noel e os duendes ficaram muito orgulhosos de você!

O Rudolph, nossa rena de nariz vermelho brilhante, já separou com carinho a sua cartinha sobre ${giftRequest || "seu pedido especial"}. Os elfos artesãos estão finalizando os preparativos para a grande noite.

Continue sendo essa criança tão luminosa, respeitando quem cuida de você com tanto amor.

Com todo o carinho do velhinho do Polo Norte,
Papai Noel 🎅`,
        };
        onGenerated(mockLetter);
      }
    } catch {
      // Fallback gracioso
      const fallbackLetter: Letter = {
        id: `cm-${Date.now()}`,
        childName,
        age,
        city: city || "Brasil",
        achievements,
        giftRequest,
        parentNotes,
        style,
        plan,
        date: new Date().toLocaleDateString("pt-BR"),
        token: `${childName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
        deliveryStatus: "dispatched",
        trackingCode: `NP-${Math.floor(100000 + Math.random() * 900000)}-BR`,
        content: `Ho Ho Ho! Olá, meu querido ${childName}!\n\nDaqui do Polo Norte, escrevo com muito carinho para parabenizar você por este ano maravilhoso! Continue sempre alegre, gentil e com o coração cheio de magia.\n\nCom carinho,\nPapai Noel`,
      };
      onGenerated(fallbackLetter);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B132B] border-2 border-[#FFD166] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative text-left shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EDF2F4]/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Fechar formulário"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-[#D90429] flex items-center justify-center text-sm shadow">
            🎅
          </span>
          <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider">
            Oficina Oficial do Polo Norte
          </span>
        </div>

        <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">
          Personalizar Carta do Papai Noel
        </h3>
        <p className="text-xs sm:text-sm text-[#EDF2F4]/70 mb-6">
          Preencha os detalhes para que o Papai Noel mencione fatos reais que vão emocionar seu filho.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-white font-semibold mb-1">Nome da criança *</label>
            <input
              type="text"
              required
              placeholder="Ex: Lucas, Sofia, Miguel..."
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFD166]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white font-semibold mb-1">Idade</label>
              <input
                type="number"
                min={1}
                max={14}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFD166]"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">Cidade / Estado</label>
              <input
                type="text"
                placeholder="Ex: São Paulo, SP"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFD166]"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">Conquistas / Orgulhos do ano</label>
            <textarea
              rows={2}
              placeholder="Ex: Aprendeu a ler, começou a andar de bicicleta, ajudou os avós..."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              className="w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FFD166]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">Presente ou desejo pedido</label>
            <input
              type="text"
              placeholder="Ex: Bicicleta, jogo de blocos, boneca..."
              value={giftRequest}
              onChange={(e) => setGiftRequest(e.target.value)}
              className="w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFD166]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">Recado carinhoso dos pais (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Lembrar de continuar dormindo no próprio quarto..."
              value={parentNotes}
              onChange={(e) => setParentNotes(e.target.value)}
              className="w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFD166]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !childName.trim()}
            className="w-full mt-6 bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg border border-[#FFD166]/50 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
            id="wizard-submit-btn"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-[#FFD166]" />
                <span>O Papai Noel está escrevendo...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-[#FFD166]" />
                <span>Gerar Carta Mágica</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
