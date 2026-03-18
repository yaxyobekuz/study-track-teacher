// React
import { useState, useEffect, useCallback } from "react";

// Toast
import { toast } from "sonner";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";

// Data
import {
  penaltyStatusLabels,
  penaltyStatusColors,
} from "../data/penalties.data";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/features/auth/api/auth.api";

const MyPenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPenalties = useCallback(() => {
    setLoading(true);
    penaltiesAPI
      .getMyPenalties({ page, limit: 20 })
      .then((res) => {
        setPenalties(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch(() => toast.error("Jarimalarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchPenalties();
  }, [fetchPenalties]);

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      <Card className="flex items-center gap-3.5 mb-4 !py-3">
        <h2 className="text-xl font-bold text-gray-900">Mening jarimalarim</h2>
        <p className="text-lg font-bold text-red-500">{user.penaltyPoints}</p>
      </Card>

      {loading ? (
        <Card>
          <p className="text-sm text-gray-500 text-center py-8">
            Yuklanmoqda...
          </p>
        </Card>
      ) : penalties.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500 text-center py-8">
            Jarimalar topilmadi
          </p>
        </Card>
      ) : (
        <Card className="">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2.5 px-3.5 font-medium">Sabab</th>
                  <th className="text-left py-2.5 px-3.5 font-medium">Ball</th>
                  <th className="text-left py-2.5 px-3.5 font-medium">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-3.5 font-medium">Sana</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((penalty) => (
                  <tr key={penalty._id}>
                    <td className="text-left py-2.5 px-3.5">
                      <p className="font-medium">{penalty.title}</p>
                      {penalty.description && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {penalty.description}
                        </p>
                      )}
                    </td>
                    <td className="text-left py-2.5 px-3.5 font-semibold">
                      <span
                        className={
                          penalty.type === "reduction"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {penalty.type === "reduction" ? "-" : "+"}
                        {penalty.points}
                      </span>
                    </td>
                    <td className="text-left py-2.5 px-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${penaltyStatusColors[penalty.status]}`}
                      >
                        {penaltyStatusLabels[penalty.status]}
                      </span>
                    </td>
                    <td className="text-left py-2.5 px-3.5 text-gray-500">
                      {formatDateUZ(penalty.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="neutral"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3"
              >
                Oldingi
              </Button>
              <span className="flex items-center text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <Button
                variant="neutral"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3"
              >
                Keyingi
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default MyPenaltiesPage;
