// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { studentAttendanceAPI } from "../api/studentAttendance.api";
import { studentAttendanceKeys } from "./studentAttendance.queries";

/**
 * Davomatni saqlash.
 *
 * Butun bo'lim eskirtiriladi: sinf ro'yxati ham, sinf kartalaridagi
 * "nechtasi belgilandi" sanog'i ham bitta saqlashdan keyin o'zgaradi.
 */
export const useMarkStudentAttendance = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => studentAttendanceAPI.mark(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: studentAttendanceKeys.all }),
  });
};
