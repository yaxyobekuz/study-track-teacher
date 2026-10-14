import http from "@/shared/api/http";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

/**
 * XODIM O'ZIGA O'ZI BELGILAGAN ISHLAR (`/self-tasks`).
 *
 * ⚠️ RUXSAT KALITI YO'Q va `userId` YUBORILMAYDI: server id'ni tokendan
 * oladi (`/payroll/my`, `/tutor-groups/my` bilan AYNI doktrina).
 *
 * ⚠️ Rahbar bergan topshiriqlar BOSHQA yo'lda (`tasks.api.js`): server
 * tomonda ham ikki oqim aralashmaydi (`self_assigned`), ya'ni bitta
 * so'rovdan ikkalasini olish imkoniyati umuman yo'q.
 */
export const selfTasksAPI = {
  getMy: (params) => http.get("/self-tasks", { params }),
  getStats: () => http.get("/self-tasks/stats"),

  create: (formData) => http.post("/self-tasks", formData, multipart),
  update: (id, formData) => http.put(`/self-tasks/${id}`, formData, multipart),
  // Yakunlash — "Tekshiruvda" bosqichisiz, darhol "Bajarildi"
  complete: (id, formData) => http.put(`/self-tasks/${id}/complete`, formData, multipart),
  extend: (id, data) => http.put(`/self-tasks/${id}/extend`, data),
  stop: (id, data) => http.put(`/self-tasks/${id}/stop`, data),
  reopen: (id, data) => http.put(`/self-tasks/${id}/reopen`, data),
  remove: (id) => http.delete(`/self-tasks/${id}`),

  // O'zining doimiy (takrorlanuvchi) ishlari
  getMyRules: (params) => http.get("/self-tasks/rules", { params }),
  createRule: (formData) => http.post("/self-tasks/rules", formData, multipart),
  stopRule: (id, data) => http.put(`/self-tasks/rules/${id}/stop`, data),
  resumeRule: (id) => http.put(`/self-tasks/rules/${id}/resume`),
  removeRule: (id) => http.delete(`/self-tasks/rules/${id}`),
};
