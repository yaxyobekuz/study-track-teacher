// Router
import { Navigate, useLocation } from "react-router-dom";

// Hooks & data
import useAuth from "@/shared/hooks/useAuth";
import usePermissions from "@/shared/hooks/usePermissions";
import { permissionForPath } from "@/features/permissions/data/permissions.data";

/**
 * Joriy sahifa uchun ruxsatni tekshiradi (to'g'ridan-to'g'ri URL kirishidan
 * himoya). Ruxsat bo'lmasa bosh sahifaga yo'naltiradi. Owner har doim o'tadi.
 *
 * Ruxsat talab qilmaydigan sahifalar (`permissionForPath` → `null`) avvalgidek
 * ochiq qoladi — bu qatlam faqat ruxsat bilan ochiladigan bo'limlarga
 * (inventar) tegadi. Server ham har so'rovda tekshiradi (ikki qavatli).
 */
const PermissionGuard = ({ children }) => {
  const location = useLocation();
  const { loading } = useAuth();
  const { can } = usePermissions();

  // Foydalanuvchi hali yuklanmagan bo'lsa yo'naltirmaymiz (AuthGuard yuqorida
  // loader ko'rsatadi) — noto'g'ri redirectning oldini oladi.
  if (loading) return children;

  const requiredPermission = permissionForPath(location.pathname);

  if (!can(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PermissionGuard;
