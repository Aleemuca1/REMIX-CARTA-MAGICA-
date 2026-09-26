import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import SnowCanvas from "./components/SnowCanvas";
import SampleLetterPreview from "./components/SampleLetterPreview";
import CreationWizard from "./components/CreationWizard";
import LetterView from "./components/LetterView";
import { PlanType, Letter } from "./types";

export default function App() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);

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
        <HowItWorks onStartWizard={handleStartWizard} />

        {/* Pricing & Value Section */}
        <PricingSection onSelectPlan={handleStartWizard} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#040812] py-8 text-center text-xs text-[#EDF2F4]/60">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-cinzel text-sm text-[#FFD166]">
            Carta Mágica do Papai Noel • Polo Norte 2026
          </p>
          <p>
            Transformando o Natal das crianças com inteligência artificial, carinho e memórias inesquecíveis.
          </p>
          <p className="text-[10px] text-[#EDF2F4]/40 pt-2">
            © 2026 Carta Mágica. Todos os direitos reservados.
          </p>
        </div>
      </footer>

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
        <LetterView letter={activeLetter} onClose={() => setActiveLetter(null)} />
      )}
    </div>
  );
}
