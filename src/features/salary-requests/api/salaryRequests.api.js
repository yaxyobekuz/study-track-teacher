import http from "@/shared/api/http";

/**
 * Oylik zayavkalari — o'qituvchi TOIFA yoki USTAMA so'raydi (hujjat + izoh).
 * Admin panelda ko'rib chiqiladi; tasdiqlansa toifa/ustama avtomatik
 * qo'llanadi va oylik qayta hisoblanadi.
 *
 * Server: /payroll-requests (kind: 'category' | 'bonus').
 */
export const salaryRequestsAPI = {
  // O'z zayavkalari (eng yangisi birinchi)
  getMine: (params) => http.get("/payroll-requests/mine", { params }),

  // Toifa zayavkasida tanlanadigan toifalar (joriysi belgilangan)
  getAvailableCategories: () =>
    http.get("/payroll-requests/available-categories"),

  // Yangi zayavka (multipart — hujjat biriktiriladi, maydon nomi "files")
  create: (formData) =>
    http.post("/payroll-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // O'z pending zayavkasini bekor qilish
  cancel: (id) => http.delete(`/payroll-requests/${id}`),
};
