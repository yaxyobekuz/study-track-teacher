import http from "@/shared/api/http";

/**
 * TYUTORNING O'Z GURUHIDAGI SERTIFIKAT REJALARI.
 *
 * ⚠️ Ruxsat kaliti YO'Q — server tyutor id sini TOKENDAN oladi va sinf
 * uning joriy guruhi bo'lishini har so'rovda tekshiradi (boshqa guruh →
 * 403, `/tutor-groups/my` bilan AYNI qoida).
 */
export const certificatesAPI = {
  // Guruh rejalari + yo'nalishlar katalogi (tanlagich uchun)
  getGroup: (classId) => http.get(`/certificates/tutor/groups/${classId}`),

  // Faqat muddat va yo'nalish — `{ dueDate, trackId }`
  updatePlan: (planId, payload) =>
    http.patch(`/certificates/tutor/plans/${planId}`, payload),
};
