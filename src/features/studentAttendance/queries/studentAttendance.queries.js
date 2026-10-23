// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { studentAttendanceAPI } from "../api/studentAttendance.api";

export const studentAttendanceKeys = createQueryKeys("student-attendance");

const dayKey = [...studentAttendanceKeys.all, "day"];
const rosterKey = (classId) => [...studentAttendanceKeys.all, "roster", classId];

export const studentAttendanceQueries = {
  /**
   * Bugun davomat belgilanadigan sinflar → `{ date, dateLabel, closed,
   * presence, canMark, classes: [{ id, name, lessons, summary }] }`.
   *
   * ⚠️ Har ochilganda qayta so'raladi: "Men keldim" boshqa sahifada
   * bosiladi va dars o'rinbosarga berilishi ham boshqa odamdan keladi —
   * eskirgan ro'yxat begona sinfni ko'rsatib turmasin.
   */
  day: () =>
    queryOptions({
      queryKey: dayKey,
      queryFn: () => studentAttendanceAPI.getDay().then((r) => r.data.data),
      refetchOnMount: "always",
    }),

  /**
   * Sinf ro'yxati → `{ classInfo, lessons, students, summary, ... }`.
   *
   * ⚠️ Belgilash paytida fokus qaytganda qayta yuklanmaydi: tanlangan,
   * lekin hali saqlanmagan holatlar o'chib ketmasligi kerak (admin
   * paneldagi belgilash ekrani bilan AYNI qaror).
   */
  roster: (classId) =>
    queryOptions({
      queryKey: rosterKey(classId),
      queryFn: () =>
        studentAttendanceAPI.getClassRoster(classId).then((r) => r.data.data),
      enabled: Boolean(classId),
      refetchOnWindowFocus: false,
    }),
};
