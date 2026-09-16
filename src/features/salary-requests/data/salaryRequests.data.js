/**
 * Oylik zayavkalari bo'limining statik ma'lumotlari.
 * Reusable static data — feature ichida takrorlanmaydi.
 */

/** Zayavka turi (server: kind — 'category' | 'bonus'). */
export const REQUEST_TYPE_OPTIONS = [
  { value: "category", label: "Toifa" },
  { value: "bonus", label: "Ustama" },
];

export const REQUEST_TYPE_LABELS = {
  category: "Toifa",
  bonus: "Ustama",
};

/** Ustama turi (server: bonusType). */
export const BONUS_TYPE_OPTIONS = [
  { value: "fixed", label: "So'm (qat'iy summa)" },
  { value: "percent", label: "Foiz (oylikdan %)" },
];

/** Ko'rib chiqish holati. */
export const REQUEST_STATUS_LABELS = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
};

export const REQUEST_STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
