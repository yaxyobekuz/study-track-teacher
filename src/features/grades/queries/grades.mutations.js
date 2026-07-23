// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { gradesAPI } from "../api/grades.api";
import { gradesKeys } from "./grades.queries";

/**
 * Create a grade for a student.
 * Invalidates every grades read (students-with-grades + class/date table).
 */
export const useCreateGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => gradesAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gradesKeys.all }),
  });
};

/** Update an existing grade. */
export const useUpdateGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => gradesAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gradesKeys.all }),
  });
};

/** Delete a grade. */
export const useDeleteGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => gradesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gradesKeys.all }),
  });
};
