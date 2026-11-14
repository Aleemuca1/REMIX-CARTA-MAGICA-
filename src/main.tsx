import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LegalPage from "./components/legal/LegalPage";
import FamilyPage from "./components/family/FamilyPage";
import CookieBanner from "./components/legal/CookieBanner";
import { LEGAL_DOCS } from "./legal/content";
import "./index.css";

// Páginas legais: /termos, /privacidade, /cookies
const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase() as keyof typeof LEGAL_DOCS;
const legalDoc = LEGAL_DOCS[slug];
// Página pública da família: /familia/silva
const familySlug = window.location.pathname.match(/^\/familia\/([a-z0-9-]{3,40})\/?$/i)?.[1];

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {familySlug ? <FamilyPage slug={familySlug.toLowerCase()} /> : legalDoc ? <LegalPage doc={legalDoc} /> : <App />}
      <CookieBanner />
    </StrictMode>
  );
}
