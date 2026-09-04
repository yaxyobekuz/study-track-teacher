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
};
