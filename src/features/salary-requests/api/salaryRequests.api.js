import http from "@/shared/api/http";

/**
 * Oylik so'rovlari — o'qituvchi o'z oyligini ko'rib chiqishni so'raydi
 * (hujjat + izoh + ixtiyoriy taklif). Admin panelda ko'rib chiqiladi.
 */
export const salaryRequestsAPI = {
  // O'z so'rovlari (eng yangisi birinchi)
  getMine: (params) => http.get("/salary-requests/mine", { params }),

  // Yangi so'rov (multipart — hujjat biriktiriladi)
  create: (formData) =>
    http.post("/salary-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // O'z pending so'rovini bekor qilish
  cancel: (id) => http.delete(`/salary-requests/${id}`),
};
