/**
 * Oylik zayavkalari bo'limining statik ma'lumotlari.
 * Reusable static data — feature ichida takrorlanmasligi uchun shu yerda.
 */

/** Zayavka maqsadi (server: kind). */
export const REQUEST_KIND_OPTIONS = [
  { value: "category", label: "Toifa o'zgartirish" },
  { value: "bonus", label: "Ustama haq" },
];

export const REQUEST_KIND_LABELS = {
  category: "Toifa o'zgartirish",
  bonus: "Ustama haq",
};

/** Ustama turi. */
export const BONUS_TYPE_OPTIONS = [
  { value: "fixed", label: "Qat'iy summa (so'm)" },
  { value: "percent", label: "Foiz (%)" },
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
