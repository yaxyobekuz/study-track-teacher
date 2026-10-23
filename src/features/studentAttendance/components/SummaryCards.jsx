// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { SUMMARY_CARDS } from "../data/studentAttendance.data";

/**
 * Yig'indi kartalari — JONLI (hali saqlanmagan tanlovlar bilan).
 *
 * ⚠️ Kalitlar server `summary` si bilan AYNI, shuning uchun saqlashdan
 * oldin ham, keyin ham bitta raqam ko'rinadi.
 */
const SummaryCards = ({ summary }) => (
  <div className="grid grid-cols-2 gap-2 xs:grid-cols-4">
    {SUMMARY_CARDS.map((card) => (
      <div
        key={card.key}
        className={cn("rounded-xl px-3 py-2.5 text-center", card.className)}
      >
        <p className="text-xl font-bold leading-tight">
          {summary?.[card.key] ?? 0}
        </p>
        <p className="mt-0.5 text-xs font-medium">{card.label}</p>
      </div>
    ))}
  </div>
);

export default SummaryCards;
