import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LegalPage from "./components/legal/LegalPage";
import CookieBanner from "./components/legal/CookieBanner";
import { LEGAL_DOCS } from "./legal/content";
import "./index.css";

// Páginas legais: /termos, /privacidade, /cookies
const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase() as keyof typeof LEGAL_DOCS;
const legalDoc = LEGAL_DOCS[slug];

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {legalDoc ? <LegalPage doc={legalDoc} /> : <App />}
      <CookieBanner />
    </StrictMode>
  );
}
