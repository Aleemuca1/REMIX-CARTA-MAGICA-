/** O Papai Noel fala uma frase curta com a voz do aparelho (grave e devagar). */
export function santaSpeak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?]/gu, ""));
    u.lang = "pt-BR";
    const pt = s.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("pt"));
    u.voice = pt.find((v) => /daniel|ricardo|ant[oô]nio|felipe|male|masculin/i.test(v.name)) || pt.find((v) => /br/i.test(v.lang)) || pt[0] || null;
    u.pitch = 0.75;
    u.rate = 0.92;
    s.speak(u);
  } catch {
    /* sem voz neste aparelho */
  }
}

export function santaHush() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* nada */
  }
}
