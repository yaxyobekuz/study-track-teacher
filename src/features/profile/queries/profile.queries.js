// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

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

  /** To'xtatilgan oyligim → `{ items, month, monthLabel }`. */
  suspensions: () =>
    queryOptions({
      queryKey: [...profileKeys.all, "suspensions"],
      queryFn: () => profileAPI.getSuspensions().then((r) => r.data.data),
    }),

  /** Ushlab qolishlarim → `{ items, totals: { withheld, currentMonth } }`. */
  deductions: () =>
    queryOptions({
      queryKey: [...profileKeys.all, "deductions"],
      queryFn: () => profileAPI.getDeductions().then((r) => r.data.data),
    }),

  /**
   * Dars soatim → shartnoma sharti, soat, jonli maosh, kesimlar, tarix.
   *
   * `params.month` berilmasa server joriy oyni oladi — oy tanlagich
   * bo'sh qiymat bilan ham ishlashi uchun.
   */
  hours: (params) =>
    queryOptions({
      queryKey: [...profileKeys.all, "hours", params],
      queryFn: () => profileAPI.getHours(params).then((r) => r.data.data),
      // ⚠️ Oy almashtirilganda ekran BO'SHAB QOLMASLIGI kerak: `params`
      // queryKey ichida, ya'ni har o'q bosilishi yangi so'rov. Ilgarigi
      // ma'lumot turmasa, butun tab skeletga tushib, sarlavhadagi oy nomi
      // ham yo'qolardi.
      placeholderData: keepPreviousData,
    }),

  /** O'rinbosarlik → `{ given, taken, ongoing }`. */
  substitutions: () =>
    queryOptions({
      queryKey: [...profileKeys.all, "substitutions"],
      queryFn: () => profileAPI.getSubstitutions().then((r) => r.data.data),
    }),
};
