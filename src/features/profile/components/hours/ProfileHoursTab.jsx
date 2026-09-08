// React
import { useState } from "react";

// Icons
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Repeat2,
  Wallet,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import HoursHero from "./HoursHero";
import HoursPanel from "./HoursPanel";
import MyHoursCurve from "./MyHoursCurve";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  CHIP,
  HUE,
  MOTION,
  SURFACE,
  T,
  formatHourNumber,
  gridDelay,
} from "../../data/ledger.tokens";
import { profileQueries } from "../../queries/profile.queries";

/**
 * DARS SOATLARIM — o'qituvchining jonli paneli.
 *
 * Ekran uch savolga javob beradi:
 *   · shartnomam qanday (rejim va stavka — FAQAT KO'RISH);
 *   · shu oyda qancha soat o'tdim va qancha qoldi;
 *   · hozirgacha qancha yig'ildi va oy oxirida qancha chiqadi.
 *
 * ⚠️ TAHRIRLASH YO'Q. Maosh rejimini ham, stavkani ham boshliq belgilaydi
 * (`payroll.assign`). Bu yerda birorta ham yozadigan tugma bo'lmasligi —
 * modulning asosiy qoidasi.
 *
 * ⚠️ MA'LUMOT SERVERDAN TAYYOR KELADI. Panel summalarni qo'shmaydi va
 * soatni ko'paytirmaydi: pul `Decimal(14,2)` va API'da STRING, mijozda
 * arifmetika qilinsa katta summalarda aniqlik yo'qolardi.
 */
const currentMonthKey = () => {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
};

const prevMonthKey = (key) => (key % 100 === 1 ? key - 89 : key - 1);
const nextMonthKey = (key) => (key % 100 === 12 ? key + 89 : key + 1);

