import http from "@/shared/api/http";

/**
 * TYUTORNING O'Z GURUHLARI — ruxsat kaliti yo'q, server id ni tokendan oladi.
 * Boshqa tyutorning guruhini ochib bo'lmaydi (server 403 qaytaradi).
 */
export const tutorGroupsAPI = {
  getMy: () => http.get("/tutor-groups/my"),
  getMyOverview: (id, params) => http.get(`/tutor-groups/my/${id}/overview`, { params }),
};
