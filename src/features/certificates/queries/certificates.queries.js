// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { certificatesAPI } from "../api/certificates.api";

export const certificatesKeys = createQueryKeys("certificates");

export const certificatesQueries = {
  /**
   * Guruhdagi o'quvchilar va ularning sertifikat rejalari.
   * Javobda `tracks` ham keladi — tanlagich uchun alohida so'rov kerak emas.
   */
  group: (classId) =>
    queryOptions({
      queryKey: [...certificatesKeys.all, "group", classId],
      queryFn: () => certificatesAPI.getGroup(classId).then((r) => r.data.data),
      enabled: Boolean(classId),
    }),
};
