// O'quvchilar davomati — statik ma'lumot (holatlar, ranglar, yorliqlar).

/**
 * Belgilash tugmalari.
 *
 * ⚠️ Ro'yxat SERVERDAGI holatlar bilan AYNI (`STUDENT_STATUSES`): yangi
 * holat faqat ikkalasida birga paydo bo'ladi, aks holda tugma 400 qaytarardi.
 */
export const MARK_STATUS_OPTIONS = [
  { value: "present", label: "Keldi", short: "Keldi" },
  { value: "late", label: "Kech keldi", short: "Kech" },
  { value: "absent", label: "Kelmadi", short: "Kelmadi" },
  { value: "excused", label: "Sababli", short: "Sababli" },
];

/** Tanlangan tugmaning ko'rinishi (hover ham saqlanadi — `outline` varianti). */
export const MARK_SELECTED_COLORS = {
  present: "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700",
  late: "bg-amber-100 text-amber-700 hover:bg-amber-100 hover:text-amber-700",
  absent: "bg-red-100 text-red-700 hover:bg-red-100 hover:text-red-700",
  excused: "bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700",
};

/**
 * Yig'indi kartalari.
 *
 * "Kelganlar" = keldi + kech keldi (kech kelgan ham maktabda).
 * "Kelmaganlar" = jami − kelganlar, ya'ni BELGILANMAGANLAR ham shu yerda:
 * bola hali belgilanmagani uchun "maktabda bor" bo'lib qolmasligi kerak.
 * Kalitlar server `summary` si va jonli `counts` bilan AYNI.
 */
export const SUMMARY_CARDS = [
  { key: "total", label: "Jami", className: "bg-gray-100 text-gray-700" },
  { key: "came", label: "Kelganlar", className: "bg-green-50 text-green-700" },
  { key: "notCame", label: "Kelmaganlar", className: "bg-red-50 text-red-700" },
  {
    key: "unmarked",
    label: "Belgilanmagan",
    className: "bg-gray-100 text-gray-500",
  },
];

/** Kun nima uchun yopiq (server `closed`) → ekrandagi sarlavha. */
export const CLOSED_TITLES = {
  sunday: "Bugun yakshanba",
  holiday: "Bugun dam olish kuni",
  vacation: "Ta'til oyi",
};

/**
 * Dars yorlig'i: "1-dars · 08:30 · Matematika".
 *
 * ⚠️ Vaqt SERVERDAN keladi (darsning o'zidan yoki "Dars vaqtlari"
 * sozlamasidan) — panel uni o'zi hisoblamaydi.
 */
export const lessonLabel = (lesson) =>
  [
    `${lesson.order}-dars`,
    lesson.startTime,
    lesson.subjectName,
    lesson.substituted ? "o'rinbosarlik" : null,
  ]
    .filter(Boolean)
    .join(" · ");

/** Sinf tanlagichidagi satr: "5-A — 18/20 belgilandi". */
export const classOptionLabel = (cls) => {
  const marked = cls.summary.total - cls.summary.unmarked;
  return `${cls.name} — ${marked}/${cls.summary.total} belgilandi`;
};