const ProfileHoursTab = () => {
  const [month, setMonth] = useState(currentMonthKey());

  const { data, isLoading, isError } = useQuery(profileQueries.hours({ month }));
  const { data: subs } = useQuery(profileQueries.substitutions());

  const atCurrent = month >= currentMonthKey();
  const state = { data, isLoading, isError };

  // ⚠️ ZAMIN "BLEED" QILINMAYDI — o'zi yopiq maydon.
  //
  // Kartalar chegarasiz va faqat soya bilan ajraladi, shuning uchun ular
  // ostida oq'dan 3-4% quyuqroq zamin KERAK. Uni manfiy margin bilan layout
  // padding'idan tashqariga chiqarish mumkin edi, lekin bu panelda padding
  // uch xil (`p-4 pb-24 md:pb-4 md:py-2`) va har bir chetni alohida
  // hisoblash ertami-kechmi bir piksel adashardi. Yopiq maydon esa tabning
  // ichida turadi va hech nimaga bog'liq emas.
  return (
    <div className={cn(SURFACE.page, "space-y-4 rounded-[20px] p-3 xs:p-4")}>
      {/* ── Oy tanlagich ─────────────────────────────────────── */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]">
          <button
            type="button"
            onClick={() => setMonth(prevMonthKey(month))}
            aria-label="Oldingi oy"
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2.2} />
          </button>

          <span className="flex items-center gap-2 px-2.5">
            <CalendarDays className="size-3.5 text-slate-400" strokeWidth={2} />
            <span className={cn(T.value, "text-[12.5px]")}>
              {data?.monthLabel ?? "—"}
            </span>
          </span>

          <button
            type="button"
            disabled={atCurrent}
            onClick={() => setMonth(nextMonthKey(month))}
            aria-label="Keyingi oy"
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-colors duration-200",
              atCurrent
                ? "cursor-not-allowed text-slate-200"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
            )}
          >
            <ChevronRight className="size-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <HoursHero data={data} isLoading={isLoading} />

      {/* Ta'til oyi — sababsiz nol raqamlar "tizim buzuq" deb o'qiladi */}
      {data?.isVacationMonth && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3">
          <p className="text-[12.5px] font-medium text-amber-900">
            {data.monthLabel} — ta'til oyi. Dars o'tilmaydi, shuning uchun soat
            hisoblanmaydi.
          </p>
        </div>
      )}

      {/* Qoida umuman yo'q — bu ham javob, bo'sh ekran emas */}
      {!isLoading && !data?.hasRule && (
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className={T.hint}>
            Sizga hali oylik qoidasi belgilanmagan. Shartnoma sharti kiritilgach,
            bu ekranda maosh hisobi avtomatik ko'rinadi.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MyHoursCurve {...state} delay={gridDelay(0)} />
        </div>

        <WeekPanel data={data} isLoading={isLoading} isError={isError} delay={gridDelay(1)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ClassBreakdown {...state} delay={gridDelay(2)} />
        <SubstitutionList subs={subs} delay={gridDelay(3)} />
      </div>

      <HistoryPanel {...state} delay={gridDelay(4)} />
    </div>
  );
};

/* ─────────────────────── HAFTALIK JADVAL ─────────────────────── */

const WEEK = [
  { dayNumber: 1, label: "Du" },
  { dayNumber: 2, label: "Se" },
  { dayNumber: 3, label: "Ch" },
  { dayNumber: 4, label: "Pa" },
  { dayNumber: 5, label: "Ju" },
  { dayNumber: 6, label: "Sh" },
];

/**
 * ⚠️ YAKSHANBA YO'Q va bu qo'shimcha shart emas: `ScheduleDay` enumida
 * yakshanba umuman mavjud emas. Darsi yo'q kun esa CHIZILADI — "payshanbada
 * dars yo'q" ham ma'lumot.
 */
const WeekPanel = ({ data, isLoading, isError, delay }) => {
  const byDay = data?.byDay ?? [];
  const map = new Map(byDay.map((row) => [row.dayNumber, row]));
  const max = Math.max(1, ...byDay.map((row) => row.hours));

  return (
    <HoursPanel
      title="Haftalik yuklama"
      hint="Jadval bo'yicha kunlik dars soni"
      icon={LayoutGrid}
      tone="planned"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && byDay.length === 0}
      emptyText="Dars jadvalida sizga biriktirilgan dars yo'q"
    >
      <div className="flex items-end gap-1.5">
        {WEEK.map((day, index) => {
          const row = map.get(day.dayNumber);
          const hours = row?.hours ?? 0;
          const height = hours > 0 ? Math.max(10, (hours / max) * 84) : 4;

          return (
            <div key={day.dayNumber} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "text-[10.5px] font-semibold tabular-nums",
                  hours > 0 ? "text-slate-700" : "text-slate-300",
                )}
              >
                {hours || "—"}
              </span>

              <div
                className={cn(
                  "w-full rounded-lg origin-bottom motion-safe:animate-post",
                  hours > 0 ? "bg-indigo-500" : "bg-slate-200",
                )}
                style={{ height: `${height}px`, animationDelay: `${delay + index * 45}ms` }}
                title={row ? `${row.dayLabel}: ${hours} soat` : "Dars yo'q"}
              />

              <span className={cn(T.meta, hours === 0 && "text-slate-300")}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className={cn(SURFACE.tile, "mt-4 flex items-center justify-between py-2.5")}>
        <span className={T.label}>Haftasiga</span>
        <span className={cn(T.value, "text-[13px]")}>
          {formatHourNumber(data?.weeklyHours)}
        </span>
      </div>
    </HoursPanel>
  );
};

/* ─────────────────────── SINF KESIMI ─────────────────────── */

const ClassBreakdown = ({ data, isLoading, isError, delay }) => {
  const rows = data?.byClass ?? [];
  const max = Math.max(1, ...rows.map((row) => row.hours));

  return (
    <HoursPanel
      title="Sinflar kesimi"
      hint="Shu oyda qaysi sinfda necha soat"
      icon={LayoutGrid}
      tone="taught"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && rows.length === 0}
    >
      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li key={row.id} className="flex items-center gap-3">
            <span className={cn(T.td, "w-[88px] shrink-0 truncate")}>{row.name}</span>

            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className={cn("block h-full rounded-full", MOTION.bar)}
                style={{
                  width: `${(row.hours / max) * 100}%`,
                  background: HUE.line,
                  animationDelay: `${delay + 120 + index * 50}ms`,
                }}
              />
            </span>

            {/* Ko'chirilgan va o'rniga chiqilgan soat ALOHIDA — ular
                qo'shilmaydi, chunki nol farq "hech narsa bo'lmadi"
                degani emas. */}
            {row.substituted > 0 && (
              <span className={cn(CHIP, "bg-rose-50 text-rose-700")}>
                −{row.substituted}
              </span>
            )}
            {row.covered > 0 && (
              <span className={cn(CHIP, "bg-emerald-50 text-emerald-700")}>
                +{row.covered}
              </span>
            )}

            <span className={cn(T.tdNum, "w-10 shrink-0 text-right")}>
              {row.hours}
            </span>
          </li>
        ))}
      </ul>
    </HoursPanel>
  );
};

/* ─────────────────────── O'RINBOSARLIK ─────────────────────── */

/**
 * ⚠️ IKKI YO'NALISH ALOHIDA KO'RSATILADI: "berdim" (soat ketdi) va
 * "o'rniga chiqdim" (soat keldi). Ularni bitta raqamga qo'shish
 * o'qituvchidan aynan nima bo'lganini yashirardi.
 */
