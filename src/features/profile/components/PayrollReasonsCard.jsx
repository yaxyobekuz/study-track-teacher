// Icons
import { CircleCheck, TrendingDown } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import {
  ABSENCE_STATUS_META,
  MISSED_REASON_META,
  unsignedAmount,
} from "@/features/salary/data/salary.data";

/**
 * OYLIK NEGA KAMAYDI — bitta oyning BARCHA sabablari, kun va summa bilan
 * (`GET /payroll/my/breakdown` → `reasons`).
 *
 * Kunlar xronologik: har bir kunda o'sha kungi sabablar yonma-yon —
 *   · kelmagan kun (fiksa oylikdan 1 ish kuni);
 *   · o'tilmagan darslar (kelmagan / sababli / baho qo'yilmagan);
 *   · o'rinbosarga berilgan darslar (kim o'tdi va nega).
 * Keyin butun oyga tegishlilari: to'xtatish, ushlab qolish, foizli ustama
 * ta'siri. Sabab bo'lmasa — "hech narsa ayrilmagan" deb OCHIQ aytiladi:
 * bo'sh joy "ma'lumot yo'q" deb o'qilardi.
 *
 * ⚠️ Frontendda arifmetika yo'q: har bir summa (kun jami va umumiy jami
 * ham) serverdan.
 *
 * @param {{ data: object }} props - breakdown javobi
 */
