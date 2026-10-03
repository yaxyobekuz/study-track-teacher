// Icons
import { CircleSlash } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { MISSED_REASON_META, unsignedAmount } from "../data/salary.data";

/**
 * O'TILMAGAN DARSLAR — soatbay oylikdan ayrilgani, KUNLAR KESIMIDA
 * (`/payroll/my/breakdown` → `missedLessons`).
 *
 * Xodim "nega kam" degan savolga shu yerda javob oladi: qaysi kuni qaysi dars
 * o'tilmagan, nega (kelmagan / sababli / baho qo'yilmagan) va o'sha kun uchun
 * qancha ayrilgan. Kun summasi = o'tilmagan soat × 1 dars soati narxi.
 *
 * Fiksa oylikdagi kelmagan kun ayirmasi — alohida karta (`AbsenceDaysCard`):
 * aralash oylikda kelmagan kun IKKALASIDA ham ko'rinadi, chunki u ikki
 * qismdan ayriladi (fiksadan kunlik summa va o'sha kungi darslar soati).
 *
 * ⚠️ Frontendda arifmetika yo'q: summa ham, sana yorlig'i ham serverdan.
 *
 * @param {{ missed: object|null, monthLabel?: string, isCurrentMonth?: boolean,
 *   className?: string }} props
 */
const MissedLessonDaysCard = ({ missed, monthLabel, isCurrentMonth = false, className }) => {
  if (!missed || !missed.days?.length) return null;

  const other = Number(missed.otherAmount);

  return (
    <div className={cn("rounded-2xl bg-white p-4 ring-1 ring-gray-100", className)}>
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-red-50 p-2 text-red-600">
          <CircleSlash className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            O'tilmagan darslar{monthLabel ? ` — ${monthLabel}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Har bir o'tilmagan dars soati uchun {formatMoney(missed.perHourRate)} ayriladi.
            Kelmagan, sababli kelmagan yoki bitta ham baho qo'yilmagan dars o'tilmagan
            hisoblanadi.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {missed.days.map((day) => (
          <li key={day.date} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-gray-800">{day.dateLabel}</span>
              <span className="shrink-0 text-right">
                <span className="block font-medium text-red-600">− {formatMoney(day.amount)}</span>
                <span className="block text-xs text-gray-400">
                  {day.hours} soat × {formatMoney(missed.perHourRate)}
                </span>
              </span>
            </div>

            <ul className="mt-1 space-y-1">
              {day.lessons.map((lesson) => (
                <li
                  key={`${lesson.lessonOrder}-${lesson.className}-${lesson.subjectName}`}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600"
                >
                  <span>
                    {lesson.className}, {lesson.lessonOrder}-dars · {lesson.subjectName}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-medium",
                      MISSED_REASON_META[lesson.reason] ?? "bg-gray-100 text-gray-600",
                    )}
                  >
                    {lesson.reasonLabel}
                  </span>
                  {lesson.substituted && (
                    <span className="rounded-md bg-sky-50 px-1.5 py-0.5 font-medium text-sky-700">
                      o'rinbosarlik
                    </span>
                  )}
                  {lesson.autoMarked && (
                    <span className="text-gray-400">davomat avtomatik belgilangan</span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <ul className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-sm">
        <li className="flex items-center justify-between gap-3">
          <span className="text-gray-600">
            {missed.hours} soat × {formatMoney(missed.perHourRate)}
          </span>
          <span className="font-medium text-red-600">− {formatMoney(missed.lessonsAmount)}</span>
        </li>

        {/* Foizli ustama dars soatidan hisoblanadi — u ham kamayadi. To'xtatish
            yoki foizli ushlab qolish esa kamayishni yumshatadi. */}
        {other !== 0 && (
          <li className="flex items-center justify-between gap-3">
            <span className="text-gray-600">
              {other > 0
                ? "Foizli ustama ham kamaydi"
                : "To'xtatish yoki ushlab qolish hisobiga kamroq"}
            </span>
            <span className={cn("font-medium", other > 0 ? "text-red-600" : "text-green-600")}>
              {other > 0 ? "−" : "+"} {formatMoney(unsignedAmount(missed.otherAmount))}
            </span>
          </li>
        )}

        <li className="flex items-center justify-between gap-3">
          <span className="font-medium text-gray-900">Jami ayrildi ({missed.hours} soat)</span>
          <span className="font-semibold text-red-600">− {formatMoney(missed.amount)}</span>
        </li>

        {missed.plannedAmount && (
          <li className="flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-500">Dars qoldirmaganda oylik</span>
            <span className="font-medium text-gray-700">{formatMoney(missed.plannedAmount)}</span>
          </li>
        )}
      </ul>

      {isCurrentMonth && (
        <p className="mt-2 text-xs text-gray-400">
          Bugungi darslar ertaga tekshiriladi. Davomat yoki baho to'g'rilansa, ayirma qaytadi.
        </p>
      )}
    </div>
  );
};

export default MissedLessonDaysCard;
