// Icons
import { CalendarOff } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { ABSENCE_STATUS_META } from "../data/salary.data";

/**
 * KELMAGAN KUNLAR — fiksa oylikdan kunlik ayirma (`/payroll/my-stats` →
 * `current.absence`).
 *
 * Xodim "nega kam" degan savolga shu yerda javob oladi: qaysi kuni kelmagan
 * va o'sha kun uchun qancha ayrilgan. Fiksa oylik oyning yakshanbadan boshqa
 * kunlariga (dam olish kunlari ichida) bo'linadi — kunlik summa serverdan tayyor.
 *
 * ⚠️ Frontendda arifmetika yo'q: summa ham, sana yorlig'i ham serverdan.
 *
 * @param {{ absence: object|null, monthLabel?: string, className?: string }} props
 */
const AbsenceDaysCard = ({ absence, monthLabel, className }) => {
  if (!absence || absence.dayCount === 0) return null;

  return (
    <div className={cn("rounded-2xl bg-white p-4 ring-1 ring-gray-100", className)}>
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-red-50 p-2 text-red-600">
          <CalendarOff className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Kelmagan kunlar{monthLabel ? ` — ${monthLabel}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Fiksa oylik {absence.workDays} kunga bo'linadi (yakshanbalarsiz, dam olish kunlari ichida):
            kuniga {formatMoney(absence.dailyRate)}. Kelmagan har bir ish kuni uchun shu summa ayriladi.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1">
        {absence.days.map((day) => (
          <li
            key={day.date}
            className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
          >
            <span className="flex flex-wrap items-center gap-2 text-gray-700">
              {day.dateLabel}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs font-medium",
                  ABSENCE_STATUS_META[day.status] ?? "bg-gray-100 text-gray-600",
                )}
              >
                {day.statusLabel}
              </span>
            </span>
            <span className="shrink-0 font-medium text-red-600">− {formatMoney(day.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-2 text-sm">
        <span className="font-medium text-gray-900">Jami ayrildi ({absence.dayCount} kun)</span>
        <span className="font-semibold text-red-600">− {formatMoney(absence.amount)}</span>
      </div>
    </div>
  );
};

export default AbsenceDaysCard;
