// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

/**
 * JORIY OY HISOBI — vedomost bilan AYNI hisob (`/payroll/my-stats` → `live`).
 *
 * O'qituvchi uchta savolga javob oladi:
 *   · dars qoldirmaganda qancha olardim (rejadagi hamma dars);
 *   · o'tilmagan darslar uchun qancha ayrildi (kelmagan / sababli / baho
 *     qo'yilmagan) — yana dars o'tilmasa bu summa o'sib boradi;
 *   · hozir qancha hisoblangan va oy oxirida qancha bo'ladi.
 *
 * ⚠️ Summalar serverdan tayyor — frontendda arifmetika yo'q.
 *
 * @param {{ live: object, monthLabel: string, className?: string }} props
 */
const LiveMonthBreakdown = ({ live, monthLabel, className }) => {
  if (!live) return null;

  const reasons = [
    live.missedByReason?.absent > 0 && `kelmagan ${live.missedByReason.absent}`,
    live.missedByReason?.excused > 0 && `sababli ${live.missedByReason.excused}`,
    live.missedByReason?.noGrade > 0 && `baho qo'yilmagan ${live.missedByReason.noGrade}`,
  ].filter(Boolean);

  return (
    <div className={cn("rounded-2xl bg-white p-4 ring-1 ring-gray-100", className)}>
      <p className="text-sm font-semibold text-gray-900">{monthLabel} — dars bo'yicha hisob</p>

      <ul className="mt-3 space-y-2 text-sm">
        {/* Admin belgilagan to'liq oylik — ayirmalardan OLDIN */}
        {live.assignedAmount && (
          <li className="flex items-start justify-between gap-3 rounded-xl bg-indigo-50/70 px-3 py-2">
            <span className="text-gray-700">
              <span className="font-medium text-gray-900">Belgilangan oylik</span>
              <span className="block text-xs text-gray-500">
                Dars qoldirmasangiz va ushlab qolish bo'lmasa, shuncha olardingiz
              </span>
            </span>
            <span className="shrink-0 text-base font-bold text-gray-900">
              {formatMoney(live.assignedAmount)}
            </span>
          </li>
        )}

        {(live.suspensions ?? []).map((item, index) => (
          <li key={`suspension-${index}`} className="flex items-start justify-between gap-3">
            <span className="text-gray-600">
              To'xtatildi: {item.label}
              {item.reason && <span className="block text-xs text-gray-400">{item.reason}</span>}
            </span>
            <span className="shrink-0 font-medium text-red-600">− {formatMoney(item.amount)}</span>
          </li>
        ))}

        {(live.deductions ?? []).map((item, index) => (
          <li key={`deduction-${index}`} className="flex items-start justify-between gap-3">
            <span className="text-gray-600">
              Ushlab qolindi
              {item.reason && <span className="block text-xs text-gray-400">{item.reason}</span>}
            </span>
            <span className="shrink-0 font-medium text-red-600">− {formatMoney(item.amount)}</span>
          </li>
        ))}

        <li className="flex items-start justify-between gap-3">
          <span className="text-gray-600">
            Dars qoldirmaganda
            <span className="block text-xs text-gray-400">
              {live.plannedHours} soat — rejadagi hamma dars
              {Number(live.plannedDeductionAmount) > 0 || Number(live.plannedSuspendedAmount) > 0
                ? ", ayirmalardan keyin"
                : ""}
            </span>
          </span>
          <span className="shrink-0 font-medium text-gray-900">{formatMoney(live.plannedAmount)}</span>
        </li>

        <li className="flex items-start justify-between gap-3">
          <span className="text-gray-600">
            O'tilmagan darslar
            <span className="block text-xs text-gray-400">
              {live.missedHours} soat{reasons.length > 0 ? ` · ${reasons.join(", ")}` : ""}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 font-medium",
              Number(live.missedAmount) > 0 ? "text-red-600" : "text-gray-400",
            )}
          >
            {Number(live.missedAmount) > 0 ? `− ${formatMoney(live.missedAmount)}` : "—"}
          </span>
        </li>

        <li className="flex items-start justify-between gap-3 border-t border-gray-100 pt-2">
          <span className="font-medium text-gray-900">
            Oy oxirida olishim kerak
            <span className="block text-xs font-normal text-gray-400">
              {live.taughtHours} soat o'tildi + {live.remainingHours} soat qoldi
            </span>
          </span>
          <span className="shrink-0 text-base font-bold text-indigo-700">
            {formatMoney(live.projectedAmount)}
          </span>
        </li>

        <li className="flex items-start justify-between gap-3">
          <span className="text-gray-600">
            Hozirgacha hisoblangan
            <span className="block text-xs text-gray-400">{live.taughtHours} soat o'tilgan darslar bo'yicha</span>
          </span>
          <span className="shrink-0 font-medium text-gray-900">{formatMoney(live.accruedAmount)}</span>
        </li>
      </ul>

      <p className="mt-3 text-xs text-gray-400">
        {live.paysByHours
          ? "Bugungi va keyingi darslar reja sifatida hisoblangan. Dars o'tilmasa (kelmasangiz yoki baho qo'yilmasa) uning puli ayriladi."
          : "Oylik fiksa — o'tilmagan darslar summaga ta'sir qilmaydi."}
      </p>
    </div>
  );
};

export default LiveMonthBreakdown;
