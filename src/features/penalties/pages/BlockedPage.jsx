// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

/**
 * BlockedPage - Teacher platformadan bloklanganda ko'rsatiladigan sahifa.
 * penaltyPoints >= 12 bo'lganda DashboardLayout ichida render qilinadi.
 * @returns {JSX.Element}
 */
const BlockedPage = () => {
  const { user, logout } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ["penalties", "settings"],
    queryFn: () => penaltiesAPI.getSettings().then((res) => res.data.data),
  });

  const fineAmount = settings?.teacherFineAmount;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-5">
          <span className="text-3xl">🚫</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Hisobingiz bloklandi
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6">
          Sizning jarima balingiz{" "}
          <span className="font-semibold text-red-600">
            {user?.penaltyPoints} ball
          </span>{" "}
          ga yetdi. 12 va undan yuqori ball olganda platforma funksiyalari
          bloklanadi.
        </p>

        {/* Fine info */}
        {fineAmount !== undefined && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-6 text-left">
            <p className="text-xs text-red-500 font-medium mb-1">
              Jarima miqdori
            </p>
            <p className="text-lg font-bold text-red-700">
              {fineAmount.toLocaleString("uz-UZ")} so'm
            </p>
          </div>
        )}

        {/* Contact */}
        <p className="text-sm text-gray-500 mb-6">
          Blokdan chiqish uchun rahbariyat bilan bog'laning.
        </p>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
        >
          Chiqish
        </button>
      </div>
    </div>
  );
};

export default BlockedPage;
