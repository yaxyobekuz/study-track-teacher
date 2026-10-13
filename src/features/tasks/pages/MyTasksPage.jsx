// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Icons
import { ClipboardList, X } from "lucide-react";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Hooks
import useNow from "../hooks/useNow";

// Data
import { MY_TASK_FILTERS, resolveTimeState } from "../data/tasks.data";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";
import TaskCheckCard from "../components/TaskCheckCard";
import TaskSubmitForm from "../components/TaskSubmitForm";

const PAGE_LIMIT = 20;

/**
 * TOPSHIRIQLARIM — ijrochining asosiy ekrani.
 *
 * Har bir topshiriq yonida KATAKCHA turadi: ✓ bajarilgan, ✗ bajarilmagan
 * (muddat o'tdi-yu ish topshirilmadi), bo'sh — hali ishlanmoqda.
 *
 * ⚠️ Katakcha o'zi holatni o'zgartirmaydi — TOPSHIRISH oynasini ochadi:
 * ishni yakunlash uchun isbot (rasm, video yoki fayl) majburiy.
 *
 * ⚠️ Vaqt JONLI: "hozir bajarilish vaqti" belgisi oraliq boshlanganda
 * yonadi va tugaganda o'chadi (`useNow`) — sahifani yangilash shart emas.
 *
 * Kesim SERVERDA filtrlanadi (`state` parametri): sahifalangan ro'yxatni
 * xotirada filtrlash ikkinchi sahifadagi topshiriqni "yo'q" qilib
 * ko'rsatardi.
 */
const MyTasksPage = () => {
  const now = useNow();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "my", page, filter],
    queryFn: () => {
      const params = { page, limit: PAGE_LIMIT, sort: "due_asc" };
      if (filter !== "all") params.state = filter;
      return tasksAPI.getMy(params).then((res) => res.data);
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, formData }) => tasksAPI.submitCompletion(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const tasks = data?.data || [];
  const pagination = data?.pagination;
  // Yakunlash qoidalari ro'yxat bilan birga keladi (`getMyTasks`) —
  // topshirish oynasi uchun alohida so'rov shart emas
  const submissionRules = data?.submissionRules;

  // Jonli hisob: "hozir vaqti" belgisi ro'yxat tepasida ham ko'rinadi
  const activeCount = tasks.filter((t) => resolveTimeState(t, now) === "active").length;

  const handleSubmit = (formData, reset) => {
    submitMutation.mutate(
      { id: submitting.id, formData },
      {
        onSuccess: () => {
          setSubmitting(null);
          reset();
          toast.success("Ish tekshiruvga yuborildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Topshiriqlarim</h1>
          {activeCount > 0 && (
            <p className="mt-0.5 text-sm font-medium text-red-600">
              {activeCount} ta topshiriqning bajarilish vaqti — hozir
            </p>
          )}
        </div>
      </div>

      {/* Kesimlar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {MY_TASK_FILTERS.map((item) => (
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

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <ClipboardList className="size-8" strokeWidth={1.5} />
          <p className="text-sm">
            {filter === "all"
              ? "Sizda topshiriq yo'q"
              : "Bu kesim bo'yicha topshiriq topilmadi"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskCheckCard key={task.id} task={task} now={now} onSubmitClick={setSubmitting} />
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

      {/* Topshirish oynasi — ro'yxatdan chiqmasdan */}
      {submitting && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 xs:items-center xs:p-4"
          onClick={(e) => e.target === e.currentTarget && setSubmitting(null)}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 xs:rounded-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Ishni yakunlash</p>
                <p className="truncate font-semibold text-gray-900">{submitting.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitting(null)}
                aria-label="Yopish"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <TaskSubmitForm
              rules={submissionRules}
              isPending={submitMutation.isPending}
              onSubmit={handleSubmit}
              onCancel={() => setSubmitting(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
