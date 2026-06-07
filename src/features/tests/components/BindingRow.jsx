// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { Send, Lock, Edit, Trash2, Loader2 } from "lucide-react";

// API
import { testBindingsAPI } from "../api/tests.api";

// Data
import {
  BINDING_STATUS_LABELS,
  BINDING_STATUS_COLORS,
} from "../data/testDefaults.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import BindingForm from "./BindingForm";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Bitta biriktiruv qatori (status + sinflar + amallar).
 */
const BindingRow = ({ binding, testId }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const publishMutation = useMutation({
    mutationFn: () => testBindingsAPI.publish(binding._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-bindings", testId] });
      toast.success("Biriktiruv e'lon qilindi");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const closeMutation = useMutation({
    mutationFn: () => testBindingsAPI.close(binding._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-bindings", testId] });
      toast.success("Biriktiruv yopildi");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => testBindingsAPI.delete(binding._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-bindings", testId] });
      toast.success("Biriktiruv o'chirildi");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
        <BindingForm
          testId={testId}
          binding={binding}
          onSaved={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">
              {binding.season?.name}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-700">{binding.subject?.name}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-xs font-medium",
                BINDING_STATUS_COLORS[binding.status] || "bg-gray-100",
              )}
            >
              {BINDING_STATUS_LABELS[binding.status]}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(binding.classes || []).length === 0 ? (
              <span className="text-sm text-gray-400">Sinflar yo'q</span>
            ) : (
              binding.classes.map((c) => (
                <span
                  key={c._id || c}
                  className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-medium"
                >
                  {c.name || "Sinf"}
                </span>
              ))
            )}
          </div>

          <p className="text-xs text-gray-500">
            Yaratilgan: {formatDateUZ(binding.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {binding.status === "draft" && (
            <Button
              size="sm"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="gap-1.5"
            >
              {publishMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              E'lon qilish
            </Button>
          )}

          {binding.status === "published" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => closeMutation.mutate()}
              disabled={closeMutation.isPending}
              className="gap-1.5"
            >
              {closeMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              Yopish
            </Button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md"
            title="Tahrirlash"
          >
            <Edit size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Biriktiruvni o'chirishni xohlaysizmi?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="size-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md"
            title="O'chirish"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BindingRow;
