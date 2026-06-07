// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Award, ArrowUpDown } from "lucide-react";

// API
import { testResultsAPI } from "@/features/grading/api/testResults.api";

// Data
import {
  RESULT_STATUS_LABELS,
  RESULT_STATUS_COLORS,
} from "@/features/grading/data/resultStatuses.data";

// Components
import Card from "@/shared/components/ui/Card";
import Pagination from "@/shared/components/ui/Pagination";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Tab 3: Natijalar - jadval, ball bo'yicha sortable.
 */
const ResultsTab = ({ test }) => {
  const [page, setPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["test-results", "by-test", test._id, { page }],
    queryFn: () =>
      testResultsAPI
        .getByTest(test._id, { page, limit: 30 })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const results = data?.data || [];
  const pagination = data?.pagination;

  // Klient tomonda saralash (server allaqachon finalScore: -1 qaytaradi)
  const sorted = [...results].sort((a, b) =>
    sortDesc ? b.finalScore - a.finalScore : a.finalScore - b.finalScore,
  );

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Award size={40} className="text-gray-300" />
          <p className="mt-3 text-gray-600">Hali natijalar yo'q.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 px-3 font-medium w-12">#</th>
                <th className="py-2 px-3 font-medium">O'quvchi</th>
                <th className="py-2 px-3 font-medium">Urinish</th>
                <th
                  className="py-2 px-3 font-medium cursor-pointer hover:text-blue-700"
                  onClick={() => setSortDesc(!sortDesc)}
                >
                  <span className="inline-flex items-center gap-1">
                    Ball
                    <ArrowUpDown size={14} />
                  </span>
                </th>
                <th className="py-2 px-3 font-medium">Holat</th>
                <th className="py-2 px-3 font-medium">Sana</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, idx) => (
                <tr
                  key={r._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 text-gray-900 font-medium">
                    {r.student?.firstName} {r.student?.lastName}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    #{r.session?.attemptNumber || 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-700">
                    {r.finalScore}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-medium",
                        RESULT_STATUS_COLORS[r.status] || "bg-gray-100",
                      )}
                    >
                      {RESULT_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 text-xs">
                    {formatDateUZ(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ResultsTab;
