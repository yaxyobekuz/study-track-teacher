// Icons
import { CalendarDays, CalendarOff, Clock, TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import AbsenceDaysCard from "@/features/salary/components/AbsenceDaysCard";
import MissedLessonDaysCard from "@/features/salary/components/MissedLessonDaysCard";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { allowanceLineLabel, entryBadgeOf } from "../data/profile.data";
import { profileQueries } from "../queries/profile.queries";

/**
 * OYLIK QANDAY HISOBLANDI — bitta oy, to'liq (`GET /payroll/my/breakdown`).
 *
 * Uch savolga javob:
 *   · QANCHA VAQT UCHUN — ish kunlari, dars soati va ularning narxi;
 *   · QANCHA OYLIK — tarkib: fiksa + soat × narx + ustamalar − ayirmalar;
 *   · NEGA KAM — kelmagan kunlar va o'tilmagan darslar, kuni va summasi bilan.
 *
 * Ma'lumot: `{ month }` (YYYYMM). Shakllangan oy muhrdan, shakllanmagani
 * jonli hisobdan — server hal qiladi. ⚠️ Frontendda arifmetika yo'q.
 */
const PayrollMonthModal = () => {
  const { data } = useModal("payrollMonth");

  return (
    <ResponsiveModal
      name="payrollMonth"
      title={data?.monthLabel ? `${data.monthLabel} — oylik hisobi` : "Oylik hisobi"}
      description="Oylik qanday hisoblangani va nega kamaygani"
      className="max-w-2xl"
    >
      <Content />
    </ResponsiveModal>
  );
};

const Content = ({ month }) => {
  const { data, isLoading, isError } = useQuery(profileQueries.monthBreakdown(month));

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[92, 74, 58, 80].map((width) => (
          <div key={width} className="h-3 animate-pulse rounded-full bg-gray-100" style={{ width: `${width}%` }} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="py-6 text-center text-sm text-red-500">Oylik hisobini yuklab bo'lmadi</p>;
  }

  if (!data.hasSalary) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        {data.monthLabel} uchun sizga oylik belgilanmagan.
      </p>
    );
  }

  return <PayrollMonthDetail data={data} />;
};

/** Hisob tanasi — zanjir, ish hajmi va kunlar. */
const PayrollMonthDetail = ({ data }) => {
  const { work } = data;
  const badge = data.payment
    ? entryBadgeOf({
        amount: data.amount,
        paidAmount: data.payment.paidAmount,
        suspendedAmount: data.suspendedAmount,
        status: data.payment.status,
        statusLabel: data.payment.statusLabel,
      })
    : { label: "Hisoblanmoqda", className: "bg-indigo-50 text-indigo-700" };

  const role = [data.salaryTypeLabel, data.positionName, data.categoryName].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* ── Natija ── */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-indigo-50/70 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Oylik</p>
          <p className="text-xl font-bold text-gray-900">{formatMoney(data.amount)}</p>
          {role.length > 0 && <p className="mt-0.5 text-xs text-gray-500">{role.join(" · ")}</p>}
        </div>
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", badge.className)}>
          {badge.label}
        </span>
      </div>

      <Notes data={data} />

      {/* ── Qancha vaqt uchun ── */}
      <WorkSummary work={work} isCurrentMonth={data.isCurrentMonth} />

      {/* ── Qancha oylik: tarkib zanjiri ── */}
      <section className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
        <p className="text-sm font-semibold text-gray-900">Oylik tarkibi</p>

        <ul className="mt-3 space-y-2 text-sm">
          {Number(data.fixedAmount) > 0 && (
            <Row
              label="Fiksa oylik"
              hint={
                work.workDays
                  ? `${work.workDays} ish kuni uchun${data.positionName ? ` · ${data.positionName}` : ""}`
                  : data.positionName
              }
              value={formatMoney(data.fixedAmount)}
            />
          )}

          {(work.paysByHours || Number(data.kpiAmount) > 0) && (
            <Row
              label="Dars soati"
              hint={`${work.paidHours} soat × ${formatMoney(work.perHourRate)}`}
              value={formatMoney(data.kpiAmount)}
            />
          )}

          {data.allowances.map((item, index) => (
            <Row
              key={`allowance-${item.label}-${index}`}
              // Tyutor qatorida o'quvchilar soni izohda — nomda takrorlanmaydi
              label={`+ ${item.type === "tutor" ? item.label : allowanceLineLabel(item)}`}
              hint={
                item.type === "tutor" && item.studentCount != null
                  ? `${item.studentCount} o'quvchi × ${formatMoney(item.perStudentAmount)} + guruh uchun ${formatMoney(item.groupAmount)}`
                  : null
              }
              value={`+ ${formatMoney(item.amount)}`}
              tone="text-amber-700"
            />
          ))}

          <Row label="Hisoblangan" value={formatMoney(data.grossAmount)} strong divider />

          {Number(data.absenceAmount) > 0 && (
            <Row
              label="Kelmagan kunlar"
              hint={`${data.absence.dayCount} kun × ${formatMoney(data.absence.dailyRate)} — fiksa oylikdan`}
              value={`− ${formatMoney(data.absenceAmount)}`}
              tone="text-red-600"
            />
          )}

          {data.suspensions.map((item, index) => (
            <Row
              key={`suspension-${item.id ?? index}`}
              label={`To'xtatildi: ${item.label}`}
              hint={item.reason}
              value={`− ${formatMoney(item.amount)}`}
              tone="text-red-600"
            />
          ))}

          {data.deductions.map((item, index) => (
            <Row
              key={`deduction-${item.id ?? index}`}
              label={`Ushlab qolindi: ${item.reason}`}
              hint={item.note}
              value={`− ${formatMoney(item.amount)}`}
              tone="text-red-600"
            />
          ))}

          <Row label="Oylik" value={formatMoney(data.amount)} strong divider tone="text-indigo-700" />

          {data.payment && (
            <>
              <Row label="To'landi" value={formatMoney(data.payment.paidAmount)} tone="text-green-700" />
              {data.payment.payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3 pl-3 text-xs text-gray-500">
                  <span>{payment.paidAtLabel}</span>
                  <span>{formatMoney(payment.amount)}</span>
                </li>
              ))}
              <Row
                label="Qoldiq"
                value={formatMoney(data.payment.debt)}
                tone={Number(data.payment.debt) > 0 ? "text-red-600" : "text-gray-400"}
              />
            </>
          )}
        </ul>

        {/* O'tilmagan darslar zanjirda YO'Q: ular ayirma emas, pul yozilmagan
            soat. "Nega kam" degan savolga javob — pastdagi kartada. */}
        {Number(data.missedLessons?.amount) > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            O'tilmagan {data.missedLessons.hours} soat dars uchun pul yozilmagan (−{" "}
            {formatMoney(data.missedLessons.amount)}) — kunlari pastda.
          </p>
        )}
      </section>

      {/* ── Nega kam: kunlar ── */}
      <AbsenceDaysCard absence={data.absence} monthLabel={data.monthLabel} />
      <MissedLessonDaysCard
        missed={data.missedLessons}
        monthLabel={data.monthLabel}
        isCurrentMonth={data.isCurrentMonth}
      />
    </div>
  );
};

