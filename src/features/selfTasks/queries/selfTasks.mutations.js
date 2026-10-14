// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { selfTasksAPI } from "../api/selfTasks.api";

// Keys
import { selfTasksKeys } from "./selfTasks.queries";

/**
 * ⚠️ Har qanday o'zgarish `selfTasksKeys.all` bo'yicha eskiradi: ro'yxat,
 * hisoblagichlar va doimiy ishlar bir manbadan o'qiydi.
 *
 * ⚠️ Rahbar bergan topshiriqlar keshiga (`["tasks"]`) TEGILMAYDI.
 */
const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: selfTasksKeys.all });
};

export const useCreateSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (formData) => selfTasksAPI.create(formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useCreateSelfRule = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (formData) => selfTasksAPI.createRule(formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Yakunlash — darhol "Bajarildi". @example complete({ id, formData }) */
export const useCompleteSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, formData }) => selfTasksAPI.complete(id, formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** @example update({ id, formData }) */
export const useUpdateSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, formData }) => selfTasksAPI.update(id, formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** @example extend({ id, data }) */
export const useExtendSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.extend(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** @example stop({ id, data }) */
export const useStopSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.stop(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** @example reopen({ id, data }) */
export const useReopenSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.reopen(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useDeleteSelfTask = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => selfTasksAPI.remove(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};

// ─── Doimiy ish qoidasi ───────────────────────────────────────────

/** @example stopRule({ id, data }) */
export const useStopSelfRule = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.stopRule(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useResumeSelfRule = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => selfTasksAPI.resumeRule(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useDeleteSelfRule = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => selfTasksAPI.removeRule(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};
