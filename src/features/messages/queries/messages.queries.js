// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { messagesAPI } from "../api/messages.api";

export const messagesKeys = createQueryKeys("messages");

export const messagesQueries = {
  /**
   * Received messages list (owner/school-wide view). Paginated
   * `{ data, pagination }`; keeps the previous page while the next loads.
   */
  list: (params) =>
    queryOptions({
      queryKey: messagesKeys.list(params),
      queryFn: () => messagesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * The current teacher's own sent messages. Same endpoint (the server scopes
   * by the authenticated user), but a distinct cache branch so the two lists
   * don't collide. Paginated `{ data, pagination }` with keepPreviousData.
   */
  teacherList: (params) =>
    queryOptions({
      queryKey: [...messagesKeys.all, "teacher", "list", params],
      queryFn: () => messagesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** A single message with its delivery breakdown (details modal). */
  detail: (id) =>
    queryOptions({
      queryKey: messagesKeys.detail(id),
      queryFn: () => messagesAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),
};
