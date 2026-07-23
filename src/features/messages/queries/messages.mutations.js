// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { messagesAPI } from "../api/messages.api";

// Keys
import { messagesKeys } from "./messages.queries";

/**
 * Queue a new message. Invalidates the whole feature (`all`) so BOTH the
 * received list and the teacher's own list refresh — mirrors the old
 * dual-store invalidation.
 */
export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => messagesAPI.send(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagesKeys.all }),
  });
};

/**
 * Cancel a pending message. Invalidates the whole feature (`all`) so both
 * lists reflect the new status.
 */
export const useCancelMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => messagesAPI.cancel(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messagesKeys.all }),
  });
};
