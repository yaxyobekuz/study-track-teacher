/**
 * Oylik so'rovlari bo'limining statik ma'lumotlari.
 * Reusable static data — feature ichida takrorlanmaydi.
 */

/** So'rov turi (server: type). */
export const REQUEST_TYPE_OPTIONS = [
  { value: "raise", label: "Oylik / stavka" },
  { value: "bonus", label: "Ustama" },
  { value: "other", label: "Boshqa" },
];

export const REQUEST_TYPE_LABELS = {
  raise: "Oylik / stavka",
  bonus: "Ustama",
  other: "Boshqa",
};

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
