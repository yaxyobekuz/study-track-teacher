// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// Utils
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

// API
import { gradesAPI } from "../api/grades.api";
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

export const gradesKeys = createQueryKeys("grades");

/** Keys for grades-page reads that don't fit the plain list/detail shape. */
const classDateKey = (classId, date) => [
  ...gradesKeys.all,
  "class-date",
  classId,
  date,
];
const scheduleSubjectsKey = (classId, date) => [
  ...gradesKeys.all,
  "schedule-subjects",
  classId,
  date,
];
const teacherSubjectsKey = (classId) => [
  ...gradesKeys.all,
  "teacher-subjects",
  classId,
];
const studentsWithGradesKey = (params) => [
  ...gradesKeys.all,
  "students-with-grades",
  params,
];
const myTodayClassesKey = [...gradesKeys.all, "my-today-classes"];

export const gradesQueries = {
  /** Students with their grades for a class on a given date (GradesPage table). */
  classDate: (classId, date) =>
    queryOptions({
      queryKey: classDateKey(classId, date),
      queryFn: () =>
        gradesAPI.getByClassAndDate(classId, date).then((r) => r.data.data),
      enabled: Boolean(classId && date),
    }),

  /**
   * Subjects scheduled for a class on a given date, ordered by lesson order.
   * Returns [] on Sundays (no lessons) so the table renders no subject columns.
   */
  scheduleSubjects: (classId, date) =>
    queryOptions({
      queryKey: scheduleSubjectsKey(classId, date),
      queryFn: () => {
        if (getDayOfWeekUZ(date) === "yakshanba") return [];

        return schedulesAPI.getByDay(classId, getDayOfWeekUZ(date)).then((r) => {
          const subjects = r.data.data?.subjects;
          if (!subjects) return [];

          return subjects
            .filter((s) => s.subject)
            .map((s) => ({ ...s.subject, lessonOrder: s.order }))
            .sort((a, b) => a.lessonOrder - b.lessonOrder);
        });
      },
      enabled: Boolean(classId && date),
    }),

  /** Today's classes for the current teacher, derived from their schedule. */
  myTodayClasses: () =>
    queryOptions({
      queryKey: myTodayClassesKey,
      queryFn: () =>
        schedulesAPI
          .getMyToday()
          .then((r) => r.data.data.map((schedule) => schedule.class)),
    }),

  /** Subjects the current teacher teaches in a class (with lesson order). */
  teacherSubjects: (classId) =>
    queryOptions({
      queryKey: teacherSubjectsKey(classId),
      queryFn: () =>
        gradesAPI.getTeacherSubjects(classId).then((r) => r.data),
      enabled: Boolean(classId),
    }),

  /**
   * Students of a class with the grade (if any) for a subject/lessonOrder/date.
   * The raw payload carries `currentTopic` alongside `data`, so this keeps the
   * whole `res.data` — read `data.data` / `data.currentTopic` in the component.
   */
  studentsWithGrades: (params) =>
    queryOptions({
      queryKey: studentsWithGradesKey(params),
      queryFn: () => gradesAPI.getStudentsWithGrades(params).then((r) => r.data),
      enabled: Boolean(params.classId && params.subjectId && params.lessonOrder),
    }),
};
