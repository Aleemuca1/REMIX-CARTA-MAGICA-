import { Eye, Mailbox, PenLine, Printer, ShieldCheck, Volume2 } from "lucide-react";
import { IconBadge } from "./ui/Icons";
import Reveal from "./Reveal";

const ITEMS = [
  { icon: PenLine, title: "Feita para ele, de verdade", text: "Nome, idade, cidade e as conquistas do ano entram na carta. Nada de texto igual para todo mundo." },
  { icon: Volume2, title: "A voz do Papai Noel", text: "Ele lê a carta em voz alta, chamando a criança pelo nome. Com música de caixinha por baixo." },
  { icon: Mailbox, title: "Ele responde a cartinha", text: "Mande a foto do que seu filho escreveu. A resposta cita o que ele contou e responde as perguntas." },
  { icon: Eye, title: "Você vê antes de pagar", text: "A carta aparece inteira na tela. Só libera a voz completa, o PDF e os extras se quiser." },
  { icon: Printer, title: "Para guardar a vida toda", text: "PDF em folha A4 com selo e QR code da voz. Imprima, coloque no envelope e deixe na árvore." },
  { icon: ShieldCheck, title: "Privacidade das crianças", text: "Só o primeiro nome, idade e cidade. A foto da cartinha é lida na hora e não fica guardada." },
];

/** Bloco de confiança: por que escolher a Carta Mágica. */
export default function WhyUs() {
  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="porque">
      <Reveal className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">Por que a Carta Mágica</span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white">O Natal que seu filho vai lembrar para sempre</h2>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((it, i) => (
          <Reveal key={it.title} delay={0.05 * i}>
            <div className="h-full rounded-2xl bg-[#0B132B]/80 border border-white/10 p-5 hover:border-[#FFD166]/60 transition-colors">
              <IconBadge icon={it.icon} size="lg" tone={i % 3 === 1 ? "red" : i % 3 === 2 ? "green" : "gold"} className="mb-3" />
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight">{it.title}</h3>
              <p className="text-sm text-[#EDF2F4]/70 mt-1.5 leading-relaxed">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