const PayrollReasonsCard = ({ data }) => {
  const { reasons, missedLessons: missed, work } = data;
  const rate = formatMoney(work.perHourRate);

  // Butun oyga tegishli sabablar — sababi bilan
  const monthItems = [
    ...data.suspensions.map((item, index) => ({
      key: `suspension-${item.id ?? index}`,
      label: `Oylik to'xtatildi: ${item.label}`,
      hint: item.reason,
      value: `− ${formatMoney(item.amount)}`,
      tone: "text-red-600",
    })),
    ...data.deductions.map((item, index) => ({
      key: `deduction-${item.id ?? index}`,
      label: `Ushlab qolindi: ${item.reason}`,
      hint: item.note,
      value: `− ${formatMoney(item.amount)}`,
      tone: "text-red-600",
    })),
  ];
  // Foizli ustama dars soatidan hisoblanadi — o'tilmagan dars uni ham
  // kamaytiradi; to'xtatish/foizli ushlab qolish esa kamayishni yumshatadi
  const other = Number(missed?.otherAmount ?? 0);
  if (other !== 0) {
    monthItems.push({
      key: "other",
      label: other > 0 ? "Foizli ustama ham kamaydi" : "To'xtatish yoki ushlab qolish hisobiga kamroq",
      hint: "o'tilmagan darslar tufayli",
      value: `${other > 0 ? "−" : "+"} ${formatMoney(unsignedAmount(missed.otherAmount))}`,
      tone: other > 0 ? "text-red-600" : "text-green-600",
    });
  }

  const isEmpty = reasons.days.length === 0 && monthItems.length === 0;

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-red-50 p-2 text-red-600">
          <TrendingDown className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">Oylik nega kamaydi</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Har bir sabab — qaysi kuni va o'sha kun uchun qancha ayrilgani
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-800">
          <CircleCheck className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{emptyMessageOf(data)}</span>
        </div>
      ) : (
        <>
          {reasons.days.length > 0 && (
            <ul className="mt-3 space-y-2">
              {reasons.days.map((day) => (
                <li key={day.date} className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-gray-900">{day.dateLabel}</span>
                    <span className="shrink-0 font-semibold text-red-600">
                      − {formatMoney(day.amount)}
                    </span>
                  </div>

                  <ul className="mt-1.5 space-y-2">
                    {day.items.map((item) => (
                      <ReasonItem key={item.kind} item={item} rate={rate} />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          {monthItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500">Butun oy uchun</p>
              <ul className="mt-1 space-y-1.5 text-sm">
                {monthItems.map((item) => (
                  <li key={item.key} className="flex items-start justify-between gap-3">
                    <span className="text-gray-700">
                      {item.label}
                      {item.hint && <span className="block text-xs text-gray-400">{item.hint}</span>}
                    </span>
                    <span className={cn("shrink-0 font-medium", item.tone)}>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-2 text-sm">
            <span className="font-medium text-gray-900">Jami kamaydi</span>
            <span className="font-semibold text-red-600">− {formatMoney(reasons.total)}</span>
          </div>
        </>
      )}

      {/* Qo'shimcha izohlar — ayirma emas, lekin "nega shuncha" ga javob */}
      <ul className="mt-2 space-y-1 text-xs text-gray-500">
        {missed?.plannedAmount && (
          <li className="flex items-center justify-between gap-3">
            <span>Dars qoldirmaganda oylik</span>
            <span className="font-medium text-gray-700">{formatMoney(missed.plannedAmount)}</span>
          </li>
        )}
        {reasons.holidays.length > 0 && (
          <li>
            Bayram kunlari dars o'tilmaydi va soat yozilmaydi:{" "}
            {reasons.holidays.map((holiday) => holiday.dateLabel).join(", ")}
          </li>
        )}
        {data.isCurrentMonth && !isEmpty && (
          <li>Bugungi darslar ertaga tekshiriladi. Davomat yoki baho to'g'rilansa, ayirma qaytadi.</li>
        )}
      </ul>
    </section>
  );
};

/**
 * "Hech narsa ayrilmagan" matni — faqat SHU OYDA tekshiriladigan narsani
 * aytadi: kelmagan kun ayirmasi qo'llanmagan oyda "kelmagan kun yo'q" deyish
 * yolg'on bo'lardi (kelgan-kelmagani tekshirilmagan, faqat ayrilmagan).
 */
const emptyMessageOf = (data) => {
  const { work } = data;
  const checked = [
    work.dailyRate && "kelmagan kun",
    work.paysByHours && "o'tilmagan dars",
    work.paysByHours && "o'rinbosarga berilgan dars",
  ].filter(Boolean);
  const list =
    checked.length > 1 ? `${checked.slice(0, -1).join(", ")} yoki ${checked.at(-1)}` : checked[0];

  return [
    `${data.isCurrentMonth ? "Hozircha oylikdan" : "Bu oyda oylikdan"} hech narsa ayrilmagan${
      list ? `: ${list} yo'q.` : "."
    }`,
    Number(data.fixedAmount) > 0 && !work.dailyRate && "Bu oyda kelmagan kun uchun ayirma qo'llanmagan.",
    data.isCurrentMonth && work.paysByHours && "Bugungi va keyingi darslar hali tekshirilmagan.",
  ]
    .filter(Boolean)
    .join(" ");
};

/** Bir kundagi bitta sabab: kelmagan kun, o'tilmagan yoki berilgan darslar. */
const ReasonItem = ({ item, rate }) => {
  if (item.kind === "absence") {
    return (
      <li className="flex items-start justify-between gap-3">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-700">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-xs font-medium",
              ABSENCE_STATUS_META[item.status] ?? "bg-gray-100 text-gray-600",
            )}
          >
            {item.statusLabel}
          </span>
          <span>ishga kelmagan — fiksa oylikdan 1 ish kuni</span>
        </span>
        <span className="shrink-0 font-medium text-red-600">− {formatMoney(item.amount)}</span>
      </li>
    );
  }

  const isMissed = item.kind === "missed";

  return (
    <li>
      <div className="flex items-start justify-between gap-3">
        <span className="text-gray-700">
          {isMissed
            ? `${item.hours} ta dars o'tilmagan`
            : `${item.hours} ta dars o'rinbosarga berilgan`}
          <span className="block text-xs text-gray-400">
            {item.hours} soat × {rate}
          </span>
        </span>
        <span className="shrink-0 font-medium text-red-600">− {formatMoney(item.amount)}</span>
      </div>

      <ul className="mt-1 space-y-1 border-l-2 border-gray-200 pl-2.5">
        {item.lessons.map((lesson) => (
          <li
            key={`${lesson.lessonOrder}-${lesson.className}-${lesson.subjectName}`}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600"
          >
            <span>
              {lesson.className}, {lesson.lessonOrder}-dars · {lesson.subjectName}
            </span>

            {isMissed ? (
              <>
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
              </>
            ) : (
              <span className="text-gray-500">
                o'rniga {lesson.substituteName}
                {lesson.reasonLabel ? ` (${lesson.reasonLabel})` : ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default PayrollReasonsCard;
