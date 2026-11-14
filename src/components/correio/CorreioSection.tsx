import { motion } from "motion/react";
import { Gift, Mailbox, Star, TreePine } from "lucide-react";
import { AVULSA, NORMAL, brl } from "../../lib/pricing";
import { Camera, Mail, Printer, Sparkles } from "lucide-react";
import Reveal from "../Reveal";

/** Bloco da página inicial: "Seu filho escreveu para o Papai Noel? Ele responde." */
export default function CorreioSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="correio">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/60 bg-gradient-to-br from-[#2B0B10] via-[#1C2541] to-[#0B132B] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D90429]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3"><Mailbox className="w-3.5 h-3.5" /> Novo · Correio do Polo Norte</span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Seu filho escreveu para o Papai Noel? Ele responde.</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              Tire uma foto da cartinha. O Papai Noel lê a letra dele (até com os errinhos), responde cada pergunta, comenta os pedidos sem prometer nada e assina. Você vê a
              resposta antes e escolhe se ela chega agora ou na <b className="text-[#FFD166]">véspera de Natal</b>.
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/75 space-y-1.5 mb-6 inline-block text-left">
              <li className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#FFD166]" /> Papel timbrado do Polo Norte grátis para imprimir
              </li>
              <li className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FFD166]" /> Foto lida na hora e nunca guardada
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD166]" /> Resposta com voz, PDF e número de protocolo
              </li>
            </ul>
            <p className="mb-5 text-sm text-white/85">
              Escrever é <b className="text-[#2DC653]">grátis</b> · a resposta do Papai Noel (até 2 cartinhas), com a voz dele, PDF e certificado, sai por{" "}
              <s className="text-white/50">{brl(NORMAL.pro)}</s> <b className="text-[#FFD166] text-base">{brl(AVULSA)}</b>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button onClick={onStart} className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-extrabold px-7 py-4 rounded-full inline-flex items-center justify-center gap-2 shadow-lg border border-[#FFD166]/60 btn-shine animate-soft-pulse cursor-pointer text-base sm:text-lg" id="correio-open-btn" data-celebrate>
                <Mail className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Enviar a cartinha</span>
              </button>
              <a href="/papel-timbrado-polo-norte.pdf" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-4 rounded-full inline-flex items-center justify-center gap-2 border border-white/15 text-sm sm:text-base" id="correio-papel">
                <Printer className="w-4 h-4" /> Baixar papel timbrado
              </a>
            </div>
          </div>
          {/* ilustração: cartinha da criança e carimbo "recebida" */}
          <div className="relative z-10 flex justify-center">
            <motion.div initial={{ rotate: -5 }} animate={{ rotate: [-5, -3, -5], y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity }} className="relative w-[280px] sm:w-[320px] bg-[#FCF9F2] text-[#2B2118] rounded-2xl border-4 border-[#FFD166] shadow-2xl p-5">
              <div className="font-cinzel text-[9px] font-extrabold tracking-[0.2em] text-[#9B021A] border-b border-[#9B021A]/20 pb-2 mb-3">✦ PAPEL TIMBRADO DO POLO NORTE</div>
              <p className="font-ps text-[22px] leading-snug text-[#2B2118]">
                Querido Papai Noel,
                <br />
                eu sou o Miguel e tenho 7 anos. Este ano aprendi a andar de bicicleta! As renas comem cenoura? Eu queria um kit de pintura.
                <br />
                Um abraço, Miguel
              </p>
              <div className="mt-3 flex gap-2 text-[#9B021A]" aria-hidden="true">
                <TreePine className="w-6 h-6 text-[#1F7A47]" />
                <Star className="w-6 h-6 text-[#D4A537]" fill="currentColor" />
                <Gift className="w-6 h-6" />
              </div>
              <motion.div initial={{ scale: 2, opacity: 0, rotate: -30 }} whileInView={{ scale: 1, opacity: 1, rotate: -14 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.5 }} className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full border-4 border-double border-[#D90429] bg-[#FCF9F2] grid place-items-center text-[#D90429] text-center font-cinzel text-[8px] font-extrabold tracking-widest leading-tight shadow-lg">
                CORREIO DO
                <br />
                <span className="font-xmas text-lg tracking-normal">Polo Norte</span>
                <br />
                RECEBIDA ✓
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
