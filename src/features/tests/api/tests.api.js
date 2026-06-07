import http from "@/shared/api/http";

// Testlar (V3) — mavsumdan mustaqil, sof savol konteyneri.
export const testsAPI = {
  getAll: (params = {}) => http.get("/tests", { params }),
  getOne: (id) => http.get(`/tests/${id}`),
  create: (data) => http.post("/tests", data),
  update: (id, data) => http.put(`/tests/${id}`, data),
  delete: (id) => http.delete(`/tests/${id}`),
};

// Test ichidagi savollar.
export const testQuestionsAPI = {
  getAll: (testId) => http.get(`/tests/${testId}/questions`),
  create: (testId, formData) =>
    http.post(`/tests/${testId}/questions`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    http.put(`/questions/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => http.delete(`/questions/${id}`),
  reorder: (testId, orderedIds) =>
    http.patch(`/tests/${testId}/questions/reorder`, { orderedIds }),
};

// AI yordamida savol generatsiyasi (prompt yoki fayl orqali).
export const testAiAPI = {
  generate: (testId, formData) =>
    http.post(`/tests/${testId}/questions/ai-generate`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Test biriktiruvlari (V3 yangi).
export const testBindingsAPI = {
  getForTest: (testId) => http.get(`/tests/${testId}/bindings`),
  create: (testId, data) => http.post(`/tests/${testId}/bindings`, data),
  update: (id, data) => http.put(`/bindings/${id}`, data),
  publish: (id) => http.patch(`/bindings/${id}/publish`),
  close: (id) => http.patch(`/bindings/${id}/close`),
  delete: (id) => http.delete(`/bindings/${id}`),
  reopen: (id, studentId) =>
    http.post(`/bindings/${id}/reopen`, { studentId }),
  getAvailable: () => http.get("/bindings/available"),
};
