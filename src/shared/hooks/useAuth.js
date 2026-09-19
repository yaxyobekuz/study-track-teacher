import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/features/auth/api/auth.api";
import { signOut } from "@/features/auth/lib/session";

const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
    enabled: Boolean(localStorage.getItem("authToken")),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAuthenticated = Boolean(localStorage.getItem("authToken")) && Boolean(user);

  // ⚠️ Seans SERVERDA yopiladi (`signOut`) — aks holda u qurilmalar
  // limitidan bittasini egallab turardi
  const logout = async () => {
    await signOut();
    queryClient.clear();
    navigate("/login");
  };

  return { user, isAuthenticated, loading: isLoading, logout };
};

export default useAuth;
