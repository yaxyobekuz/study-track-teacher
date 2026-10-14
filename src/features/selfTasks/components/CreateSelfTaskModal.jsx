// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { Info } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { useCreateSelfRule, useCreateSelfTask } from "../queries/selfTasks.mutations";

// Utils
import { cn } from "@/shared/utils/cn";
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Data
import { DEFAULT_RECURRENCE, recurrenceProblems } from "../data/selfTasks.data";
import { kindMeta } from "@/features/tasks/data/tasks.data";

// Components
import SelfRecurrenceField from "./SelfRecurrenceField";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const KINDS = [
  { value: "extra", hint: "Bir martalik ish, aniq sanaga" },
  { value: "main", hint: "Doimiy ish — takrorlanadi" },
];

/**
 * O'ZIMGA ISH BELGILASH.
 *
 * ⚠️ UCHTA MAYDON YO'Q va bu bo'shliq emas, QOIDA:
 *   · IJROCHI — har doim o'zingiz (server boshqa odamni rad etadi);
 *   · JARIMA BALI — shaxsiy ishda jarima umuman yo'q (biznes qarori);
 *   · tasdiqlash — ikkinchi tomon yo'q, yakunlagan ish darhol "Bajarildi".
 *
 * ⚠️ TUR FORMANING SHAKLINI O'ZGARTIRADI (Lavozimlar markazi bilan AYNI
 * qoida): "Qo'shimcha" — bir martalik ish aniq sanaga, "Asosiy" — DOIMIY
 * ish va undan topshiriqlar avtomat yoziladi.
 */
