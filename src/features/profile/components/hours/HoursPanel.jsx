// Icons
import { TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { MOTION, RAIL, SURFACE, T } from "../../data/ledger.tokens";

/**
 * KARTA QOBIG'I — dars soati panelining yagona konteyneri.
 *
 * ⚠️ ADMIN PANELIDAGI `Panel.jsx` NING NUSXASI. Panellar alohida repo,
 * umumiy paket yo'q — import qilishning imkoni ham yo'q. Shakl AYNAN bir
 * xil: bitta odam ikki panelda bir xil ekranni ko'radi.
 *
 * ⚠️ CHEGARA YO'Q, SIGNAL RELSI BOR: chap qirradagi 3px chiziq yuqoridan
 * pastga chiziladi (`rail-draw`). `ring-1` har blokka qo'yilsa, ekran
 * "jadval ustidagi jadval" bo'lardi.
 *
 * ⚠️ SARLAVHA OSTIDA CHIZIQ YO'Q, 14px HAVO BOR.
 */
const HOURS_TONE_ICON = {
  planned: "bg-slate-100 text-slate-500",
  taught: "bg-indigo-50 text-indigo-600",
  accrued: "bg-amber-50 text-amber-700",
  settled: "bg-emerald-50 text-emerald-600",
  given: "bg-rose-50 text-rose-600",
};

const HoursPanel = ({
  title,
  hint,
  icon: Icon,
  tone = "planned",
  action,
  delay = 0,
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyText = "Bu oy uchun ma'lumot yo'q",
  padding = "default",
  className,
  children,
}) => (
  <section
    className={cn(SURFACE.card, "flex min-h-0 flex-col", MOTION.enter, className)}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span
      aria-hidden="true"
      className={cn(RAIL.base, RAIL.draw, RAIL.tone[tone] ?? RAIL.tone.planned)}
      style={{ animationDelay: `${delay + 120}ms` }}
    />

    <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-[9px]",
              HOURS_TONE_ICON[tone] ?? HOURS_TONE_ICON.planned,
            )}
          >
            <Icon className="size-3.5" strokeWidth={2.2} />
          </span>
        )}

        <div className="min-w-0">
          <h3 className={cn(T.title, "truncate")}>{title}</h3>
          {hint && <p className={cn(T.hint, "mt-0.5")}>{hint}</p>}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>

    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        padding === "flush" ? "mt-3.5" : "mt-3.5 px-5 pb-5",
      )}
    >
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <ErrorState />
      ) : isEmpty ? (
        <Empty text={emptyText} />
      ) : (
        children
      )}
    </div>
  </section>
);

/** Skelet, spinner emas: blok o'z shaklini yo'qotmaydi va sakrash bo'lmaydi. */
const Skeleton = () => (
  <div className="flex flex-1 flex-col justify-center gap-2.5 py-2">
    {[92, 74, 58].map((width, index) => (
      <div
        key={width}
        className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
        style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
      />
    ))}
  </div>
);

const ErrorState = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
    <TriangleAlert className="size-5 text-slate-300" strokeWidth={1.8} />
    <p className="text-[12px] font-medium text-slate-500">
      Ma'lumotni yuklab bo'lmadi
    </p>
  </div>
);

const Empty = ({ text }) => (
  <div className="flex flex-1 items-center justify-center py-6">
    <p className="max-w-[260px] text-center text-[11.5px] leading-relaxed text-slate-400">
      {text}
    </p>
  </div>
);

export default HoursPanel;
