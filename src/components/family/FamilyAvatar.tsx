import { avatarOf } from "../../lib/family";
import { SantaHat } from "../ui/Icons";

/** Avatar da família: um selo redondo com ícone (sem fotos). */
export default function FamilyAvatar({ id, size = 64, className = "" }: { id?: string; size?: number; className?: string }) {
  const a = avatarOf(id);
  const I = a.icon;
  return (
    <span
      aria-hidden="true"
      className={`inline-grid place-items-center rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size, background: a.bg, boxShadow: "0 0 0 3px rgba(255,209,102,0.85), 0 10px 30px -10px rgba(0,0,0,0.7)" }}
    >
      {a.hat ? <SantaHat size={size * 0.62} /> : I ? <I width={size * 0.48} height={size * 0.48} strokeWidth={2} color={id === "casa" ? "#FFD166" : "#0B132B"} /> : null}
    </span>
  );
}
