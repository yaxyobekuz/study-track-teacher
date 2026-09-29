// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { attendanceAPI } from "../api/attendance.api";
import { checkoutReadinessKey } from "./attendance.queries";

/** Rahbariyatga "ishlar tugamay ketish" so'rovi. */
export const useCreateCheckoutRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      attendanceAPI.createCheckoutRequest(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: checkoutReadinessKey }),
  });
};

/** Kutilayotgan so'rovni bekor qilish. */
export const useCancelCheckoutRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      attendanceAPI.cancelCheckoutRequest(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: checkoutReadinessKey }),
  });
};
