// Toast
import { toast } from "sonner";

// Queries
import { useDeleteSelfRule, useDeleteSelfTask } from "../queries/selfTasks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * O'CHIRISH TASDIQI — ish yoki doimiy ish qoidasi.
 *
 * ⚠️ O'CHIRISH TO'XTATISH EMAS: to'xtatilgani sabab bilan registrda
 * qoladi, o'chirilgani esa izsiz yo'q bo'ladi. Shuning uchun u faqat XATO
 * kiritilgan ish uchun va tasdiq so'raladi.
 *
 * ⚠️ Qoida o'chirilsa, undan ALLAQACHON YOZILGAN ishlar joyida qoladi
 * (server `onDelete: SetNull`) — odam ularni allaqachon ko'rgan va
 * boshlagan bo'lishi mumkin.
 */
const SelfTaskDeleteModal = () => (
  <ResponsiveModal name="deleteSelfTask" title="O'chirish" className="max-w-sm">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, mode = "task" }) => {
  const { mutate: deleteTask } = useDeleteSelfTask();
  const { mutate: deleteRule } = useDeleteSelfRule();

  if (!task) return null;

  const isRule = mode === "rule";

  const handleDelete = () => {
    const run = isRule ? deleteRule : deleteTask;
    setIsLoading(true);
    run(task.id, {
      onSuccess: () => {
        close();
        toast.success(isRule ? "Doimiy ish o'chirildi" : "Ish o'chirildi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
        {task.title}
      </p>
      <p className="text-sm text-gray-600">
        {isRule
          ? "Qoida o'chiriladi. Undan yozilgan ishlar joyida qoladi."
          : "Ish, fayllari va tarixi butunlay o'chadi. Buni qaytarib bo'lmaydi."}
      </p>
      <p className="text-xs text-gray-400">
        Bekor qilish uchun o'chirish emas, <b>to'xtatish</b> ham mumkin — u sabab bilan
        ro'yxatda qoladi.
      </p>

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
        <Button variant="danger" className="flex-1" disabled={isLoading} onClick={handleDelete}>
          {isLoading ? "..." : "O'chirish"}
        </Button>
      </div>
    </div>
  );
};

export default SelfTaskDeleteModal;
