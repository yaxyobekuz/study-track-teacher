// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import useAuth from "@/shared/hooks/useAuth";

// API
import { usersAPI } from "../api/users.api";

export const usersKeys = createQueryKeys("users");

export const usersQueries = {
  /**
   * All users, short form (id, fullName, role, …). Ungated reference list for
   * pickers that must work for any authenticated user. Filter by role
   * client-side where needed.
   */
  allShort: () =>
    queryOptions({
      queryKey: [...usersKeys.all, "all-short"],
      queryFn: () => usersAPI.getAllShort().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),
};

/**
 * Teachers list, owner-gated (mirrors the old owner-only teachers preload).
 *
 * @example
 * const { data: teachers = [] } = useTeachers();
 */
export const useTeachers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...usersKeys.all, "teachers"],
    queryFn: () =>
      usersAPI.getAll({ role: "teacher", limit: 200 }).then((r) => r.data.data),
    enabled: user?.role === "owner",
    staleTime: 10 * 60 * 1000,
  });
};
