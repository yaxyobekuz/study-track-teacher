// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { schedulesAPI } from "../api/schedules.api";
import { schedulesKeys } from "./schedules.queries";

/**
 * Create or update a day's schedule for a class. The endpoint upserts, so a
 * single hook covers both the "createSchedule" and "editSchedule" flows.
 */
export const useSaveSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => schedulesAPI.createOrUpdate(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};

/** Bump the current topic number for a class+subject pair. */
export const useUpdateCurrentTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, subjectId, topicNumber }) =>
      schedulesAPI
        .updateCurrentTopic(classId, subjectId, topicNumber)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};

/** Delete a day's schedule. */
export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => schedulesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};
