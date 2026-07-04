// Toaster
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { attendanceAPI } from "../api/attendance.api";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Data
import {
  EXCUSE_TYPE_LABELS,
  EXCUSE_STATUS_LABELS,
  EXCUSE_STATUS_COLORS,
} from "../data/attendance.data";

const MyExcusesList = () => {
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "myExcuses"],
    queryFn: () =>
      attendanceAPI.getMyExcuses({ limit: 20 }).then((r) => r.data.data),
  });

  const excuses = data || [];

  const handleCancel = (id) => {
    if (!window.confirm("So'rovni bekor qilmoqchimisiz?")) return;

    setCancelingId(id);
    attendanceAPI
      .cancelExcuseRequest(id)
      .then(() => {
        toast.success("So'rov bekor qilindi");
        queryClient.invalidateQueries({ queryKey: ["attendance", "myExcuses"] });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setCancelingId(null));
  };

  return (
    <Card title="Mening uzrli so'rovlarim">
      <div className="mt-3 flex flex-col gap-2">
        {isLoading && (
          <p className="py-6 text-center text-sm text-gray-400">
            Yuklanmoqda...
          </p>
        )}

        {!isLoading && excuses.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            Hali uzrli so'rov yuborilmagan
          </p>
        )}

        {excuses.map((ex) => (
          <div
            key={ex._id}
            className="rounded-xl border border-gray-100 p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-800">
                {formatUzDate(ex.date)}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {EXCUSE_TYPE_LABELS[ex.type] || ex.type}
                </span>
              </p>

              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  EXCUSE_STATUS_COLORS[ex.status]
                }`}
              >
                {EXCUSE_STATUS_LABELS[ex.status]}
              </span>
            </div>

            <p className="text-sm font-medium text-gray-700">
              {ex.absenceReason?.title || "-"}
            </p>

            {ex.reason && <p className="text-sm text-gray-500">{ex.reason}</p>}

            {ex.status === "rejected" && ex.rejectionReason && (
              <p className="text-xs text-red-600">
                Rad etish sababi: {ex.rejectionReason}
              </p>
            )}

            {ex.status === "pending" && (
              <Button
                size="sm"
                variant="danger"
                disabled={cancelingId === ex._id}
                onClick={() => handleCancel(ex._id)}
              >
                Bekor qilish{cancelingId === ex._id && "..."}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MyExcusesList;
