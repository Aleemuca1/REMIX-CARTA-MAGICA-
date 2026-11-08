import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import SnowCanvas from "./components/SnowCanvas";
import TwinkleStars from "./components/TwinkleStars";
import StickyMobileCTA from "./components/StickyMobileCTA";
import FAQSection from "./components/FAQSection";
import GiftSurprise from "./components/GiftSurprise";
import MusicToggle from "./components/MusicToggle";
import SantaGame from "./components/SantaGame";
import PolarBearGame from "./components/PolarBearGame";
import FamilySection from "./components/family/FamilySection";
import MemoryGame from "./components/memory/MemoryGame";
import NiceListQuiz from "./components/NiceListQuiz";
import SantaTracker from "./components/SantaTracker";
import LightTree from "./components/LightTree";
import WorldChristmas from "./components/WorldChristmas";
import SnowDivider from "./components/SnowDivider";
import Footer from "./components/Footer";
import SnowToggle from "./components/SnowToggle";
import SnowGlobe from "./components/SnowGlobe";
import AdventCalendar from "./components/advent/AdventCalendar";
import AtelierSection from "./components/atelier/AtelierSection";
import TreeSection from "./components/tree/TreeSection";
import ExtrasHub, { isExtraId, openExtra } from "./components/ExtrasHub";
import CorreioSection from "./components/correio/CorreioSection";
import WhyUs from "./components/WhyUs";
import PromoBar from "./components/PromoBar";
import CorreioFlow from "./components/correio/CorreioFlow";
import OnTheWay from "./components/correio/OnTheWay";
import { fetchLetter } from "./lib/correio";
import { celebrateFrom } from "./lib/celebrate";
import { startCheckout, usePaymentReturn } from "./lib/payment";
import { loadMe, parentForCheckout } from "./lib/auth";
import AuthHost from "./components/auth/AuthHost";
import PlanChooser, { type PaidChoice } from "./components/PlanChooser";
import { AnimatePresence } from "motion/react";
import PaymentToast from "./components/PaymentToast";
import ScrollTopButton from "./components/ScrollTopButton";
import { snow } from "./lib/snow";
import SampleLetterPreview from "./components/SampleLetterPreview";
import CreationWizard from "./components/CreationWizard";
import LetterView from "./components/LetterView";
import { PlanType, Letter } from "./types";

