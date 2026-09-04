// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { profileAPI } from "../api/profile.api";

export const profileKeys = createQueryKeys("profile");

export const profileQueries = {
  /** Haftalik dars yuklamam → `{ teacher, totals, days, classes, salary }`. */
  workload: () =>
    queryOptions({
      queryKey: [...profileKeys.all, "workload"],
      queryFn: () => profileAPI.getWorkload().then((r) => r.data.data),
    }),

  /** Oylik qoidam → `{ current, items, currentMonth, currentMonthLabel }`. */
  salary: () =>
    queryOptions({
      queryKey: [...profileKeys.all, "salary"],
      queryFn: () => profileAPI.getSalary().then((r) => r.data.data),
    }),

  /** Oylik majburiyatlarim → `{ totals, items }`. */
  payroll: () =>
    queryOptions({
      queryKey: [...profileKeys.all, "payroll"],
      queryFn: () => profileAPI.getPayroll().then((r) => r.data.data),
    }),
};
