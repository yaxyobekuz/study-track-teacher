// UI
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { CheckCircle2, MinusCircle, UserX } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { GRADE_OPTIONS } from "../data/grades.data";

// Queries
import { useBulkCreateGrades } from "../queries/grades.mutations";

/**
 * HAMMAGA BAHO QO'YISH — tasdiq oynasi.
 *
 * Kimga qo'yilishi OLDINDAN ko'rsatiladi: bahosi yo'q va darsda bor
 * o'quvchilar. Bahosi borga tegilmaydi, darsda yo'qqa qo'yilmaydi — server
 * ham aynan shunday yozadi va natijani o'z xabarida aytadi (ro'yxat oyna
 * ochilgandan keyin o'zgargan bo'lsa ham, qo'yilgani o'sha xabarda).
 */
const BulkGradeModal = () => (
  <ResponsiveModal name="bulkGrade" title="Hammaga baho qo'yish" className="max-w-md">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  payload,
  lessonLabel,
  dayLabel,
  pending = [],
  gradedCount = 0,
  away = [],
  spreads = false,
}) => {
  const [grade, setGrade] = useState("");
  const { mutate: bulkCreate } = useBulkCreateGrades();

  if (!payload) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!grade) return toast.error("Bahoni tanlang");

    setIsLoading(true);
    bulkCreate(
      { ...payload, grade: parseInt(grade) },
      {
        onSuccess: (res) => {
          close();
          toast.success(res.message || "Baholar qo'yildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
        <p className="font-medium text-gray-800">{lessonLabel}</p>
        <p className="mt-0.5 text-xs">{dayLabel}</p>
      </div>

      <Select
        required
        label="Baho"
        value={grade}
        onChange={setGrade}
        disabled={isLoading}
        placeholder="Bahoni tanlang"
        options={GRADE_OPTIONS}
      />

      <ul className="space-y-1.5 text-sm">
        <li className="flex items-start gap-2 text-green-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>
            <b>{pending.length} ta</b> o'quvchiga qo'yiladi
          </span>
        </li>

        {gradedCount > 0 && (
          <li className="flex items-start gap-2 text-gray-600">
            <MinusCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span>
              {gradedCount} tasida baho bor — <b>o'zgarmaydi</b>
            </span>
          </li>
        )}

        {away.length > 0 && (
          <li className="flex items-start gap-2 text-amber-800">
            <UserX className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span>
              {away.length} tasi darsda yo'q (kelmagan deb belgilangan yoki
              o'qimaydi) — <b>qo'yilmaydi</b>:{" "}
              <span className="text-amber-700">
                {away.map((s) => `${s.firstName} ${s.lastName}`).join(", ")}
              </span>
            </span>
          </li>
        )}
      </ul>

      {spreads && (
        <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Baho shu kungi shu fandagi boshqa darsingizga ham qo'yiladi — bittalab
          qo'yishdagi kabi.
        </p>
      )}

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
        <Button className="flex-1" disabled={isLoading || !grade}>
          {isLoading ? "Qo'yilmoqda..." : `${pending.length} ta o'quvchiga qo'yish`}
        </Button>
      </div>
    </form>
  );
};

export default BulkGradeModal;
