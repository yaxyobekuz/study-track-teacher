import http from "@/shared/api/http";

// Test natijalari — o'qituvchi (test muallifi) va o'quvchi (o'ziniki) uchun.
export const testResultsAPI = {
  getMy: (params = {}) => http.get("/test-results/my", { params }),
  getOne: (id) => http.get(`/test-results/${id}`),
  getByTest: (testId, params = {}) =>
    http.get(`/test-results/by-test/${testId}`, { params }),
  gradeOpenAnswer: (id, data) =>
    http.patch(`/test-results/${id}/grade`, data),
  addExtraPoints: (id, data) =>
    http.patch(`/test-results/${id}/extra-points`, data),
};

// Test sessiyalari — o'qituvchi (test muallifi) va o'quvchi (o'ziniki) uchun.
export const testSessionsAPI = {
  getByTest: (testId) => http.get(`/test-sessions/by-test/${testId}`),
  reopen: (data) => http.post("/test-sessions/reopen", data),
};
