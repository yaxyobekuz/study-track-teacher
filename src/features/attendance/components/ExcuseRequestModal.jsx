// Toaster
import { toast } from "sonner";

// API
import { attendanceAPI } from "../api/attendance.api";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

const ExcuseRequestModal = () => (
  <ModalWrapper name="excuseRequest" title="Uzrli yo'qlik so'rovi">
    <Content />
  </ModalWrapper>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();
  const { date, absenceReason, reason, loading, setField, resetState } =
    useObjectState({
      date: "",
      absenceReason: "",
      reason: "",
      loading: false,
    });

  // O'z roliga tegishli sabab kategoriyalari
  const { data: reasons = [] } = useQuery({
    queryKey: ["absenceReasons", "applicable"],
    queryFn: () => attendanceAPI.getAbsenceReasons().then((r) => r.data.data),
  });

  const reasonOptions = reasons.map((r) => ({ label: r.title, value: r._id }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) return toast.warning("Sanani tanlang");
    if (!absenceReason) return toast.warning("Sababni tanlang");

    const type = new Date(date) > new Date() ? "advance" : "after";

    setField("loading", true);
    attendanceAPI
      .createExcuseRequest({ date, absenceReason, reason, type })
      .then(() => {
        toast.success("So'rov yuborildi");
        resetState();
        queryClient.invalidateQueries({
          queryKey: ["attendance", "myExcuses"],
        });
        close?.();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setField("loading", false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <InputField
        required
        type="date"
        label="Sana"
        value={date}
        onChange={(e) => setField("date", e.target.value)}
      />

      {/* Reason category (mandatory) */}
      {reasonOptions.length === 0 ? (
        <p className="text-sm text-red-500">
          Sizning rolingiz uchun sabablar mavjud emas. Administrator bilan
          bog&apos;laning.
        </p>
      ) : (
        <SelectField
          required
          label="Sabab"
          value={absenceReason}
          options={reasonOptions}
          placeholder="Sababni tanlang"
          onChange={(v) => setField("absenceReason", v)}
        />
      )}

      {/* Optional note */}
      <InputField
        label="Qo'shimcha izoh (ixtiyoriy)"
        value={reason}
        type="textarea"
        maxLength={500}
        onChange={(e) => setField("reason", e.target.value)}
        description={
          <p className="text-xs text-gray-400 mt-1 text-right">
            {reason.length}/500
          </p>
        }
      />

      {/* Submit Button */}
      <Button disabled={loading} className="w-full">
        Yuborish{loading && "..."}
      </Button>
    </form>
  );
};

export default ExcuseRequestModal;
