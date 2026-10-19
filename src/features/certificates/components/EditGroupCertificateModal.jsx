// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Mutations
import { useUpdateTutorCertificatePlan } from "../queries/certificates.mutations";

/**
 * `@db.Date` qiymatini `<input type="date">` uchun kesib oladi.
 *
 * ⚠️ Lokal vaqtga o'girilmaydi: muddat serverdan UTC yarim tuni bilan
 * keladi ("2026-12-01T00:00:00.000Z") va manfiy ofsetli brauzerda lokal
 * o'girish sanani bir kun orqaga surib yuborardi. Bu — ISO QIYMAT, format
 * emas; ekranda server bergan yorliq ko'rsatiladi (`dates.md` §3 istisnosi).
 */
const toInputValue = (value) =>
  typeof value === "string" ? value.slice(0, 10) : "";

/**
 * GURUH RAHBARI REJANI TAHRIRLAYDI — MUDDAT va YO'NALISH.
 *
 * ⚠️ Izoh tahrirlanmaydi: u o'quvchining o'z javobi, tyutorning qarori
 * emas. Reja qo'shish, bekor qilish va "topshirdi" belgisi ham yo'q —
 * ular ma'muriyatning qarori.
 *
 * ⚠️ Yo'nalish o'zgartirilsa server YANGI qator yozadi, eskisi esa
 * "almashtirilgan" bo'lib registrda qoladi. Oyna buni oldindan aytadi,
 * chunki bu shunchaki maydonni tahrirlash emas.
 *
 * `openModal("editGroupCertificate", { plan, tracks })`
 */
const EditGroupCertificateModal = () => (
  <ResponsiveModal
    name="editGroupCertificate"
    title="Sertifikat rejasi"
    description="Topshirish muddati va yo'nalishni to'g'rilash"
    className="max-w-md"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, plan = null, tracks = [] }) => {
  const [trackId, setTrackId] = useState(plan?.track?.id ?? "");
  const [dueDate, setDueDate] = useState(toInputValue(plan?.dueDate));

  const { mutateAsync: updatePlan } = useUpdateTutorCertificatePlan();

  const trackChanged = Boolean(plan) && trackId !== plan.track?.id;

  const trackOptions = tracks.map((track) => ({
    value: track.id,
    label: track.subject ? `${track.name} · ${track.subject.name}` : track.name,
  }));

  const submit = async (event) => {
    event.preventDefault();
    if (!trackId) return toast.error("Yo'nalishni tanlang");

    setIsLoading(true);
    try {
      await updatePlan({
        planId: plan.id,
        trackId,
        // Bo'sh qoldirilsa — "muddati aniq emas"
        dueDate: dueDate || null,
      });
      toast.success(trackChanged ? "Yo'nalish almashtirildi" : "Muddat yangilandi");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Saqlab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm">
        <p className="font-medium text-gray-900">{plan?.student?.fullName}</p>
        <p className="mt-0.5 text-gray-500">
          Hozir: {plan?.track?.name} · {plan?.dueDateLabel}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Yo'nalish</label>
        <Select
          name="trackId"
          value={trackId}
          onChange={setTrackId}
          options={trackOptions}
          placeholder="Sertifikat yo'nalishi"
          triggerClassName="w-full"
        />
        {trackChanged && (
          <p className="text-xs text-amber-700">
            Yangi reja yoziladi, "{plan.track?.name}" esa registrda
            almashtirilgan bo'lib qoladi.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tutorDueDate" className="text-sm font-medium text-gray-700">
          Topshirish muddati
        </label>
        <Input
          id="tutorDueDate"
          name="tutorDueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <p className="text-xs text-gray-500">
          Bo'sh qoldirilsa — "muddati aniq emas" bo'lib ko'rinadi.
        </p>
      </div>

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" className="flex-1" onClick={close}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default EditGroupCertificateModal;
