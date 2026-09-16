// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Icons
import { FileText, Paperclip } from "lucide-react";

// API
import { salaryRequestsAPI } from "../api/salaryRequests.api";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";

// Data
import {
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from "../data/salaryRequests.data";

const MyRequestsList = () => {
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["salaryRequests", "mine"],
    queryFn: () => salaryRequestsAPI.getMine().then((r) => r.data.data),
  });

  const requests = data || [];

  const handleCancel = (id) => {
    if (!window.confirm("So'rovni bekor qilmoqchimisiz?")) return;
    setCancelingId(id);
    salaryRequestsAPI
      .cancel(id)
      .then(() => {
        toast.success("So'rov bekor qilindi");
        queryClient.invalidateQueries({ queryKey: ["salaryRequests", "mine"] });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"))
      .finally(() => setCancelingId(null));
  };

  return (
    <Card title="Mening so'rovlarim">
      <div className="mt-3 flex flex-col gap-2">
        {isLoading && (
          <p className="py-6 text-center text-sm text-gray-400">Yuklanmoqda...</p>
        )}

        {!isLoading && requests.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            Hali so'rov yuborilmagan
          </p>
        )}

        {requests.map((r) => (
          <div key={r.id} className="space-y-1.5 rounded-xl border border-gray-100 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                <FileText className="size-4 text-gray-400" />
                {REQUEST_TYPE_LABELS[r.kind] || r.kind}
              </p>
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${REQUEST_STATUS_COLORS[r.status]}`}
              >
                {REQUEST_STATUS_LABELS[r.status]}
              </span>
            </div>

            {/* Toifa zayavkasi — so'ralgan toifa */}
            {r.kind === "category" && r.requestedCategoryName && (
              <p className="text-sm text-gray-600">
                So'ralgan toifa: <b>{r.requestedCategoryName}</b>
              </p>
            )}

            {/* Ustama zayavkasi — nomi va qiymati */}
            {r.kind === "bonus" && r.bonusValue && (
              <p className="text-sm text-gray-600">
                {r.bonusLabel || "Ustama"}:{" "}
                <b>
                  {r.bonusType === "percent"
                    ? `${Number(r.bonusValue)}%`
                    : `${Number(r.bonusValue).toLocaleString("uz-UZ")} so'm`}
                </b>
              </p>
            )}

            {r.reason && <p className="text-sm text-gray-500">{r.reason}</p>}

            {r.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {r.attachments.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs text-blue-600 hover:bg-gray-100"
                  >
                    <Paperclip className="size-3" />
                    {a.originalName || `Hujjat ${i + 1}`}
                  </a>
                ))}
              </div>
            )}

            {r.status === "rejected" && r.rejectionReason && (
              <p className="text-xs text-red-600">Rad etish sababi: {r.rejectionReason}</p>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs text-gray-400">{formatDateTimeUz(r.createdAt)}</span>
              {r.status === "pending" && (
                <Button
                  size="sm"
                  variant="danger"
                  disabled={cancelingId === r.id}
                  onClick={() => handleCancel(r.id)}
                >
                  {cancelingId === r.id ? "..." : "Bekor qilish"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MyRequestsList;
