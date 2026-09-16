import http from "@/shared/api/http";

/**
 * O'Z PROFILIM.
 *
 * Hammasi tokendagi odam haqida — identifikator yuborilmaydi, uni server
 * tokendan oladi. Shuning uchun bu so'rovlarga ruxsat kaliti kerak emas:
 * o'qituvchi o'z dars jadvalini va o'z oyligini ko'radi, boshqa hech kimnikini
 * emas.
 */
export const profileAPI = {
  update: (data) => http.put("/users/me", data),
  /** Haftalik dars yuklamam: jami soat, sinflar kesimi, haftalik jadval. */
  getWorkload: () => http.get("/schedules/my-workload"),
  /** Oylik qoidam (amaldagi va tarix). */
  getSalary: () => http.get("/payroll/salaries/my"),
  /** Oylik majburiyatlarim: har oy hisoblangani, to'langani, qoldiq. */
  getPayroll: () => http.get("/payroll/my"),
  /** Oylikdan ushlab qolishlarim: sabab, izoh, qancha va qaysi oyda. */
  getDeductions: () => http.get("/payroll/deductions/my"),

  /**
   * DARS SOATIM — jonli hisob: shartnoma sharti, o'tilgan va rejalashtirilgan
   * soat, hozirgacha yig'ilgan maosh, sinf kesimi va o'rinbosarlik.
   *
   * ⚠️ Ruxsat kaliti YO'Q: identifikator tokendan olinadi, ya'ni odam faqat
   * O'ZINIKINI ko'radi. `payroll.hours` talab qilinsa, o'qituvchi o'z
   * soatini ko'rish uchun butun shtatning vedomostiga huquq olishi kerak
   * bo'lardi.
   */
  getHours: (params) => http.get("/lesson-hours/my", { params }),

  /** O'rinbosarlik: men bergan va men olgan darslar. */
  getSubstitutions: () => http.get("/lesson-hours/my/substitutions"),
};
