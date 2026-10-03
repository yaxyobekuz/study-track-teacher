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

/**
 * O'TILMAGAN DARS sababi belgisi (server `reasonLabel` beradi, bu yerda faqat
 * rang). Sabablar — server `LESSON_MISS_REASONS` bilan AYNI kalitlar.
 */
export const MISSED_REASON_META = {
  absent: "bg-red-100 text-red-700",
  excused: "bg-amber-100 text-amber-700",
  noGrade: "bg-violet-100 text-violet-700",
};

/**
 * Pul satridan ishorani olib tashlaydi ("-15000.00" → "15000.00") —
 * ishora yonidagi belgi bilan ko'rsatilganda. Arifmetika EMAS: summa
 * serverdan qanday kelgan bo'lsa, shunday ko'rsatiladi.
 */
export const unsignedAmount = (value) => String(value ?? "").replace(/^-/, "");
