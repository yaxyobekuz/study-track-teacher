/**
 * KELMAGAN KUNLAR — davomat holati belgisi (server `statusLabel` beradi,
 * bu yerda faqat rang).
 */
export const ABSENCE_STATUS_META = {
  absent: "bg-red-100 text-red-700",
  excused: "bg-amber-100 text-amber-700",
};

/** Kelmagan kunlar qisqa izohi: "2 kun × 200 000 so'm". */
export const absenceSummaryOf = (absence, formatMoney) =>
  absence ? `${absence.dayCount} kun × ${formatMoney(absence.dailyRate)}` : "";
