// TanStack Query
import { useMutation } from "@tanstack/react-query";

// API
import { authAPI } from "../api/auth.api";

/**
 * Qurilmalar limiti oynasidan davom etish: tanlangan seanslar yakunlanadi
 * va login javobi (`{ token, user, ... }`) qaytadi.
 *
 * ⚠️ Kesh eskirtirilmaydi — foydalanuvchi hali tizimga kirmagan, ya'ni
 * keshda bu hisobga tegishli hech narsa yo'q.
 */
export const useResolveSessionLimit = () =>
  useMutation({
    mutationFn: (data) =>
      authAPI.resolveSessionLimit(data).then((r) => r.data.data),
  });
