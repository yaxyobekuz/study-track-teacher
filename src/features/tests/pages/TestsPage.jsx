// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link } from "react-router-dom";

// Icons
import { Plus, ChevronRight, Search } from "lucide-react";

// API
import { testsAPI } from "../api/tests.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Testlar ro'yxati (V3) - mavsumdan mustaqil.
 * Qatorga bosish → Test Detail sahifasiga.
 */
const TestsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tests", { page, search }],
    queryFn: () =>
      testsAPI
        .getAll({ page, limit: 20, ...(search ? { search } : {}) })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const tests = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold text-gray-900">Testlar</h1>
        <Link to="/tests/create">
          <Button className="gap-2">
            <Plus />
            Yangi test
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2">
          <Search className="text-gray-400 shrink-0" />
          <InputField
            name="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Test nomi bo'yicha qidirish..."
            className="flex-1"
          />
        </div>
      </Card>

      {/* Ro'yxat */}
      {isLoading ? (
        <Card>
          <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
        </Card>
      ) : tests.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-10">
            Testlar yo'q. Yangi test yarating.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <Link key={test._id} to={`/tests/${test._id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-gray-900">
                      {test.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {test.questionCount} savol · {test.timeLimitMinutes}{" "}
                      daqiqa
                      {test.questionCountActual !== undefined && (
                        <>
                          {" · "}
                          {test.questionCountActual} ta savol qo'shilgan
                        </>
                      )}
                      {test.bindingCount > 0 && (
                        <> · {test.bindingCount} ta biriktiruv</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateUZ(test.createdAt)}
                    </p>
                  </div>

                  <ChevronRight size={20} className="text-gray-400 shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Sahifalash */}
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

export default TestsPage;
