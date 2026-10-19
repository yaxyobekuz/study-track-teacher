// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { certificatesAPI } from "../api/certificates.api";

// Keys
import { certificatesKeys } from "./certificates.queries";

/**
 * TYUTOR REJANI TAHRIRLAYDI — muddat va yo'nalish.
 *
 * ⚠️ Optimistik YANGILANMAYDI va ro'yxat qayta so'raladi: yo'nalish
 * o'zgarganda server ESKI qatorni almashtirib YANGI qator yozadi (id
 * boshqa bo'ladi) va mavzu progressi ham qayta hisoblanadi. Ekranda
 * taxmin qilib ko'rsatilsa, u serverdagi haqiqatdan ajralib qolardi.
 */
export const useUpdateTutorCertificatePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, ...payload }) =>
      certificatesAPI.updatePlan(planId, payload).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [...certificatesKeys.all, "group"] }),
  });
};
