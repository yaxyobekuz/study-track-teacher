// React
import { useState } from "react";

// Router
import { Link } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Data
import { taskStatusLabels, taskStatusColors, taskStatusOptions } from "../data/tasks.data";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";

const MyTasksPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "my", page, statusFilter],
    queryFn: () => {
      const params = { page, limit: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      return tasksAPI.getMy(params).then((res) => res.data);
    },
  });

  const tasks = data?.data || [];
  const pagination = data?.pagination;

  const isOverdue = (dueDate, status) => {
    if (["completed", "stopped"].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-800">Topshiriqlarim</h1>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {taskStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Card className="text-center py-10 text-gray-400">Yuklanmoqda...</Card>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-10 text-gray-400">
          Topshiriqlar topilmadi
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3">Sarlavha</th>
                  <th className="text-left py-2.5 px-3">Ijro muddati</th>
                  <th className="text-center py-2.5 px-3">Jarima bali</th>
                  <th className="text-center py-2.5 px-3">Status</th>
                  <th className="text-center py-2.5 px-3">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-2.5 px-3">
                      <p className="max-w-52 truncate text-gray-800">{task.title}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={isOverdue(task.dueDate, task.status) ? "text-red-600 font-medium" : "text-gray-600"}>
                        {formatUzDate(task.dueDate)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600">
                        {task.penaltyPoints} ball
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${taskStatusColors[task.status]}`}>
                        {taskStatusLabels[task.status]}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Batafsil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Oldingi
          </button>
          <span className="text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Keyingi
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
