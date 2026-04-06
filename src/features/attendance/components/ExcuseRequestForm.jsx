import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { attendanceAPI } from "../api/attendance.api";
import { EXCUSE_TYPE_OPTIONS } from "../data/attendance.data";

/**
 * Excuse so'rov yuborish formasi
 */
const ExcuseRequestForm = ({ onSuccess }) => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("after");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) return toast.warning("Sanani tanlang");
    if (!reason.trim()) return toast.warning("Sabab kiriting");

    setLoading(true);
    attendanceAPI
      .createExcuseRequest({ date, reason, type })
      .then(() => {
        toast.success("So'rov yuborildi");
        setDate("");
        setReason("");
        setType("after");
        queryClient.invalidateQueries({ queryKey: ["attendance", "myExcuses"] });
        onSuccess?.();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900">Sababli yo'qlik so'rovi</h3>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Sana <span className="text-blue-500">*</span>
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 px-3.5 text-sm focus:outline-blue-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">So'rov turi</label>
        <div className="flex gap-3">
          {EXCUSE_TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="excuseType"
                value={opt.value}
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
                className="size-4"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Sabab <span className="text-blue-500">*</span>
        </label>
        <textarea
          required
          value={reason}
          rows={3}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Kela olmaslik sababini yozing..."
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-blue-500 resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{reason.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-500 py-3 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "Yuborilmoqda..." : "So'rov yuborish"}
      </button>
    </form>
  );
};

export default ExcuseRequestForm;
