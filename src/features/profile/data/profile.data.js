// Profil sahifasining statik ma'lumotlari.
//
// "Dars jadvali" va "Oylik" tablari admin paneldagi xodim kartasi bilan bir
// xil ko'rinishda: bitta odam ikki panelda ikki xil raqam ko'rmasligi kerak.
// Summalar ustida arifmetika QILINMAYDI — jami, to'langan va qoldiq serverdan
// tayyor keladi.

// Icons
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  HandCoins,
  Layers,
  TrendingDown,
  Wallet,
} from "lucide-react";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { days } from "@/shared/data/days.data";

// ─────────────────────────────────────────────
// Tablar
// ─────────────────────────────────────────────

/**
 * `roles` — tab qaysi rollarga ma'noli (berilmasa hammaga).
 * Dars yuklamasi FAQAT o'qituvchida: jadvalga faqat `teacher` roli
 * qo'yiladi, boshqa xodimda bu tab doim bo'sh turardi.
 */
export const PROFILE_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "workload", label: "Dars jadvali", roles: ["teacher"] },
  { value: "payroll", label: "Oylik" },
];

/** URL'dagi `?tab=` qiymati ro'yxatda bo'lmasa — birinchi tab. */
export const resolveTab = (tabs, value) =>
  tabs.some((tab) => tab.value === value) ? value : tabs[0].value;

// ─────────────────────────────────────────────
// Sarlavha
// ─────────────────────────────────────────────

/**
 * Ism-familiyadan bosh harflar (avatar o'rnida).
 * @param {{firstName?: string, lastName?: string, fullName?: string}} user
 */
export const getInitials = (user) => {
  const first = user?.firstName?.[0] ?? user?.fullName?.[0] ?? "";
  const last = user?.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
};

export const getRoleBadgeClass = (role) => {
  if (role === "owner") return "bg-purple-100 text-purple-700";
  if (role === "teacher") return "bg-green-100 text-green-700";
  if (role === "student") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

// ─────────────────────────────────────────────
// Dars jadvali
// ─────────────────────────────────────────────

/**
 * `{ dushanba: "Dushanba", ... }` — yorliqlar YAGONA manbadan
 * (`days.data.js`). Nusxa massiv yozilmaydi.
 */
export const DAY_LABEL = Object.fromEntries(
  days.map((day) => [day.value, day.label]),
);

export const WORKLOAD_CLASS_COLUMNS = [
  "Sinf",
  "Fan",
  { label: "Haftalik soat", align: "right" },
];

/**
 * Yuklama kartalari. ⚠️ SOAT = DARS (haftalik dars soni), astronomik soat emas.
 *
 * Oylik kartasi server oylik ma'lumotini yuborganda chiziladi — o'z profilida
 * u doim bor (bu odamning o'z oyligi), lekin qoida belgilanmagan bo'lsa
 * `amount` bo'sh keladi.
 *
 * @param {object} workload - `GET /schedules/my-workload` payload'i
 */
export const buildWorkloadTiles = (workload) => {
  const { totals, salary } = workload;
  const busiest = totals.busiestDay;

  const tiles = [
    {
      key: "hours",
      label: "Haftalik dars soati",
      value: totals.weeklyHours,
      icon: CalendarDays,
      hint: busiest
        ? `Eng band kun — ${DAY_LABEL[busiest.day] ?? busiest.day}: ${busiest.hours} soat`
        : "Jadvalda dars yo'q",
    },
    {
      key: "classes",
      label: "Sinflar",
      value: totals.classCount,
      icon: Layers,
      hint: `Haftada ${totals.activeDays} kun dars bor`,
    },
    {
      key: "subjects",
      label: "Fanlar",
      value: totals.subjectCount,
      icon: BookOpen,
      hint: "Jadvalda amalda o'tilayotgan fanlar",
    },
  ];

  if (salary) {
    tiles.push({
      key: "perHour",
      label: "Bir haftalik soatga",
      value: formatMoney(salary.perWeeklyHour),
      icon: Wallet,
      // ⚠️ "Bitta darsning narxi" EMAS: uning uchun oyda necha hafta
      // borligini taxmin qilish kerak bo'lardi, bunday raqam domenda yo'q.
      hint: salary.amount
        ? `${salary.monthLabel}: ${formatMoney(salary.amount)} oylik`
        : "Oylik belgilanmagan",
    });
  }

  return tiles;
};

// ─────────────────────────────────────────────
// Oylik
// ─────────────────────────────────────────────

export const PAYROLL_RULE_COLUMNS = [
  { label: "Oylik", align: "right" },
  "Davr",
  "Holat",
];

export const PAYROLL_ENTRY_COLUMNS = [
  "Oy",
  { label: "Hisoblangan", align: "right" },
  { label: "To'langan", align: "right" },
  { label: "Qoldiq", align: "right" },
  "Holat",
];

/** Majburiyat holati uchun badge (admin paneldagi bilan bir xil ranglar). */
export const ENTRY_STATUS_META = {
  unpaid: { label: "To'lanmagan", className: "bg-red-100 text-red-700" },
  partial: { label: "Qisman to'langan", className: "bg-amber-100 text-amber-700" },
  paid: { label: "To'langan", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Bekor qilingan", className: "bg-gray-100 text-gray-600" },
};

/** Qoida davri holati. */
export const getRuleStatus = (rule, currentMonth) => {
  if (rule.startMonth > currentMonth) {
    return { label: "Kelajakda", className: "bg-blue-100 text-blue-700" };
  }
  if (rule.endMonth != null && rule.endMonth < currentMonth) {
    return { label: "Tugagan", className: "bg-gray-100 text-gray-600" };
  }
  return { label: "Amalda", className: "bg-green-100 text-green-700" };
};

/**
 * Oylik ko'rsatkichlari — xodimning o'z nuqtai nazaridan.
 *
 * @param {object} args
 * @param {object|null} args.salary - `GET /payroll/salaries/my` payload'i
 * @param {object|null} args.entries - `GET /payroll/my` payload'i
 */
export const buildPayrollTiles = ({ salary, entries }) => {
  const rule = salary?.current ?? null;
  const totals = entries?.totals ?? null;

  // Joriy oy majburiyati — qoida bo'lsa ham shakllantirilmagan bo'lishi
  // mumkin: majburiyat oyda bir marta alohida hosil qilinadi.
  const currentEntry =
    entries?.items?.find((item) => item.month === salary?.currentMonth) ?? null;

  return [
    {
      key: "rule",
      label: "Amaldagi oylik",
      value: formatMoney(rule?.amount),
      icon: Wallet,
      hint: rule?.periodLabel ?? "Oylik qoidasi belgilanmagan",
    },
    {
      key: "currentMonth",
      label: "Joriy oy",
      value: formatMoney(currentEntry?.amount),
      icon: CalendarClock,
      hint: currentEntry
        ? `${currentEntry.monthLabel}: ${currentEntry.statusLabel}`
        : `${salary?.currentMonthLabel ?? "Joriy oy"} uchun hali shakllantirilmagan`,
    },
    {
      key: "paid",
      label: "Jami olingan",
      value: formatMoney(totals?.paid),
      icon: HandCoins,
      valueClassName: "text-green-700",
      hint: "Barcha oylar bo'yicha",
    },
    {
      key: "debt",
      label: "To'lanmagan qoldiq",
      value: formatMoney(totals?.debt),
      icon: TrendingDown,
      valueClassName: "text-red-600",
      hint: totals?.unpaidCount
        ? `${totals.unpaidCount} ta oy to'liq yopilmagan`
        : "To'lanmagan oylik yo'q",
    },
  ];
};
