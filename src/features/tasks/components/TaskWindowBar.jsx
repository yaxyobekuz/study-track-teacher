// Icons
import { Clock } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { stateMeta, windowProgress } from "../data/tasks.data";

/**
 * TOPSHIRIQNING VAQTI — "qachondan qachongacha" va "qancha qoldi".
 *
 * Oraliq berilgan bo'lsa (masalan 13:00 — 15:00) chiziq necha foizi
 * o'tganini ko'rsatadi; faqat muddat berilgan bo'lsa chiziq bo'lmaydi —
 * boshlanish nuqtasi yo'q ekan, foizning maxraji ham yo'q.
 *
 * @param {{ task: object, now: number, state: string, compact?: boolean }} props
 */
const TaskWindowBar = ({ task, now, state, compact = false }) => {
  const meta = stateMeta(state);
  const progress = windowProgress(task, now);
  const finished = ["done", "stopped", "review"].includes(state);

  return (
    <div className={compact ? "" : "space-y-1.5"}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
        <Clock className={cn("size-3.5 shrink-0", meta.text)} />
        <span className="text-gray-600">
          {task.startDate
            ? `${formatDateTimeUz(task.startDate)} — ${formatDateTimeUz(task.dueDate)}`
            : formatDateTimeUz(task.dueDate)}
        </span>
        {!finished && (
          <span className={cn("font-medium", progress.overdue ? "text-red-600" : meta.text)}>
            · {progress.text}
          </span>
        )}
      </div>

      {!compact && progress.percent != null && !finished && (
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full rounded-full transition-all", meta.accent)}
            style={{ width: `${Math.max(progress.percent, 2)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskWindowBar;
