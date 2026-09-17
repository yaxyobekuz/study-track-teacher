// Tyutor guruhlari — statik ma'lumot (yorliqlar, ranglar, ustunlar).

// Utils
import { formatMonthUz } from "@/shared/utils/date.utils";

/** Biriktirish holati (server `status`) → nishon rangi. */
export const GROUP_STATUS_META = {
  active: { label: "Amalda", className: "bg-green-50 text-green-700" },
  planned: { label: "Rejada", className: "bg-blue-50 text-blue-700" },
  ended: { label: "Tugagan", className: "bg-gray-100 text-gray-500" },
};

/** Bugungi davomat holati → nishon. `null` — hali belgilanmagan. */
export const ATTENDANCE_STATUS_META = {
  present: { label: "Keldi", className: "bg-green-50 text-green-700" },
  late: { label: "Kech keldi", className: "bg-amber-50 text-amber-700" },
  absent: { label: "Kelmadi", className: "bg-red-50 text-red-700" },
  excused: { label: "Sababli", className: "bg-blue-50 text-blue-700" },
  unmarked: { label: "Belgilanmagan", className: "bg-gray-100 text-gray-500" },
};

/** Guruh o'quvchilari jadvali. */
export const STUDENT_COLUMNS = [
  { label: "#", className: "w-10" },
  "O'quvchi",
  "Bugun",
  { label: "Davomat", align: "right" },
  { label: "Qoldirgan", align: "right" },
  { label: "Kech keldi", align: "right" },
  { label: "O'rtacha baho", align: "right" },
];

/** Fanlar bo'yicha baholar jadvali. */
export const SUBJECT_COLUMNS = [
  "Fan",
  { label: "O'rtacha baho", align: "right" },
  { label: "Baholar soni", align: "right" },
];

/** Joriy oy — YYYYMM. */
export const currentMonthKey = () => {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
};

const prevMonthKey = (monthKey) => (monthKey % 100 === 1 ? monthKey - 89 : monthKey - 1);

/**
 * Oy tanlagichi: joriy oy va undan oldingi `back` oy (kelajak oyda ma'lumot yo'q).
 * @returns {Array<{label: string, value: string}>}
 */
export const buildMonthOptions = (back = 12) => {
  const options = [];
  let key = currentMonthKey();
  for (let i = 0; i <= back; i += 1) {
    options.push({ label: formatMonthUz(key), value: String(key) });
    key = prevMonthKey(key);
  }
  return options;
};

/** Foizga qarab rang: past davomat ko'zga tashlansin. */
export const percentClass = (value) =>
  value == null
    ? "text-gray-400"
    : value >= 90
      ? "text-green-600"
      : value >= 75
        ? "text-amber-600"
        : "text-red-600";
