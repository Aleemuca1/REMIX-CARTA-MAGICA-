import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import SnowCanvas from "./components/SnowCanvas";
import TwinkleStars from "./components/TwinkleStars";
import ScrollProgress from "./components/ScrollProgress";
import MagicCursor from "./components/MagicCursor";
import FloatingOrnaments from "./components/FloatingOrnaments";
import StickyMobileCTA from "./components/StickyMobileCTA";
import FAQSection from "./components/FAQSection";
import GiftSurprise from "./components/GiftSurprise";
import MusicToggle from "./components/MusicToggle";
import SantaGame from "./components/SantaGame";
import SnowDivider from "./components/SnowDivider";
import Footer from "./components/Footer";
import SnowToggle from "./components/SnowToggle";
import FrostEdges from "./components/FrostEdges";
import SnowGlobe from "./components/SnowGlobe";
import AdventCalendar from "./components/advent/AdventCalendar";
import AtelierSection from "./components/atelier/AtelierSection";
import SantaPeek from "./components/SantaPeek";
import { celebrateFrom } from "./lib/celebrate";
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

  // Link compartilhado: /natal/<token> abre a carta direto
  useEffect(() => {
    const m = window.location.pathname.match(/^\/natal\/([a-z0-9-]+)\/?$/i);
    if (!m) return;
    fetch(`/api/letter/${m[1].toLowerCase()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((l) => l && setActiveLetter(l))
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
    if (window.location.pathname.startsWith("/natal/")) window.history.replaceState(null, "", "/");
  };

  const handleStartWizard = (plan: PlanType = "free") => {
    setSelectedPlan(plan);
    setIsWizardOpen(true);
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLetterGenerated = (letter: Letter) => {
    setIsWizardOpen(false);
    setActiveLetter(letter);
  };

  return (
    <div className="min-h-screen bg-[#060B19] text-[#EDF2F4] relative flex flex-col selection:bg-[#FFD166] selection:text-[#060B19]">
      {/* Falling snow atmospheric effect */}
      <ScrollProgress />
      <TwinkleStars />
      <FloatingOrnaments />
      <MagicCursor />
      <SnowCanvas />

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

        {/* How It Works Section */}
        <SnowDivider />
        <HowItWorks onStartWizard={handleStartWizard} />

        {/* Presente surpresa interativo */}
        <GiftSurprise onStart={() => handleStartWizard("free")} />

        {/* Jogo de Natal */}
        <SantaGame onCreateLetter={() => handleStartWizard("free")} />

        {/* Ateliê de Natal: colorir e desenhar */}
        <AtelierSection />

        {/* Pricing & Value Section */}
        <SnowDivider />
        <AdventCalendar onUpgrade={() => handleScrollTo("precos")} />

        <SnowGlobe />

        <SnowDivider />
        <PricingSection onSelectPlan={handleStartWizard} />

        {/* Perguntas frequentes */}
        <SnowDivider />
        <FAQSection />
      </main>

      {/* Footer */}
      <SnowDivider />
      <Footer onScrollTo={handleScrollTo} />

      <StickyMobileCTA onClick={() => handleStartWizard("free")} />
      <MusicToggle />
      <SantaPeek />
      <SnowToggle />
      <FrostEdges />

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
      />

      {activeLetter && (
        <LetterView
          letter={activeLetter}
          onClose={closeLetter}
          onUpgrade={() => {
            closeLetter();
            setTimeout(() => handleScrollTo("precos"), 150);
          }}
        />
      )}
    </div>
  );
}
