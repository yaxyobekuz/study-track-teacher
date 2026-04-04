// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { useParams, useNavigate } from "react-router-dom";

// Icons
import { ArrowLeft } from "lucide-react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Data
import { taskStatusLabels, taskStatusColors, SUBMITTABLE_STATUSES } from "../data/tasks.data";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [note, setNote] = useState("");
  const [files, setFiles] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => tasksAPI.getById(taskId).then((res) => res.data.data),
  });

  const submitMutation = useMutation({
    mutationFn: (formData) => tasksAPI.submitCompletion(taskId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "my"] });
      setShowSubmitForm(false);
      setNote("");
      setFiles(null);
      toast.success("Topshiriq ko'rib chiqishga yuborildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (note) formData.append("note", note);
    if (files) {
      for (const file of files) formData.append("files", file);
    }
    submitMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!task) return null;

  const isOverdue =
    new Date(task.dueDate) < new Date() &&
    !["completed", "stopped"].includes(task.status);

  const canSubmit = SUBMITTABLE_STATUSES.includes(task.status);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Topshiriq tafsilotlari</h1>
        <span className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${taskStatusColors[task.status]}`}>
          {taskStatusLabels[task.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Asosiy ma'lumotlar</h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Sarlavha">
                <span className="font-medium">{task.title}</span>
              </InfoRow>
              <InfoRow label="Ijro muddati">
                <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                  {formatUzDate(task.dueDate)}
                  {isOverdue && <span className="ml-1 text-xs">(muddati o'tgan)</span>}
                </span>
              </InfoRow>
              <InfoRow label="Jarima bali">
                <span className="font-semibold text-red-600">{task.penaltyPoints} ball</span>
              </InfoRow>
              <InfoRow label="Yaratilgan">{formatUzDate(task.createdAt)}</InfoRow>
            </div>
            {task.description && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Tavsif</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </Card>

          {/* Owner attachments */}
          {task.attachments?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Topshiriq fayllari</h3>
              <div className="grid grid-cols-2 gap-2">
                {task.attachments.map((att, idx) => (
                  <AttachmentItem key={idx} attachment={att} />
                ))}
              </div>
            </Card>
          )}

          {/* Completion info */}
          {(task.completionNote || task.completionAttachments?.length > 0) && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Mening yuborganlarim</h3>
              {task.completionNote && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{task.completionNote}</p>
              )}
              {task.completionAttachments?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {task.completionAttachments.map((att, idx) => (
                    <AttachmentItem key={idx} attachment={att} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Status history */}
          {task.statusHistory?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Status tarixi</h3>
              <div className="space-y-3">
                {task.statusHistory.map((entry, idx) => {
                  const isSystem = !entry.changedBy;
                  const authorName = isSystem
                    ? "Tizim"
                    : entry.changedBy?.lastName
                      ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                      : entry.changedBy?.firstName || "—";

                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {isSystem ? "T" : authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-medium text-gray-700">{authorName}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${taskStatusColors[entry.status]}`}>
                            {taskStatusLabels[entry.status]}
                          </span>
                          <span className="text-[11px] text-gray-400">{formatUzDate(entry.changedAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                          {entry.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Deadline history */}
          {task.deadlineHistory?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Muddat tarixi</h3>
              <div className="space-y-3">
                {task.deadlineHistory.map((entry, idx) => (
                  <div key={idx} className="text-xs border-b border-gray-50 pb-2 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-gray-400 line-through">{formatUzDate(entry.oldDueDate)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{formatUzDate(entry.newDueDate)}</span>
                    </div>
                    <p className="text-gray-500">{entry.reason}</p>
                    {entry.withPenalty && (
                      <span className="text-red-500">+{entry.penaltyPoints} ball jarima</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Submit action */}
          {canSubmit && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Amal</h3>
              {!showSubmitForm ? (
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium"
                >
                  Bajarildi deb belgilash
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Izoh (ixtiyoriy)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Bajarilgan ish haqida..."
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fayllar (ixtiyoriy)</label>
                    <input
                      multiple
                      type="file"
                      accept="image/*,video/mp4,video/webm,application/pdf"
                      onChange={(e) => setFiles(e.target.files)}
                      className="w-full text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600"
                    >
                      Bekor
                    </button>
                    <button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
                    >
                      {submitMutation.isPending ? "Yuborilmoqda..." : "Yuborish"}
                    </button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {task.status === "pending_review" && (
            <Card>
              <p className="text-sm text-purple-600 text-center">Tasdiq kutilmoqda...</p>
            </Card>
          )}
          {task.status === "completed" && (
            <Card>
              <p className="text-sm text-green-600 text-center">Muvaffaqiyatli yakunlandi!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Ma'lumot qatori
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.children
 */
const InfoRow = ({ label, children }) => (
  <p>
    <span className="text-gray-500">{label}:</span>{" "}
    <span>{children}</span>
  </p>
);

/**
 * Biriktirma elementi
 * @param {Object} props
 * @param {Object} props.attachment - { url, type, originalName }
 */
const AttachmentItem = ({ attachment }) => {
  const { url, type, originalName } = attachment;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={originalName}
          className="w-full h-auto max-h-64 object-cover rounded-lg border"
        />
      </a>
    );
  }

  if (type === "video") {
    return (
      <video src={url} controls className="w-full h-auto max-h-64 rounded-lg border" />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 text-sm"
    >
      <span className="truncate">{originalName || "Fayl"}</span>
    </a>
  );
};

export default TaskDetailPage;
