// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronRight, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { GROUP_STATUS_META } from "../data/tutorGroups.data";
import { tutorGroupsQueries } from "../queries/tutorGroups.queries";

/**
 * GURUHLARIM — tyutorga biriktirilgan sinflar va har biri uchun qo'shimcha
 * oylik. Guruh bosilsa o'quvchilar, davomat va baholar ochiladi.
 *
 * Summa serverdan tayyor keladi: bu yerda arifmetika yo'q.
 */
const MyTutorGroupsPage = () => {
  const { data, isLoading, isError } = useQuery(tutorGroupsQueries.my());

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (isError || !data) {
    return (
      <Card className="text-center">
        <p className="text-sm text-red-500">Guruhlarni yuklab bo'lmadi</p>
      </Card>
    );
  }

  const { groups, totals } = data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Guruhlarim</h1>
        {totals.groupCount > 0 && (
          <p className="text-sm text-gray-500">
            {data.monthLabel}: {totals.groupCount} ta guruh, {totals.studentCount} ta
            o'quvchi · qo'shimcha oylik {formatMoney(totals.monthlyAmount)}
          </p>
        )}
      </div>

      {groups.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Users}
            title="Sizga guruh biriktirilmagan"
            description="Guruh (sinf) tyutorga admin panelda biriktiriladi. Biriktirilgach, o'quvchilar, davomat va baholar shu yerda ko'rinadi."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {groups.map((group) => {
            const status = GROUP_STATUS_META[group.status];

            return (
              <Link
                key={group.id}
                to={`/tutor-groups/${group.id}`}
                className="group rounded-2xl bg-white p-4 transition-shadow hover:shadow-md xs:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{group.className}</h2>
                      {status && (
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", status.className)}>
                          {status.label}
                        </span>
                      )}
                    </div>

                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="size-4" strokeWidth={1.75} />
                      {group.studentCount} ta o'quvchi
                    </p>

                    <p className="text-xs text-gray-400">{group.periodLabel}</p>
                  </div>

                  <ChevronRight
                    className="mt-1 size-5 shrink-0 text-gray-300 group-hover:text-gray-500"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="mt-3 flex items-end justify-between gap-3 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500">
                    {group.studentCount} × {formatMoney(group.perStudentAmount)}
                    {" + "}guruh uchun {formatMoney(group.groupAmount)}
                  </p>
                  <p className="shrink-0 font-semibold text-gray-900">
                    {formatMoney(group.monthlyAmount)}
                    <span className="text-xs font-normal text-gray-400"> / oy</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTutorGroupsPage;