/** Ogohlantirishlar — hisob qayerdan kelgani va nima o'zgarishi mumkin. */
const Notes = ({ data }) => {
  const notes = [];

  if (data.isCurrentMonth && !data.isSealed) {
    notes.push(
      "Joriy oy — taxminiy hisob: bugungi va keyingi darslar reja sifatida hisoblangan. Oy yopilganda summa muhrlanadi.",
    );
  } else if (!data.isSealed) {
    notes.push(
      "Bu oy uchun oylik hali shakllantirilmagan — hozirgi qoidalar bo'yicha hisoblandi.",
    );
  }

  if (data.work.isVacationMonth) {
    notes.push("Ta'til oyi — dars o'tilmaydi, dars soati hisoblanmaydi.");
  }

  if (data.hoursDrift) {
    notes.push(
      `Oylik muhrlangandan keyin dars soati o'zgargan: muhrda ${data.hoursDrift.sealedHours} soat, hozirgi hisobda ${data.hoursDrift.liveHours} soat. Oylik summasi muhrdagidek — farq bo'yicha ma'muriyatga murojaat qiling.`,
    );
  }

  if (notes.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {notes.map((note) => (
        <li key={note} className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  );
};

// Tailwind sinflari to'liq yozilishi shart (dinamik `xs:grid-cols-${n}` yig'ilmaydi)
const WORK_GRID_COLS = { 1: "", 2: "xs:grid-cols-2", 3: "xs:grid-cols-3" };

/** QANCHA VAQT UCHUN — ish kunlari va dars soati, narxi bilan. */
const WorkSummary = ({ work, isCurrentMonth }) => {
  const tiles = [];

  if (work.workDays != null) {
    tiles.push({
      key: "days",
      icon: CalendarDays,
      label: "Ish kunlari",
      value: `${work.workDays} kun`,
      hint: work.dailyRate
        ? `1 ish kuni = ${formatMoney(work.dailyRate)}`
        : "Yakshanba va bayramlarsiz",
    });
  }

  if (work.dailyRate) {
    tiles.push({
      key: "absent",
      icon: CalendarOff,
      label: "Kelmagan kunlar",
      value: `${work.absentDays} kun`,
      hint: work.absentDays > 0 ? "Har biri uchun 1 ish kuni ayrildi" : "Kelmagan kun yo'q",
      tone: work.absentDays > 0 ? "text-red-600" : "text-gray-900",
    });
  }

  if (work.paysByHours) {
    tiles.push({
      key: "hours",
      icon: Clock,
      label: "Dars soati",
      value:
        work.plannedHours != null
          ? `${work.paidHours} / ${work.plannedHours} soat`
          : `${work.paidHours} soat`,
      hint: [
        `1 soat = ${formatMoney(work.perHourRate)}`,
        work.missedHours > 0 && `o'tilmadi ${work.missedHours}`,
        isCurrentMonth && work.remainingHours > 0 && `qoldi ${work.remainingHours}`,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  if (tiles.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-2", WORK_GRID_COLS[tiles.length])}>
      {tiles.map(({ key, icon: Icon, label, value, hint, tone = "text-gray-900" }) => (
        <div key={key} className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon className="size-3.5" strokeWidth={2} />
            {label}
          </p>
          <p className={cn("mt-0.5 text-base font-semibold", tone)}>{value}</p>
          {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
        </div>
      ))}
    </div>
  );
};

/** Zanjir qatori: nomi (+ izoh) chapda, summa o'ngda. */
const Row = ({ label, hint, value, tone = "text-gray-900", strong = false, divider = false }) => (
  <li
    className={cn(
      "flex items-start justify-between gap-3",
      divider && "border-t border-gray-100 pt-2",
    )}
  >
    <span className={cn(strong ? "font-medium text-gray-900" : "text-gray-600")}>
      {label}
      {hint && <span className="block text-xs font-normal text-gray-400">{hint}</span>}
    </span>
    <span className={cn("shrink-0", strong ? "text-base font-bold" : "font-medium", tone)}>
      {value}
    </span>
  </li>
);

export default PayrollMonthModal;
