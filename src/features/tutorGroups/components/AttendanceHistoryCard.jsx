// React
import { useMemo, useState } from "react";

// Icons
import { Check, Clock, FileText, Minus, X } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz, getDayOfWeekUz } from "@/shared/utils/date.utils";

// Data
import { ATTENDANCE_STATUS_META, percentClass } from "../data/tutorGroups.data";

/** Katak belgisi — rang `ATTENDANCE_STATUS_META` dan, bu yerda faqat ikonka. */
const STATUS_ICONS = {
  present: Check,
  late: Clock,
  absent: X,
  excused: FileText,
  unmarked: Minus,
};

const LEGEND = ["present", "late", "absent", "excused", "unmarked"];

// Kun tafsilotida: avval e'tibor talab qiladiganlar
const DETAIL_ORDER = { absent: 0, unmarked: 1, excused: 2, late: 3 };

const formatPercent = (value) => (value == null ? "—" : `${value}%`);

// "chorshanba" → "Ch" (ustun sarlavhasi uchun)
const shortWeekday = (date) => {
  const name = getDayOfWeekUz(date);
  return name ? name.charAt(0).toUpperCase() + name.charAt(1) : "";
};

const StatusBadge = ({ status, className }) => {
  const meta = ATTENDANCE_STATUS_META[status];
  const Icon = STATUS_ICONS[status];

  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md",
        meta.className,
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
    </span>
  );
};

/**
 * KUNLIK DAVOMAT TARIXI — tanlangan oyda sinf o'quvchilarining har o'quv
 * kunidagi holati (o'quvchi × kun) va bosilgan kunning tafsiloti.
 *
 * Katak — server hisobotidagi O'SHA yozuv (`attendance.days`), oylik foiz
 * bilan bitta tsikldan: katak va foiz bir-biriga zid chiqmaydi. Bo'sh katak —
 * o'quvchi o'sha kuni kutilmagan (darsi yo'q yoki hali sinfda emas edi).
 *
 * @param {object} props
 * @param {Array} props.byDay - `attendance.byDay` (kun yig'indisi)
 * @param {Array} props.students - guruh o'quvchilari (`attendance.days` bilan)
 * @param {string} props.monthLabel
 */
