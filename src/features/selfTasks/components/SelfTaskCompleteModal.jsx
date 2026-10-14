// Toast
import { toast } from "sonner";

// Components
import TaskSubmitForm from "@/features/tasks/components/TaskSubmitForm";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { useCompleteSelfTask } from "../queries/selfTasks.mutations";

/**
 * O'ZIGA BELGILAGAN ISHNI YAKUNLASH.
 *
 * ⚠️ TASDIQLASH KUTILMAYDI: ikkinchi tomon yo'q, shuning uchun ish shu
 * zahoti "Bajarildi" bo'ladi (server `submitTaskCompletion` →
 * `completed`). Xabar ham shuni aniq aytadi — "tekshiruvga yuborildi" deb
 * yozilsa, odam javob kutib qolardi.
 *
 * ⚠️ FORMA RAHBAR BERGAN ISH BILAN AYNI (`TaskSubmitForm`): nechta fayl,
 * izoh majburiymi — qoidalar serverdan keladi va ikki oqimda bir xil.
 * Ikkinchi forma yozilsa, bittasida chegara yangilanib, ikkinchisida
 * eskirib qolardi.
 */
const SelfTaskCompleteModal = () => (
  <ResponsiveModal
    name="completeSelfTask"
    title="Ishni yakunlash"
    description="Bajarilgan ish isbotini yuklang"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, rules }) => {
  const { mutate: completeTask } = useCompleteSelfTask();

  if (!task) return null;

  const handleSubmit = (formData, reset) => {
    setIsLoading(true);
    completeTask(
      { id: task.id, formData },
      {
        onSuccess: () => {
          reset();
          close();
          toast.success("Ish yakunlandi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
        {task.title}
      </p>
      <TaskSubmitForm
        rules={rules}
        isPending={isLoading}
        onSubmit={handleSubmit}
        onCancel={() => close()}
        submitLabel="Bajardim — yakunlash"
      />
    </div>
  );
};

export default SelfTaskCompleteModal;
