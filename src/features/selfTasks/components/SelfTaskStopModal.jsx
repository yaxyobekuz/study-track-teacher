// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Queries
import { useStopSelfRule, useStopSelfTask } from "../queries/selfTasks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * TO'XTATISH — "kerak bo'lmay qoldi".
 *
 * ⚠️ O'CHIRISH BILAN CHALKASHMASIN: to'xtatilgani SABAB bilan ro'yxatda
 * qoladi va rahbariyat statistikasida "to'xtatilgan" bo'lib ko'rinadi,
 * o'chirish esa izsiz yo'q qiladi va u faqat XATO kiritilgan ish uchun.
 * Shuning uchun bu yerda sabab MAJBURIY.
 *
 * ⚠️ DOIMIY ISH QOIDASI HAM SHU OYNADAN (`mode: "rule"`): ikkalasi ham
 * AYNAN bitta maydonni so'raydi. Alohida oyna bo'lsa, sabab bitta joyda
 * majburiy, ikkinchisida esa kodga qotirilgan standart matn bo'lib
 * qolardi — ya'ni registr bir xil, hech narsa tushuntirmaydigan qatorlar
 * bilan to'lardi.
 */
const SelfTaskStopModal = () => (
  <ResponsiveModal
    name="stopSelfTask"
    title="To'xtatish"
    description="To'xtatilgani sabab bilan ro'yxatda qoladi"
    className="max-w-md"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, mode = "task" }) => {
  const { mutate: stopTask } = useStopSelfTask();
  const { mutate: stopRule } = useStopSelfRule();
  const [reason, setReason] = useState("");

  if (!task) return null;

  const isRule = mode === "rule";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Sabab majburiy");

    const run = isRule ? stopRule : stopTask;
    setIsLoading(true);
    run(
      { id: task.id, data: { reason: reason.trim() } },
      {
        onSuccess: () => {
          close();
          toast.success(isRule ? "Doimiy ish to'xtatildi" : "Ish to'xtatildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
        {task.title}
      </p>

      <InputField
        required
        label="Sabab"
        type="textarea"
        value={reason}
        inputClassName="min-h-20"
        disabled={isLoading}
        onChange={(e) => setReason(e.target.value)}
        placeholder={
          isRule
            ? "Nega to'xtatilyapti? Yangi ishlar yozilmaydi, yozilganlari qoladi..."
            : "Nega to'xtatilyapti?"
        }
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isLoading}
          onClick={() => close()}
        >
          Bekor qilish
        </Button>
        <Button variant="danger" className="flex-1" disabled={isLoading}>
          {isLoading ? "..." : "To'xtatish"}
        </Button>
      </div>
    </form>
  );
};

export default SelfTaskStopModal;
