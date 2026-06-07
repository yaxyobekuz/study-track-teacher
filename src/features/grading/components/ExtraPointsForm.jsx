// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { testResultsAPI } from "../api/testResults.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Natijaga qo'shimcha ball qo'shish formasi.
 *
 * @param {object} props
 * @param {string} props.resultId - natija ID
 * @param {Function} props.onSuccess
 */
const ExtraPointsForm = ({ resultId, onSuccess }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => testResultsAPI.addExtraPoints(resultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-result", resultId] });
      queryClient.invalidateQueries({ queryKey: ["test-results", "by-test"] });
      toast.success("Qo'shimcha ball qo'shildi");
      setAmount("");
      setReason("");
      onSuccess?.();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Xatolik"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount === "" || isNaN(Number(amount))) {
      toast.error("Ball miqdori noto'g'ri");
      return;
    }
    if (!reason.trim()) {
      toast.error("Sabab kiritilmagan");
      return;
    }
    mutation.mutate({ amount: Number(amount), reason: reason.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField
        type="number"
        name="amount"
        label="Ball miqdori"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        description="Manfiy son ham mumkin (ball kamaytirish)"
      />
      <InputField
        name="reason"
        label="Sabab"
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Masalan: chiroyli yozgani uchun"
      />
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
      </Button>
    </form>
  );
};

export default ExtraPointsForm;
