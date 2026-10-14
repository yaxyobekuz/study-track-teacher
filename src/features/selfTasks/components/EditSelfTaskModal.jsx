// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { useUpdateSelfTask } from "../queries/selfTasks.mutations";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * O'ZIGA BELGILAGAN ISHNI TAHRIRLASH.
 *
 * ⚠️ MUDDATNING O'ZI BU YERDA O'ZGARMAYDI — u "Muddatni o'zgartirish"
 * oynasining ishi (sabab va tarix bilan). Bu yerda faqat BOSHLANISH
 * vaqti to'g'rilanadi, ya'ni oraliq.
 *
 * ⚠️ IJROCHI VA JARIMA BALI YO'Q: ish har doim o'zingizda qoladi va
 * shaxsiy ishda jarima umuman bo'lmaydi (server ikkalasini ham rad etadi).
 *
 * Faqat O'ZGARGAN maydonlar yuboriladi — server tarixga aynan nima
 * o'zgarganini yozadi.
 */
const EditSelfTaskModal = () => (
  <ResponsiveModal
    name="editSelfTask"
    title="Ishni tahrirlash"
    description="Har bir o'zgarish tarixga yoziladi"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, settings }) => {
  const { mutate: updateTask } = useUpdateSelfTask();

  const rules = { minTitleLength: 3, minDescriptionLength: 10, ...(settings || {}) };

  const { title, description, startDate, setField } = useObjectState({
    title: task?.title || "",
    description: task?.description || "",
    startDate: task?.startDate ? toDateTimeInputValue(new Date(task.startDate)) : "",
  });

  if (!task) return null;

  const currentStart = task.startDate ? toDateTimeInputValue(new Date(task.startDate)) : "";

  const changes = [];
  if (title.trim() !== task.title) changes.push("title");
  if (description.trim() !== task.description) changes.push("description");
  if (startDate !== currentStart) changes.push("startDate");

  const problems = [];
  if (title.trim().length < rules.minTitleLength)
    problems.push(`Sarlavha kamida ${rules.minTitleLength} ta belgi`);
  if (description.trim().length < rules.minDescriptionLength)
    problems.push(`Tavsif kamida ${rules.minDescriptionLength} ta belgi`);
  if (startDate && startDate >= toDateTimeInputValue(new Date(task.dueDate)))
    problems.push("Boshlanish vaqti ijro muddatidan oldin bo'lsin");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);
    if (!changes.length) return toast.info("Hech narsa o'zgartirilmadi");

    const formData = new FormData();
    if (changes.includes("title")) formData.append("title", title.trim());
    if (changes.includes("description")) formData.append("description", description.trim());
    // Bo'sh satr — oraliqni olib tashlash ("shu vaqtgacha" rejimiga qaytish)
    if (changes.includes("startDate"))
      formData.append("startDate", startDate ? new Date(startDate).toISOString() : "");

    setIsLoading(true);
    updateTask(
      { id: task.id, formData },
      {
        onSuccess: () => {
          close();
          toast.success("Ish yangilandi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField
        required
        value={title}
        maxLength={300}
        label="Sarlavha"
        disabled={isLoading}
        onChange={(e) => setField("title", e.target.value)}
      />

      <InputField
        required={rules.minDescriptionLength > 0}
        label="Tavsif"
        type="textarea"
        value={description}
        maxLength={5000}
        disabled={isLoading}
        inputClassName="min-h-24"
        onChange={(e) => setField("description", e.target.value)}
      />

      <InputField
        type="datetime-local"
        label="Boshlanish vaqti (ixtiyoriy)"
        value={startDate}
        disabled={isLoading}
        onChange={(e) => setField("startDate", e.target.value)}
        description="Bo'sh qoldirilsa — faqat muddat ko'rsatiladi"
      />

      <p className="text-xs text-gray-400">{problems[0] || ""}</p>

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
        <Button
          className="flex-1"
          disabled={isLoading || problems.length > 0 || changes.length === 0}
        >
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default EditSelfTaskModal;
