// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import useAuth from "@/shared/hooks/useAuth";

// API
import { schedulesAPI } from "../api/schedules.api";

export const schedulesKeys = createQueryKeys("schedules");

/**
 * Schedules are read by scope (a class, a class+day, a subject, or "today"),
 * not as a single paginated list — so the keys extend from `all` rather than
 * using the factory's `list()` helper.
 */
export const schedulesQueries = {
  /** Full week schedule for one class → array of day-schedules. */
  byClass: (classId) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "class", classId],
      queryFn: () => schedulesAPI.getByClass(classId).then((r) => r.data.data),
      enabled: Boolean(classId),
    }),
  /** One day's schedule for a class. */
  byDay: (classId, day) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "class", classId, "day", day],
      queryFn: () =>
        schedulesAPI.getByDay(classId, day).then((r) => r.data.data),
      enabled: Boolean(classId) && Boolean(day),
    }),
  /** Every schedule that includes a given subject. */
  bySubject: (subjectId) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "subject", subjectId],
      queryFn: () =>
        schedulesAPI.getBySubject(subjectId).then((r) => r.data.data),
      enabled: Boolean(subjectId),
    }),
  /** The signed-in teacher's lessons for today. */
  myToday: () =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "my-today"],
      queryFn: () => schedulesAPI.getMyToday().then((r) => r.data.data),
    }),
  /** All lessons scheduled for today (owner-facing overview). */
  allToday: () =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "all-today"],
      queryFn: () => schedulesAPI.getAllToday().then((r) => r.data.data),
    }),
};

/**
 * Full week schedule for a single class.
 *
 * @example
 * const { data: schedules = [] } = useClassSchedule(selectedClass);
 */
export const useClassSchedule = (classId) =>
  useQuery(schedulesQueries.byClass(classId));

/**
 * The signed-in teacher's lessons for today.
 *
 * @example
 * const { data: lessons = [] } = useMyTodaySchedule();
 */
export const useMyTodaySchedule = () => useQuery(schedulesQueries.myToday());

/**
 * All of today's lessons — owner-gated, mirrors the owner-only "all-today"
 * endpoint.
 *
 * @example
 * const { data: lessons = [] } = useAllTodaySchedule();
 */
export const useAllTodaySchedule = () => {
  const { user } = useAuth();
  return useQuery({
    ...schedulesQueries.allToday(),
    enabled: user?.role === "owner",
  });
};
