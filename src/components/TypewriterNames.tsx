import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Escreve e apaga nomes em sequência, como se o Papai Noel escrevesse à mão. */
export default function TypewriterNames({ names, onName }: { names: string[]; onName?: (n: string) => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(reduce ? names[0] : "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    onName?.(names[idx]);
  }, [idx, names, onName]);

  useEffect(() => {
    if (reduce) return;
    const full = names[idx];
    let delay = deleting ? 55 : 110;
    if (!deleting && text === full) delay = 2200;
    if (deleting && text === "") delay = 350;
    const t = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setIdx((i) => (i + 1) % names.length);
      } else setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, idx, names, reduce]);

  return (
    <span className="whitespace-nowrap">
      {text}
      {!reduce && <span className="typewriter-caret">|</span>}
    </span>
  );
}