const SubstitutionList = ({ subs, delay }) => {
  const given = subs?.given ?? [];
  const taken = subs?.taken ?? [];
  const rows = [
    ...given.map((row) => ({ ...row, direction: "given" })),
    ...taken.map((row) => ({ ...row, direction: "taken" })),
  ];

  return (
    <HoursPanel
      title="O'rinbosarlik"
      hint="Berilgan va o'rniga chiqilgan darslar"
      icon={Repeat2}
      tone="given"
      delay={delay}
      isEmpty={rows.length === 0}
      emptyText="Sizda o'rinbosarlik yozuvi yo'q"
    >
      <ul className="space-y-1.5">
        {rows.map((row) => {
          const isGiven = row.direction === "given";
          const partner = isGiven
            ? row.substituteTeacherName
            : row.originalTeacherName;

          return (
            <li key={row.id} className={cn(SURFACE.tile, "flex items-center gap-2.5 py-2.5")}>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-lg",
                  isGiven ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600",
                )}
              >
                {isGiven ? (
                  <ArrowUpRight className="size-3" strokeWidth={2.4} />
                ) : (
                  <ArrowDownLeft className="size-3" strokeWidth={2.4} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className={cn(T.td, "truncate")}>
                  <span className="font-medium text-slate-900">{partner}</span>
                  {isGiven ? " o'rningizga chiqadi" : " o'rniga chiqasiz"}
                </p>
                {/* ⚠️ Sana matni SERVERDAN tayyor keladi (`periodLabel`):
                    `fromDate`/`toDate` — `@db.Date`, UTC yarim tunida.
                    Brauzerda o'qilsa kun taymzonaga qarab siljirdi. */}
                <p className={cn(T.meta, "mt-0.5 truncate")}>
                  {row.periodLabel} · {row.reasonLabel}
                </p>
              </div>

              <span
                className={cn(
                  CHIP,
                  isGiven ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
                )}
              >
                {row.lessonCount} dars
              </span>
            </li>
          );
        })}
      </ul>
    </HoursPanel>
  );
};

/* ─────────────────────── TARIX ─────────────────────── */

/**
 * ⚠️ BAZAVIY VA SOATDAN CHIQQAN QISM AJRATILGAN: aralash rejimda "oylik
 * oshdi" degani "ko'proq dars o'tdim" ham, "bazaviy oshirildi" ham
 * bo'lishi mumkin va bu ikkisi butunlay boshqa xabar.
 */
const HistoryPanel = ({ data, isLoading, isError, delay }) => {
  const history = data?.history ?? [];
  const max = Math.max(1, ...history.map((row) => Number(row.amount) || 0));

  return (
    <HoursPanel
      title="Oxirgi oylar"
      hint="Muhrlangan oylik majburiyatlari"
      icon={Wallet}
      tone="settled"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && history.length === 0}
      emptyText="Hali oylik majburiyati shakllantirilmagan"
    >
      <div className="flex items-end gap-3">
        {history.map((row, index) => {
          const total = Number(row.amount) || 0;
          const hours = Number(row.hoursAmount) || 0;
          const share = total > 0 ? hours / total : 0;

          return (
            <div key={row.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className={cn(T.meta, "tabular-nums")}>
                {row.hoursWorked || ""}
              </span>

              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-xl bg-slate-100 origin-bottom motion-safe:animate-post"
                style={{
                  height: `${Math.max(8, (total / max) * 110)}px`,
                  animationDelay: `${delay + index * 60}ms`,
                }}
                title={`${row.monthLabel}: ${row.amount}`}
              >
                <span className="w-full bg-indigo-500" style={{ height: `${share * 100}%` }} />
                <span
                  className="w-full bg-slate-400"
                  style={{ height: `${(1 - share) * 100}%` }}
                />
              </div>

              {/* ⚠️ `monthLabel` ni kesib bo'lmaydi: "Iyun" va "Iyul"
                  ikkalasi ham "Iyu" bo'lib qolardi. Qisqartma serverda
                  tayyorlanadi (`formatMonthShort`). */}
              <span className={cn(T.meta, "w-full truncate text-center")}>
                {row.monthShortLabel}
              </span>
              <span className={cn(T.meta, "w-full truncate text-center text-slate-400")}>
                {formatMoney(row.amount, { withLabel: false })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Legend color="#4F46E5" label="Dars soatidan" />
        <Legend color="#94A3B8" label="Bazaviy qism" />
      </div>
    </HoursPanel>
  );
};

const Legend = ({ color, label }) => (
  <span className="flex items-center gap-1.5">
    <span className="size-2 rounded-full" style={{ background: color }} />
    <span className={T.meta}>{label}</span>
  </span>
);

export default ProfileHoursTab;
