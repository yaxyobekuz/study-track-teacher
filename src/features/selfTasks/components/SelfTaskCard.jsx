// Router
import { Link } from "react-router-dom";

// Icons
import {
  Ban,
  CalendarClock,
  Check,
  ChevronRight,
  Link2,
  Paperclip,
  PencilLine,
  Repeat,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

// Components
import TaskWindowBar from "@/features/tasks/components/TaskWindowBar";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { kindMeta, resolveTimeState, stateMeta } from "@/features/tasks/data/tasks.data";

const WORKING = ["pending", "extended", "pending_rejected"];
const CLOSED = ["completed", "stopped"];

/**
 * KATAKCHA (✓ / ✗).
 *
 * ⚠️ Katakcha o'zi holatni o'zgartirmaydi: u YAKUNLASH oynasini ochadi —
 * isbot (fayl) baribir majburiy. Jarima yo'qligi "hech narsa yuklamasdan
 * yopib qo'yish" degani emas, aks holda statistika ma'nosini yo'qotardi.
 *
 * ⚠️ "Tekshiruvda" holati BU OQIMDA YO'Q: xodim topshirgani darhol
 * yakunlanadi, shuning uchun sariq katakcha ham bo'lmaydi.
 */
const CheckBox = ({ state, disabled, onClick }) => {
  const done = state === "done";
  const missed = state === "missed";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={done ? "Bajarilgan" : missed ? "Bajarilmagan" : "Bajardim deb belgilash"}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors",
        done && "border-green-500 bg-green-500 text-white",
        missed && "border-red-500 bg-red-500 text-white",
        !done && !missed && "border-gray-300 bg-white text-transparent",
        !disabled && !done && !missed && "hover:border-blue-500 hover:bg-blue-50",
        disabled && "cursor-default",
      )}
    >
      {missed ? <X className="size-5" strokeWidth={3} /> : <Check className="size-5" strokeWidth={3} />}
    </button>
  );
};

const Action = ({ icon: Icon, label, tone = "gray", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium",
      tone === "red" ? "text-red-600 active:bg-red-50" : "text-gray-500 active:bg-gray-100",
    )}
  >
    <Icon className="size-3.5" />
    {label}
  </button>
);

/**
 * "O'zim belgilagan" ro'yxatidagi bitta ish.
 *
 * ⚠️ AMALLAR QATOR EGASIDA: yakunlash, tahrirlash, muddatni surish,
 * to'xtatish, qayta ochish va o'chirish — hammasi shu kartada. Rahbariyat
 * bu ishni faqat KO'RADI (admin paneldagi dashboard), chunki bu odamning
 * o'z rejasi.
 *
 * @param {{ task: object, now: number, onComplete: Function, onEdit: Function,
 *   onDeadline: Function, onStop: Function, onDelete: Function }} props
 */
const SelfTaskCard = ({ task, now, onComplete, onEdit, onDeadline, onStop, onDelete }) => {
  const state = resolveTimeState(task, now);
  const meta = stateMeta(state);
  const kind = kindMeta(task.kind);
  const isWorking = WORKING.includes(task.status);
  const isClosed = CLOSED.includes(task.status);
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
          disabled={!isWorking}
          onClick={() => isWorking && onComplete(task)}
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
              className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.chip)}
            >
              {meta.short}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", kind.chip)}>
              {kind.label}
            </span>
            {/* Doimiy ish qoidasidan yozilgani — "buni men qo'lda yozmadim" */}
            {task.scheduleId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                <Repeat className="size-3" />
                Doimiy
              </span>
            )}
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
              Hozir shu ishni bajarish vaqti
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1">
            {isWorking ? (
              <>
                <button
                  type="button"
                  onClick={() => onComplete(task)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-medium text-white",
                    isActive || state === "missed" ? "bg-red-600" : "bg-blue-600",
                  )}
                >
                  Bajardim
                </button>
                <Action icon={PencilLine} label="Tahrir" onClick={() => onEdit(task)} />
                <Action
                  icon={CalendarClock}
                  label="Muddat"
                  onClick={() => onDeadline(task, "extend")}
                />
                <Action icon={Ban} label="To'xtatish" onClick={() => onStop(task)} />
              </>
            ) : (
              <>
                {isClosed && (
                  <Action
                    icon={RotateCcw}
                    label="Qayta ochish"
                    onClick={() => onDeadline(task, "reopen")}
                  />
                )}
                <span className="text-xs text-gray-400">
                  {state === "done" ? "Bajarildi" : "To'xtatilgan"}
                </span>
              </>
            )}

            {/* ⚠️ O'chirish — faqat XATO kiritilgan ish uchun: to'xtatish
                sabab bilan registrda qoladi, o'chirish esa izsiz yo'q qiladi */}
            <Action icon={Trash2} label="O'chirish" tone="red" onClick={() => onDelete(task)} />

            <Link
              to={`/tasks/${task.id}`}
              className="ml-auto inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-blue-600"
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

export default SelfTaskCard;
