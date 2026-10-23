import http from "@/shared/api/http";

/**
 * O'QUVCHILAR DAVOMATI — o'qituvchi o'z darsiga belgilaydi.
 *
 * ⚠️ Uchta yo'lning hammasi SERVER DARVOZASIDAN o'tadi: ruxsat kaliti yo'q,
 * huquq dars jadvalidan keladi va o'qituvchi id si tokendan olinadi.
 * Sinflar ro'yxati ham, ro'yxatdagi o'quvchilar ham serverdan — panel
 * hech narsani o'zidan qo'shmaydi.
 */
export const studentAttendanceAPI = {
  /** Bugun davomat belgilanadigan sinflar: darslar, yig'indi, maktabda bo'lish. */
  getDay: () => http.get("/student-attendance/teacher/day"),

  /** Bitta sinfning bugungi ro'yxati. */
  getClassRoster: (classId) =>
    http.get(`/student-attendance/teacher/class/${classId}`),

  /** `{ classId, records: [{ studentId, status, excuseReason }] }`. */
  mark: (data) => http.post("/student-attendance/teacher/mark", data),
};
