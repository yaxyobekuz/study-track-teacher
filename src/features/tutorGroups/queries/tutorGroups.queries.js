// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { tutorGroupsAPI } from "../api/tutorGroups.api";

export const tutorGroupsKeys = createQueryKeys("tutorGroups");

export const tutorGroupsQueries = {
  /** O'z guruhlarim: amaldagi va rejadagilari, joriy oy jami. */
  my: () =>
    queryOptions({
      queryKey: [...tutorGroupsKeys.all, "my"],
      queryFn: () => tutorGroupsAPI.getMy().then((r) => r.data.data),
    }),

  /** Guruh manzarasi: o'quvchilar, davomat, baholar, qo'shimcha oylik. */
  overview: (id, month) =>
    queryOptions({
      queryKey: [...tutorGroupsKeys.detail(id), "overview", month ?? null],
      queryFn: () =>
        tutorGroupsAPI
          .getMyOverview(id, month ? { month } : undefined)
          .then((r) => r.data.data),
      enabled: Boolean(id),
      placeholderData: keepPreviousData,
    }),
};
