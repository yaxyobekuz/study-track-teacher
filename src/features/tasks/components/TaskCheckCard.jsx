// Router
import { Link } from "react-router-dom";

// Icons
import { Check, ChevronRight, Paperclip, Link2, X } from "lucide-react";

// Components
import TaskWindowBar from "./TaskWindowBar";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { kindMeta, resolveTimeState, stateMeta } from "../data/tasks.data";

const SUBMITTABLE = ["pending", "extended", "pending_rejected"];

/**
 * KATAKCHA (✓ / ✗) — ijrochining asosiy belgisi.
 *
 * ⚠️ KATAKCHA O'ZI HOLATNI O'ZGARTIRMAYDI: u faqat TOPSHIRISH oynasini
 * ochadi, chunki ishni yakunlash uchun ISBOT (rasm, video yoki fayl)
 * majburiy — "bosdim-u, hech narsa yubormadim" degan holat bo'lmasligi
 * kerak (`task.service.js` → `_assertSubmission`).
 *
 * ✗ — AVTOMATIK: muddat o'tdi-yu ish topshirilmadi. Hech kim qo'ymaydi,
 * hisoblanadi, shuning uchun muddat uzaytirilsa o'z-o'zidan yo'qoladi.
 */
const CheckBox = ({ state, disabled, onClick }) => {
  const done = state === "done";
  const review = state === "review";
  const missed = state === "missed";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={
        done
          ? "Bajarilgan"
          : missed
            ? "Bajarilmagan"
            : review
              ? "Tekshiruvda"
              : "Bajarildi deb belgilash"
      }
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors",
        done && "border-green-500 bg-green-500 text-white",
        review && "border-amber-400 bg-amber-400 text-white",
        missed && "border-red-500 bg-red-500 text-white",
        !done && !review && !missed && "border-gray-300 bg-white text-transparent",
        !disabled && !done && !review && !missed && "hover:border-blue-500 hover:bg-blue-50",
        disabled && "cursor-default",
      )}
    >
      {missed ? (
        <X className="size-5" strokeWidth={3} />
      ) : (
        <Check className="size-5" strokeWidth={3} />
      )}
    </button>
  );
};

/**
 * Ijrochi ro'yxatidagi bitta topshiriq.
 *
 * ⚠️ HOZIR BAJARILISH VAQTI — QIZIL: oraliq ichidagi topshiriq butun
 * kartasi bilan ajralib turadi, chunki xodim ro'yxatga qarab "hozir nima
 * qilishim kerak" degan savolga bir qarashda javob olishi kerak.
 *
 * @param {object} props
 * @param {object} props.task
 * @param {number} props.now
 * @param {(task: object) => void} props.onSubmitClick
 */
const TaskCheckCard = ({ task, now, onSubmitClick }) => {
  const state = resolveTimeState(task, now);
  const meta = stateMeta(state);
  const kind = kindMeta(task.kind);
  const canSubmit = SUBMITTABLE.includes(task.status);
  const isActive = state === "active";

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-3.5 transition-shadow xs:p-4",
        meta.ring,
        isActive && "shadow-md shadow-red-100",
      )}
    >
      <div className="flex items-start gap-3">
        <CheckBox
          state={state}
          disabled={!canSubmit}
          onClick={() => canSubmit && onSubmitClick(task)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/tasks/${task.id}`}
              className="min-w-0 font-medium leading-snug text-gray-900 hover:text-blue-700"
            >
              {task.title}
            </Link>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                meta.chip,
              )}
            >
              {meta.short}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", kind.chip)}>
              {kind.label}
            </span>
            {task.attachmentsCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400">
                <Paperclip className="size-3" />
                {task.attachmentsCount}
              </span>
            )}
            {task.linksCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400">
                <Link2 className="size-3" />
                {task.linksCount}
              </span>
            )}
          </div>

          <div className="mt-2">
            <TaskWindowBar task={task} now={now} state={state} />
          </div>

          {isActive && (
            <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700">
              Hozir shu topshiriqni bajarish vaqti
            </p>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-2">
            {canSubmit ? (
              <button
                type="button"
                onClick={() => onSubmitClick(task)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-medium text-white",
                  isActive || state === "missed" ? "bg-red-600" : "bg-blue-600",
                )}
              >
                Bajardim — isbot yuborish
              </button>
            ) : (
              <span className="text-xs text-gray-400">
                {state === "review"
                  ? "Tekshiruv javobini kutyapsiz"
                  : state === "done"
                    ? "Ish qabul qilindi"
                    : "Topshiriq yopilgan"}
              </span>
            )}

            <Link
              to={`/tasks/${task.id}`}
              className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-blue-600"
            >
              Batafsil
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCheckCard;