const CreateSelfTaskModal = () => (
  <ResponsiveModal
    name="createSelfTask"
    title="O'zimga ish belgilash"
    description="Jarima yo'q — bu sizning o'z rejangiz"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, settings }) => {
  const { mutate: createTask } = useCreateSelfTask();
  const { mutate: createRule } = useCreateSelfRule();

  const rules = {
    minTitleLength: 3,
    minDescriptionLength: 10,
    minLeadHours: 0,
    ...(settings || {}),
  };

  const { title, description, dueDate, startDate, kind, timeMode, setField } = useObjectState({
    title: "",
    description: "",
    dueDate: "",
    startDate: "",
    kind: "extra",
    // "due" — faqat muddat, "range" — vaqt oralig'i
    timeMode: "due",
  });

  const [recurrence, setRecurrence] = useState(DEFAULT_RECURRENCE);
  const setRule = (field, value) => setRecurrence((prev) => ({ ...prev, [field]: value }));
  const isRecurring = kind === "main";
  const [openedAt] = useState(() => Date.now());

  const minDue = toDateTimeInputValue(
    new Date(openedAt + Math.max(rules.minLeadHours, 0) * 3600000),
  );

  const problems = [];
  if (title.trim().length < rules.minTitleLength)
    problems.push(`Sarlavha kamida ${rules.minTitleLength} ta belgi`);
  if (description.trim().length < rules.minDescriptionLength)
    problems.push(`Tavsif kamida ${rules.minDescriptionLength} ta belgi`);
  if (isRecurring) {
    problems.push(...recurrenceProblems(recurrence));
  } else {
    if (timeMode === "range" && !startDate) problems.push("Boshlanish vaqtini belgilang");
    if (!dueDate) problems.push("Ijro muddatini belgilang");
    else if (dueDate < minDue)
      problems.push(
        rules.minLeadHours > 0
          ? `Muddat kamida ${rules.minLeadHours} soatdan keyin bo'lsin`
          : "Muddat kelajakda bo'lsin",
      );
    if (timeMode === "range" && startDate && dueDate && startDate >= dueDate)
      problems.push("Boshlanish vaqti tugash vaqtidan oldin bo'lsin");
  }

  /** ⚠️ `assigneeIds` va `penaltyPoints` YUBORILMAYDI — ikkalasini ham
   *  server o'zi belgilaydi (ijrochi — o'zingiz, ball — 0). */
  const baseFormData = () => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);

    if (isRecurring) {
      const formData = baseFormData();
      formData.append("frequency", recurrence.frequency);
      if (recurrence.frequency === "weekly") {
        formData.append("weekdays", JSON.stringify(recurrence.weekdays));
      } else if (recurrence.frequency === "days") {
        formData.append("intervalDays", String(recurrence.intervalDays));
      } else {
        formData.append("intervalMonths", String(recurrence.intervalMonths));
        formData.append("monthDays", JSON.stringify(recurrence.monthDays));
      }
      // Bitta vaqt — server massiv kutadi (`slots`)
      formData.append(
        "slots",
        JSON.stringify([
          { start: recurrence.start || null, due: recurrence.due, offsetDays: 0 },
        ]),
      );
      formData.append("leadDays", String(recurrence.leadDays ?? 1));

      setIsLoading(true);
      return createRule(formData, {
        onSuccess: (res) => {
          close();
          const made = res?.data?.generatedCount || 0;
          toast.success(
            made > 0
              ? `Doimiy ish belgilandi · ${made} ta ish darhol yozildi`
              : "Doimiy ish belgilandi",
          );
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      });
    }

    const formData = baseFormData();
    formData.append("dueDate", new Date(dueDate).toISOString());
    // ⚠️ Faqat "oraliq" rejimida: "faqat muddat" rejimida maydon bo'sh
    // qolishi KERAK, aks holda ro'yxatda ma'nosiz "hali boshlanmagan"
    // holati paydo bo'lardi.
    if (timeMode === "range" && startDate) {
      formData.append("startDate", new Date(startDate).toISOString());
    }
    formData.append("kind", kind);

    setIsLoading(true);
    createTask(formData, {
      onSuccess: () => {
        close();
        toast.success("Ish o'zingizga belgilandi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Tur */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">Ish turi</p>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((item) => {
            const meta = kindMeta(item.value);
            const active = kind === item.value;
            return (
              <button
                key={item.value}
                type="button"
                disabled={isLoading}
                onClick={() => setField("kind", item.value)}
                className={cn(
                  "rounded-xl border p-2.5 text-left transition-colors disabled:opacity-50",
                  active ? "border-blue-500 bg-blue-50/60" : "border-gray-200",
                )}
              >
                <span className="block text-sm font-medium text-gray-900">{meta.label}</span>
                <span className="block text-xs leading-snug text-gray-500">{item.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <InputField
        required
        value={title}
        maxLength={300}
        label="Sarlavha"
        disabled={isLoading}
        placeholder="Masalan: Jurnalni to'ldirib chiqish"
        onChange={(e) => setField("title", e.target.value)}
        description={`Kamida ${rules.minTitleLength} ta belgi`}
      />

      <InputField
        required={rules.minDescriptionLength > 0}
        label="Tavsif"
        type="textarea"
        value={description}
        maxLength={5000}
        disabled={isLoading}
        inputClassName="min-h-24"
        placeholder="Nima qilaman, natija qanday bo'lishi kerak..."
        onChange={(e) => setField("description", e.target.value)}
        description={
          rules.minDescriptionLength > 0 ? `Kamida ${rules.minDescriptionLength} ta belgi` : ""
        }
      />

      {isRecurring ? (
        <SelfRecurrenceField value={recurrence} onChange={setRule} disabled={isLoading} />
      ) : (
        <div className="space-y-2.5 rounded-xl bg-gray-50 p-3">
          <div className="flex gap-1 rounded-full bg-white p-0.5 ring-1 ring-gray-200">
            {[
              { value: "due", label: "Faqat muddat" },
              { value: "range", label: "Vaqt oralig'i" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setField("timeMode", item.value);
                  if (item.value === "due") setField("startDate", "");
                }}
                className={cn(
                  "flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  timeMode === item.value ? "bg-blue-600 text-white" : "text-gray-600",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {timeMode === "range" && (
            <InputField
              required
              type="datetime-local"
              label="Boshlanish vaqti"
              value={startDate}
              disabled={isLoading}
              onChange={(e) => setField("startDate", e.target.value)}
            />
          )}

          <InputField
            required
            type="datetime-local"
            label="Ijro muddati"
            value={dueDate}
            min={minDue}
            disabled={isLoading}
            onChange={(e) => setField("dueDate", e.target.value)}
          />
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Bu <b>o'zingiz uchun</b> belgilangan ish: <b>jarima yozilmaydi</b> va tasdiqlash
          kutilmaydi — yakunlaganingizda darhol "Bajarildi" bo'ladi. Muddat o'tsa ish
          "Bajarilmadi" bo'lib ko'rinadi.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-xs text-gray-400">{problems[0] || ""}</p>
        <Button disabled={isLoading || problems.length > 0}>
          {isLoading ? "Saqlanmoqda..." : isRecurring ? "Doimiy ishni saqlash" : "Belgilash"}
        </Button>
      </div>
    </form>
  );
};

export default CreateSelfTaskModal;
