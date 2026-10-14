// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { selfTasksAPI } from "../api/selfTasks.api";

/**
 * O'ZIM BELGILAGAN ISHLAR — o'z namespace'i.
 *
 * ⚠️ `["tasks"]` DAN ALOHIDA: server tomonda ikki oqim bir jadvalda
 * yashaydi, lekin ro'yxatlari aralashmaydi (`self_assigned`) — kesh ham
 * shunday. Bitta namespace bo'lsa, rahbar bergan topshiriqni topshirish
 * shaxsiy ro'yxatni ham qaytadan yuklab turardi.
 */
export const selfTasksKeys = createQueryKeys("selfTasks");

export const selfTasksQueries = {
  /**
   * O'z ro'yxati. Kesim SERVERDA (`state`): sahifalangan ro'yxatni
   * xotirada filtrlash ikkinchi sahifadagi ishni "yo'q" qilib ko'rsatardi.
   *
   * Javobda `submissionRules` ham keladi — yakunlash oynasi uchun
   * ikkinchi so'rov kerak emas.
   */
  my: ({ page = 1, state = "all" } = {}) =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "my", page, state],
      queryFn: () => {
        const params = { page, limit: 20, sort: "due_asc" };
        if (state !== "all") params.state = state;
        return selfTasksAPI.getMy(params).then((r) => r.data);
      },
      placeholderData: keepPreviousData,
      // Vaqt oynasi jonli — uzoq kesh "hozir vaqti" belgisini eskirtirardi
      staleTime: 30 * 1000,
    }),

  /** Ro'yxat tepasidagi hisoblagichlar. */
  stats: () =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "stats"],
      queryFn: () => selfTasksAPI.getStats().then((r) => r.data.data),
      staleTime: 30 * 1000,
    }),

  /** O'zining doimiy (takrorlanuvchi) ishlari. */
  rules: ({ status = "active" } = {}) =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "rules", status],
      queryFn: () => selfTasksAPI.getMyRules({ limit: 50, status }).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
