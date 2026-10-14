// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { CircleCheckBig, CircleX, Hourglass, ListChecks, Plus } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useNow from "@/features/tasks/hooks/useNow";

// Queries
import { selfTasksQueries } from "../queries/selfTasks.queries";

// Data
import { SELF_TASK_FILTERS } from "../data/selfTasks.data";

// Components
import Card from "@/shared/components/ui/Card";
import SelfTaskCard from "../components/SelfTaskCard";
import SelfRulesList from "../components/SelfRulesList";
import CreateSelfTaskModal from "../components/CreateSelfTaskModal";
import EditSelfTaskModal from "../components/EditSelfTaskModal";
import SelfTaskStopModal from "../components/SelfTaskStopModal";
import SelfTaskDeleteModal from "../components/SelfTaskDeleteModal";
import SelfTaskCompleteModal from "../components/SelfTaskCompleteModal";
import SelfTaskDeadlineModal from "../components/SelfTaskDeadlineModal";

// Utils
import { cn } from "@/shared/utils/cn";

const STAT_CARDS = [
  { key: "inProgress", label: "Jarayonda", icon: Hourglass, tone: "text-blue-600" },
  { key: "missed", label: "Bajarilmadi", icon: CircleX, tone: "text-red-600" },
  { key: "completed", label: "Bajarildi", icon: CircleCheckBig, tone: "text-green-600" },
  { key: "total", label: "Jami", icon: ListChecks, tone: "text-gray-700" },
];

/**
 * O'ZIM BELGILAGAN ISHLAR.
 *
 * ⚠️ "MENGA BERILGAN" DAN ALOHIDA TAB va bu ataylab: ikkalasi boshqa
 * savolga javob beradi — "menga kim nima berdi" va "men o'zimga nima
 * belgiladim". Bir ro'yxatda aralashsa, jarimasiz shaxsiy reja rahbar
 * bergan ish bilan bir xil ko'rinib, "buni kim so'radi" degan savol
 * javobsiz qolardi (server tomonda ham ikki oqim alohida —
 * `self_assigned`).
 *
 * ⚠️ IKKI BO'LIM: yuqorida ISHLAR, pastda DOIMIY ISHLAR (qoidalar).
 * Qoida — ish emas: undan ishlar avtomat yoziladi, shuning uchun u
 * yakunlanmaydi va alohida turadi.
 */
const MySelfTasks = () => {
  const now = useNow();
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery(selfTasksQueries.my({ page, state: filter }));
  const { data: stats } = useQuery(selfTasksQueries.stats());

  const tasks = data?.data || [];
  const pagination = data?.pagination;
  const submissionRules = data?.submissionRules;
  // Yaratish/tahrir formasining chegaralari — serverdan (`createRules`):
  // panel ularni taxmin qilmaydi
  const createRules = stats?.createRules;

  return (
    <div className="space-y-3.5">
      {/* Hisoblagichlar */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 xs:grid-cols-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="rounded-2xl bg-white p-3 ring-1 ring-gray-100">
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className={cn("size-3.5", tone)} />
                {label}
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900">
                {stats[key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Kesimlar + yaratish */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
          {SELF_TASK_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setFilter(item.value);
                setPage(1);
              }}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openModal("createSelfTask", { settings: createRules })}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"
        >
          <Plus className="size-4" />
          <span className="hidden xs:inline">O'zimga belgilash</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-gray-400">
          <ListChecks className="size-8" strokeWidth={1.5} />
          <p className="px-6 text-center text-sm">
            {filter === "all"
              ? "O'zingizga ish belgilamagansiz — jarima yo'q, tasdiqlash kutilmaydi"
              : "Bu kesim bo'yicha ish topilmadi"}
          </p>
          {filter === "all" && (
            <button
              type="button"
              onClick={() => openModal("createSelfTask", { settings: createRules })}
              className="mt-1 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white"
            >
              O'zimga belgilash
            </button>
          )}
        </Card>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <SelfTaskCard
              key={task.id}
              task={task}
              now={now}
              onComplete={(t) => openModal("completeSelfTask", { task: t, rules: submissionRules })}
              onEdit={(t) => openModal("editSelfTask", { task: t, settings: createRules })}
              onDeadline={(t, mode) => openModal("selfTaskDeadline", { task: t, mode })}
              onStop={(t) => openModal("stopSelfTask", { task: t })}
              onDelete={(t) => openModal("deleteSelfTask", { task: t })}
            />
          ))}
        </div>
      )}

      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50"
          >
            Oldingi
          </button>
          <span className="text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50"
          >
            Keyingi
          </button>
        </div>
      )}

      {/* Doimiy ishlar (qoidalar) */}
      <div className="border-t border-gray-100 pt-3.5">
        <SelfRulesList />
      </div>

      <CreateSelfTaskModal />
      <SelfTaskCompleteModal />
      <EditSelfTaskModal />
      <SelfTaskDeadlineModal />
      <SelfTaskStopModal />
      <SelfTaskDeleteModal />
    </div>
  );
};

export default MySelfTasks;
