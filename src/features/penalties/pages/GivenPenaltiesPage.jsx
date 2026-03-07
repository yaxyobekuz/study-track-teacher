// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

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

// Hooks
import { useState } from "react";

const GivenPenaltiesPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["penalties", "given", page],
    queryFn: () =>
      penaltiesAPI
        .getGivenPenalties({ page, limit: 20 })
        .then((res) => res.data),
    onError: () => toast.error("Jarimalarni yuklashda xatolik"),
  });

  const penalties = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div>
      <Card className="mb-4 !py-3">
        <h2 className="text-xl font-bold text-gray-900">Bergan jarimalarim</h2>
      </Card>

      {isLoading ? (
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
                  <th className="text-left py-2.5 px-3.5 font-medium">
                    O'quvchi
                  </th>
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
                      <p className="font-medium">
                        {penalty.user?.firstName} {penalty.user?.lastName}
                      </p>
                      {penalty.user?.username && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          @{penalty.user.username}
                        </p>
                      )}
                    </td>
                    <td className="text-left py-2.5 px-3.5">
                      <p className="font-medium">{penalty.title}</p>
                      {penalty.description && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {penalty.description}
                        </p>
                      )}
                    </td>
                    <td className="text-left py-2.5 px-3.5 font-semibold text-red-600">
                      {penalty.points}
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

export default GivenPenaltiesPage;