export default function App() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  // carta que vai junto no pagamento; "nova" = pagar antes de criar a carta
  const [chooseFor, setChooseFor] = useState<Letter | "nova" | null>(null);
  const [correioOpen, setCorreioOpen] = useState(false);
  const [onTheWay, setOnTheWay] = useState<{ childName: string; deliverAt?: string; protocol?: number; message: string } | null>(null);
  const [payMsg, setPayMsg] = useState<{ kind: "wait" | "ok" | "error"; text: string } | null>(null);

  // volta do Asaas: confirma o pagamento e reabre a carta já liberada
  usePaymentReturn(setPayMsg, setActiveLetter, () => handleStartWizard("free"));

  useEffect(() => {
    void loadMe();
    // links compartilhados como /#lista ou /#rastreador abrem direto na seção
    const id = window.location.hash.slice(1);
    // links das páginas do guia: /#criar abre direto a criação da carta
    if (id === "criar") {
      setTimeout(() => setIsWizardOpen(true), 400);
      window.history.replaceState(null, "", "/");
      return;
    }
    if (id === "enviar-cartinha") {
      setTimeout(() => setCorreioOpen(true), 400);
      window.history.replaceState(null, "", "/");
      return;
    }
    if (/^[a-z-]{2,30}$/.test(id)) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 700);
  }, []);

  const pay = async (letter: Letter | null, plan: PaidChoice | "upgrade", code?: string) => {
    // a compra fica na conta do responsável (e o e-mail dele recebe tudo)
    if ((await parentForCheckout()) === "cancel") return;
    setPayMsg({ kind: "wait", text: "Abrindo o pagamento seguro do Asaas..." });
    const err = await startCheckout(letter?.id ?? null, plan, code);
    if (err) setPayMsg({ kind: "error", text: err });
  };

  // Link compartilhado: /natal/<token> abre a carta direto
  useEffect(() => {
    const m = window.location.pathname.match(/^\/natal\/([a-z0-9-]+)\/?$/i);
    if (!m) return;
    fetchLetter(m[1].toLowerCase())
      .then((r) => {
        if (r.letter) setActiveLetter(r.letter);
        else if (r.locked) setOnTheWay(r.locked);
      })
      .catch(() => {});
  }, []);

  // Clique em área vazia da página: explosão de flocos de neve.
  // Botões principais (data-celebrate) soltam uma chuva de presentes.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const cel = el.closest("[data-celebrate]") as HTMLElement | null;
      if (cel) {
        celebrateFrom(cel);
        return;
      }
      if (el.closest("button, a, input, textarea, select, label, canvas, [role='button'], .parchment-bg")) return;
      snow.burst(e.clientX, e.clientY);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const closeLetter = () => {
    setActiveLetter(null);
    if (window.location.pathname.startsWith("/natal/")) setTimeout(() => window.history.replaceState(null, "", "/"), 80);
  };

  const handleStartWizard = (plan: PlanType = "free") => {
    setSelectedPlan(plan);
    setIsWizardOpen(true);
  };

  const handleScrollTo = (id: string) => {
    if (!document.getElementById(id) && isExtraId(id)) return openExtra(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLetterGenerated = (letter: Letter) => {
    setIsWizardOpen(false);
    setActiveLetter(letter);
    // escolheu um plano pago: a carta já fica salva e seguimos para o pagamento
    if (selectedPlan === "natal" || selectedPlan === "familia") void pay(letter, selectedPlan);
    else if (selectedPlan === "pro") void pay(letter, "natal");
  };

  return (
    <div className="min-h-screen bg-[#060B19] text-[#EDF2F4] relative flex flex-col selection:bg-[#FFD166] selection:text-[#060B19]">
      {/* Falling snow atmospheric effect */}
      <TwinkleStars />
      <SnowCanvas />

      {/* Black Friday */}
      <PromoBar onClick={() => handleScrollTo("precos")} />

      {/* Navigation Header */}
      <Navbar onStartWizard={handleStartWizard} onScrollTo={handleScrollTo} />

      {/* Main Landing Page Content */}
      <main className="flex-1 w-full">
        {/* Hero Section with Refined Santa Flight Animation */}
        <LandingHero
          onStartWizard={handleStartWizard}
          onScrollTo={handleScrollTo}
          onViewSample={() => setIsSampleOpen(true)}
        />

        {/* Correio do Polo Norte: a criança escreve, o Papai Noel responde */}
        <CorreioSection onStart={() => setCorreioOpen(true)} />

        {/* Como funciona: 3 passos */}
        <SnowDivider />
        <HowItWorks onStartWizard={handleStartWizard} />

        {/* Por que a Carta Mágica */}
        <WhyUs />

        {/* Planos logo depois: o foco é a carta */}
        <SnowDivider />
        <PricingSection onSelectPlan={(p) => (p === "natal" || p === "familia" ? void pay(null, p) : handleStartWizard(p))} />

        {/* Bônus para a família: tudo guardado num baú, abre quando a família quiser */}
        <SnowDivider />
        <ExtrasHub>
          <TreeSection onUpgrade={() => setChooseFor("nova")} />
          <AdventCalendar onUpgrade={() => setChooseFor("nova")} />
          <NiceListQuiz onCreateLetter={() => handleStartWizard("free")} />
          <SantaTracker onCreateLetter={() => handleStartWizard("free")} />
          <SantaGame onCreateLetter={() => handleStartWizard("free")} />
          <PolarBearGame onCreateLetter={() => handleStartWizard("free")} />
          <MemoryGame onUpgrade={() => setChooseFor("nova")} onCreateLetter={() => handleStartWizard("free")} />
          <AtelierSection onUpgrade={() => setChooseFor("nova")} />
          <FamilySection onUpgrade={() => setChooseFor("nova")} />
          <LightTree onCreateLetter={() => handleStartWizard("free")} />
          <WorldChristmas onCreateLetter={() => handleStartWizard("free")} />
          <GiftSurprise onStart={() => handleStartWizard("free")} />
          <SnowGlobe />
        </ExtrasHub>

        {/* Perguntas frequentes */}
        <SnowDivider />
        <FAQSection />
      </main>

      {/* Footer */}
      <SnowDivider />
      <Footer onScrollTo={handleScrollTo} />

      <StickyMobileCTA onClick={() => handleStartWizard("free")} />
      <MusicToggle />
      <SnowToggle />

      {/* Interactive Modals */}
      <SampleLetterPreview
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
        onStartCustomization={() => handleStartWizard("pro")}
      />

      <CreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        plan={selectedPlan}
        onGenerated={handleLetterGenerated}
        onSeePlans={() => setChooseFor("nova")}
      />

      {activeLetter && (
        <LetterView
          letter={activeLetter}
          onClose={closeLetter}
          onUpgrade={() => setChooseFor(activeLetter)}
        />
      )}

      <AnimatePresence>
        {correioOpen && (
          <CorreioFlow
            onClose={() => setCorreioOpen(false)}
            onOpenLetter={(l) => {
              setCorreioOpen(false);
              setActiveLetter(l);
            }}
            onSeePlans={() => {
              setCorreioOpen(false);
              setChooseFor("nova");
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {onTheWay && (
          <OnTheWay
            {...onTheWay}
            onClose={() => {
              setOnTheWay(null);
              setTimeout(() => window.history.replaceState(null, "", "/"), 80);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chooseFor && (
          <PlanChooser
            onClose={() => setChooseFor(null)}
            onPick={(p) => {
              const l = chooseFor;
              setChooseFor(null);
              void pay(l === "nova" ? null : l, p);
            }}
          />
        )}
      </AnimatePresence>

      <AuthHost
        onOpenLetter={(token) =>
          fetchLetter(token)
            .then((r) => (r.letter ? setActiveLetter(r.letter) : r.locked && setOnTheWay(r.locked)))
            .catch(() => {})
        }
        onCreateLetter={() => handleStartWizard("free")}
        onPay={(plan, code) => void pay(null, plan, code)}
      />

      <ScrollTopButton />
      <PaymentToast msg={payMsg} onClose={() => setPayMsg(null)} />
    </div>
  );
}
