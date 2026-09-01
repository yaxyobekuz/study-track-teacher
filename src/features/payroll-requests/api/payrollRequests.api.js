import http from "@/shared/api/http";

/**
 * Oylik zayavkalari — o'qituvchi o'zi uchun TOIFA o'zgartirish yoki USTAMA haq
 * so'raydi (hujjat biriktirib). Admin panelda ko'rib chiqiladi.
 */
export const payrollRequestsAPI = {
  // O'z zayavkalari (eng yangisi birinchi)
  getMine: (params) => http.get("/payroll-requests/mine", { params }),

  // Tanlash mumkin bo'lgan toifalar (o'z bo'limi bo'yicha)
  getAvailableCategories: () =>
    http.get("/payroll-requests/available-categories"),

  // Yangi zayavka (multipart — hujjat/rasm biriktiriladi)
  create: (formData) =>
    http.post("/payroll-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // O'z pending zayavkasini bekor qilish
  cancel: (id) => http.delete(`/payroll-requests/${id}`),
};