const AttendanceHistoryCard = ({ byDay, students, monthLabel }) => {
  const [selected, setSelected] = useState(null);

  const rows = useMemo(
    () =>
      students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        days: new Map((student.attendance?.days ?? []).map((day) => [day.date, day])),
      })),
    [students],
  );

  // Oy almashsa tanlov o'sha oyda bo'lmasligi mumkin — oxirgi kunga qaytamiz
  const activeDate = byDay.some((day) => day.date === selected)
    ? selected
    : byDay.at(-1)?.date;
  const activeDay = byDay.find((day) => day.date === activeDate);

  const attention = rows
    .map((row) => {
      const cell = row.days.get(activeDate);
      if (!cell) return null;
      const status = cell.status ?? "unmarked";
      if (status === "present") return null;
      return { id: row.id, fullName: row.fullName, status, excuseReason: cell.excuseReason };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        DETAIL_ORDER[a.status] - DETAIL_ORDER[b.status] ||
        a.fullName.localeCompare(b.fullName, "uz"),
    );

  const gridStyle = {
    gridTemplateColumns: `minmax(8rem, 14rem) repeat(${byDay.length}, 2.25rem)`,
  };

  return (
    <Card title={`Kunlik davomat tarixi · ${monthLabel}`}>
      <p className="mt-1 text-sm text-gray-500">
        Kun ustiga bosing — o'sha kungi holat pastda chiqadi.
      </p>

      {/* Belgilar */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {LEGEND.map((status) => (
          <span key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
            <StatusBadge status={status} className="size-5" />
            {ATTENDANCE_STATUS_META[status].label}
          </span>
        ))}
      </div>

      {/* O'quvchi × kun */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
        <div className="grid w-max min-w-full text-sm" style={gridStyle}>
          {/* Sarlavha */}
          <div className="sticky left-0 z-10 flex items-end border-b border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-500">
            O'quvchi
          </div>
          {byDay.map((day) => {
            const isActive = day.date === activeDate;
            return (
              <button
                key={day.date}
                type="button"
                title={formatDateUz(day.date)}
                onClick={() => setSelected(day.date)}
                className={cn(
                  "flex flex-col items-center border-b border-gray-100 py-1.5 text-xs transition-colors hover:bg-gray-50",
                  isActive && "bg-blue-50 hover:bg-blue-50",
                )}
              >
                <span className={cn("font-semibold", isActive ? "text-blue-700" : "text-gray-900")}>
                  {Number(day.date.slice(8))}
                </span>
                <span className="text-[10px] text-gray-400">{shortWeekday(day.date)}</span>
              </button>
            );
          })}

          {/* O'quvchilar */}
          {rows.map((row) => (
            <div key={row.id} className="contents">
              <div className="sticky left-0 z-10 truncate border-b border-gray-50 bg-white px-3 py-1.5 font-medium text-gray-900">
                {row.fullName}
              </div>
              {byDay.map((day) => {
                const cell = row.days.get(day.date);
                const status = cell ? cell.status ?? "unmarked" : null;
                const label = status ? ATTENDANCE_STATUS_META[status].label : "Kutilmagan";

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelected(day.date)}
                    title={`${formatDateUz(day.date)} — ${label}${cell?.excuseReason ? `: ${cell.excuseReason}` : ""}`}
                    className={cn(
                      "relative flex items-center justify-center border-b border-gray-50 py-1",
                      day.date === activeDate && "bg-blue-50",
                    )}
                  >
                    {status && <StatusBadge status={status} />}
                    {cell?.excuseReason && (
                      <span className="absolute right-1 top-1 size-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Kun foizi */}
          <div className="sticky left-0 z-10 bg-white px-3 py-2 text-xs font-medium text-gray-500">
            Davomat
          </div>
          {byDay.map((day) => (
            <div
              key={day.date}
              title={`${formatDateUz(day.date)} — ${formatPercent(day.percent)}`}
              className={cn(
                "flex items-center justify-center py-2 text-[11px] font-semibold",
                percentClass(day.percent),
                day.date === activeDate && "bg-blue-50",
              )}
            >
              {day.percent == null ? "—" : `${Math.round(day.percent)}%`}
            </div>
          ))}
        </div>
      </div>

      {/* Tanlangan kun */}
      {activeDay && (
        <div className="mt-4 space-y-3 rounded-xl border border-gray-100 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-gray-900">
              {formatDateUz(activeDay.date)}
              <span className="font-normal text-gray-500"> · {getDayOfWeekUz(activeDay.date)}</span>
            </p>
            <p className="text-sm text-gray-500">
              <span className={cn("font-semibold", percentClass(activeDay.percent))}>
                {formatPercent(activeDay.percent)}
              </span>{" "}
              · {activeDay.came} / {activeDay.expected} keldi
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {LEGEND.map((status) => (
              <span
                key={status}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium",
                  ATTENDANCE_STATUS_META[status].className,
                )}
              >
                {ATTENDANCE_STATUS_META[status].label}: {activeDay[status] ?? 0}
              </span>
            ))}
          </div>

          {attention.length === 0 ? (
            <p className="text-sm text-gray-500">Bu kuni hamma o'z vaqtida kelgan.</p>
          ) : (
            <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {attention.map((item) => (
                <li key={item.id} className="flex items-start gap-3 border-b border-gray-50 py-2">
                  <StatusBadge status={item.status} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {ATTENDANCE_STATUS_META[item.status].label}
                      {item.excuseReason ? ` — ${item.excuseReason}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
};

export default AttendanceHistoryCard;
