// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { classesAPI } from "../api/classes.api";

export const classesKeys = createQueryKeys("classes");

/** Classes are reference data — they change rarely, so cache them longer. */
const REFERENCE_STALE_TIME = 10 * 60 * 1000;

export const classesQueries = {
  list: () =>
    queryOptions({
      queryKey: classesKeys.lists(),
      queryFn: () => classesAPI.getAll().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
  detail: (id) =>
    queryOptions({
      queryKey: classesKeys.detail(id),
      queryFn: () => classesAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),
};

/**
 * Shared classes list, available to every authenticated user.
 *
 * @example
 * const { data: classes = [] } = useClasses();
 */
export const useClasses = () => useQuery(classesQueries.list());
