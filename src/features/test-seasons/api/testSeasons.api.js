import http from "@/shared/api/http";

// Mavsumlar - o'qituvchi va o'quvchi uchun faqat faollarini o'qish kerak.
export const testSeasonsAPI = {
  getActive: () => http.get("/test-seasons/active"),
  getStats: (id, params = {}) =>
    http.get(`/test-seasons/${id}/stats`, { params }),
  getClassStats: (id, classId) =>
    http.get(`/test-seasons/${id}/class/${classId}/stats`),
  getMyStats: (id) => http.get(`/test-seasons/${id}/my-stats`),
  setClassTiers: (id, classId, tiers) =>
    http.put(`/test-seasons/${id}/class/${classId}/tiers`, { tiers }),
  getOne: (id) => http.get(`/test-seasons/${id}`).catch(() => null),
};
