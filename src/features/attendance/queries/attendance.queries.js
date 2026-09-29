// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { attendanceAPI } from "../api/attendance.api";

/**
 * ⚠️ `["attendance"]` ildizi — sahifadagi eski kalitlar (`["attendance",
 * "today"]`, `["attendance", "my-schedule"]`) bilan bir daraxt: `all`
 * bilan eskirtirilsa hammasi birga yangilanadi.
 */
export const attendanceKeys = createQueryKeys("attendance");

export const checkoutReadinessKey = [...attendanceKeys.all, "checkout-readiness"];

export const attendanceQueries = {
  /**
   * "Men ketdim" oynasidagi bugungi ishlar → `{ applies, ready, canCheckOut,
   * grades, tasks, blockers, request }`.
   *
   * Baho boshqa sahifada qo'yiladi, rahbar qarori boshqa odamdan keladi —
   * shuning uchun har ochilganda qayta so'raladi, so'rov javob kutayotganda
   * esa tez-tez (panel ochiq turganda ruxsat o'zi ko'rinsin).
   */
  checkoutReadiness: () =>
    queryOptions({
      queryKey: checkoutReadinessKey,
      queryFn: () => attendanceAPI.getCheckoutReadiness().then((r) => r.data.data),
      refetchOnMount: "always",
      refetchInterval: (query) =>
        query.state.data?.request?.status === "pending" ? 15 * 1000 : 60 * 1000,
    }),
};
