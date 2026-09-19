// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { profileAPI } from "../api/profile.api";

// Queries
import { profileQueries } from "./profile.queries";

/**
 * Ism, login va parolni yangilash.
 *
 * Muvaffaqiyatdan keyin `auth/me` eskirtiriladi: yon menyudagi ism va
 * profil sarlavhasi shu so'rovdan o'qiladi.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => profileAPI.update(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
};

/**
 * Bitta qurilmadagi seansni yakunlash. Muvaffaqiyatdan keyin qurilmalar
 * ro'yxati qayta o'qiladi.
 */
export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => profileAPI.terminateSession(id).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileQueries.sessions().queryKey }),
  });
};

/** Shu qurilmadan boshqa hamma seanslarni yakunlash. */
export const useTerminateOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileAPI.terminateOtherSessions().then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileQueries.sessions().queryKey }),
  });
};
