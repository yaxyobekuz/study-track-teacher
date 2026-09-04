// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { profileAPI } from "../api/profile.api";

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
