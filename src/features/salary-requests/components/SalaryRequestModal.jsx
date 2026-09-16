// Toast
import { toast } from "sonner";

// React
import { useRef } from "react";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { salaryRequestsAPI } from "../api/salaryRequests.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";

// Data
import { REQUEST_TYPE_OPTIONS, BONUS_TYPE_OPTIONS } from "../data/salaryRequests.data";

const SalaryRequestModal = () => (
  <ModalWrapper name="salaryRequest" title="Oylik zayavkasi" className="max-w-lg">
    <Content />
  </ModalWrapper>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();
  const {
    kind,
    requestedCategoryId,
    bonusLabel,
    bonusType,
    bonusValue,
    reason,
    loading,
    setField,
    resetState,
  } = useObjectState({
    kind: "category",
    requestedCategoryId: "",
    bonusLabel: "",
    bonusType: "fixed",
    bonusValue: "",
    reason: "",
    loading: false,
  });
  const filesRef = useRef(null);

  // Toifa zayavkasi uchun tanlanadigan toifalar (joriysi belgilanadi)
  const { data: categories = [] } = useQuery({
    queryKey: ["salaryRequests", "availableCategories"],
    queryFn: () =>
      salaryRequestsAPI.getAvailableCategories().then((r) => r.data.data),
    enabled: kind === "category",
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    // Toifasiz o'qituvchiga barcha bo'lim toifalari keladi — bo'lim nomi
    // bilan ajratiladi ("MTB / 2-toifa")
    label: `${c.departmentName ? c.departmentName + " / " : ""}${c.name} — ${Number(c.perHourRate).toLocaleString("uz-UZ")} so'm/soat${c.isCurrent ? " (joriy toifangiz)" : ""}`,
    disabled: c.isCurrent,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (kind === "category" && !requestedCategoryId) {
      return toast.warning("Qaysi toifaga o'tmoqchisiz — tanlang");
    }
    if (kind === "bonus" && !(Number(bonusValue) > 0)) {
      return toast.warning("Ustama qiymatini kiriting");
    }
    if (!reason.trim()) {
      return toast.warning("Sabab / izoh yozing");
    }

    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("reason", reason);

    if (kind === "category") {
      formData.append("requestedCategoryId", requestedCategoryId);
    } else {
      formData.append("bonusLabel", bonusLabel || "Ustama");
      formData.append("bonusType", bonusType);
      formData.append("bonusValue", bonusValue);
    }

    const files = filesRef.current;
    if (files) for (const f of files) formData.append("files", f);

    setField("loading", true);
    salaryRequestsAPI
      .create(formData)
      .then(() => {
        toast.success("Zayavka yuborildi. Admin ko'rib chiqishini kuting.");
        resetState();
        queryClient.invalidateQueries({ queryKey: ["salaryRequests", "mine"] });
        close?.();
      })
      .catch((err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"))
      .finally(() => setField("loading", false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Maqsad */}
      <Select
        required
        label="Zayavka maqsadi"
        value={kind}
        options={REQUEST_TYPE_OPTIONS}
        onChange={(v) => setField("kind", v)}
      />

      {/* TOIFA: qaysi toifaga o'tish */}
      {kind === "category" && (
        <Select
          required
          label="Qaysi toifaga o'tmoqchisiz"
          value={requestedCategoryId}
          options={categoryOptions}
          placeholder={categories.length ? "Toifani tanlang" : "Toifalar yuklanmoqda..."}
          onChange={(v) => setField("requestedCategoryId", v)}
        />
      )}

      {/* USTAMA: nomi, turi, qiymati */}
      {kind === "bonus" && (
        <>
          <Input
            label="Ustama nomi"
            value={bonusLabel}
            maxLength={100}
            placeholder="Masalan: Sertifikat ustamasi"
            onChange={(v) => setField("bonusLabel", v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              required
              label="Turi"
              value={bonusType}
              options={BONUS_TYPE_OPTIONS}
              onChange={(v) => setField("bonusType", v)}
            />
            <Input
              required
              type="number"
              label={bonusType === "percent" ? "Foiz (%)" : "Summa (so'm)"}
              value={bonusValue}
              placeholder={bonusType === "percent" ? "10" : "500000"}
              onChange={(v) => setField("bonusValue", v)}
            />
          </div>
        </>
      )}

      {/* Tasdiqlovchi hujjat */}
      <Input
        type="file"
        label="Tasdiqlovchi hujjat (sertifikat, diplom — rasm yoki PDF)"
        accept="image/*,application/pdf,.doc,.docx"
        multiple
        onChange={(filesList) => (filesRef.current = filesList)}
      />

      {/* Sabab */}
      <Input
        required
        type="textarea"
        label="Sabab / izoh"
        value={reason}
        maxLength={1000}
        placeholder="Masalan: yangi malaka toifasiga ega bo'ldim va tegishli toifaga o'tkazishingizni so'rayman"
        onChange={(v) => setField("reason", v)}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Yuborilmoqda..." : "Zayavka yuborish"}
      </Button>
    </form>
  );
};

export default SalaryRequestModal;
