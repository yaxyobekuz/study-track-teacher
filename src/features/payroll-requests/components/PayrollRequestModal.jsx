// Toast
import { toast } from "sonner";

// React
import { useRef } from "react";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { payrollRequestsAPI } from "../api/payrollRequests.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";

// Data
import {
  REQUEST_KIND_OPTIONS,
  BONUS_TYPE_OPTIONS,
} from "../data/payrollRequests.data";

const PayrollRequestModal = () => (
  <ModalWrapper name="payrollRequest" title="Oylik zayavkasi" className="max-w-lg">
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
    bonusStartMonth,
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
    bonusStartMonth: "",
    reason: "",
    loading: false,
  });
  const filesRef = useRef(null);

  // Tanlash mumkin bo'lgan toifalar (faqat category maqsadida kerak)
  const { data: categories = [] } = useQuery({
    queryKey: ["payrollRequests", "availableCategories"],
    queryFn: () =>
      payrollRequestsAPI.getAvailableCategories().then((r) => r.data.data),
    enabled: kind === "category",
  });

  const categoryOptions = categories
    .filter((c) => !c.isCurrent)
    .map((c) => ({ label: `${c.name} — ${c.perHourRate} so'm/soat`, value: c.id }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validatsiya
    if (kind === "category" && !requestedCategoryId) {
      return toast.warning("So'ralayotgan toifani tanlang");
    }
    if (kind === "bonus" && !(Number(bonusValue) > 0)) {
      return toast.warning("Ustama qiymatini kiriting");
    }

    const formData = new FormData();
    formData.append("kind", kind);
    if (reason) formData.append("reason", reason);

    if (kind === "category") {
      formData.append("requestedCategoryId", requestedCategoryId);
    } else {
      formData.append("bonusLabel", bonusLabel || "Ustama");
      formData.append("bonusType", bonusType);
      formData.append("bonusValue", bonusValue);
      if (bonusStartMonth) formData.append("bonusStartMonth", bonusStartMonth);
    }

    const files = filesRef.current;
    if (files) {
      for (const file of files) formData.append("files", file);
    }

    setField("loading", true);
    payrollRequestsAPI
      .create(formData)
      .then(() => {
        toast.success("Zayavka yuborildi. Admin tasdiqlashini kuting.");
        resetState();
        queryClient.invalidateQueries({ queryKey: ["payrollRequests", "mine"] });
        close?.();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setField("loading", false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Maqsad */}
      <Select
        required
        label="Maqsad"
        value={kind}
        options={REQUEST_KIND_OPTIONS}
        onChange={(v) => setField("kind", v)}
      />

      {/* Toifa maqsadi */}
      {kind === "category" ? (
        categoryOptions.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Tanlash mumkin bo'lgan boshqa toifa topilmadi. Administrator bilan
            bog'laning.
          </p>
        ) : (
          <Select
            required
            label="So'ralayotgan toifa"
            value={requestedCategoryId}
            placeholder="Toifani tanlang"
            options={categoryOptions}
            onChange={(v) => setField("requestedCategoryId", v)}
          />
        )
      ) : (
        /* Ustama maqsadi */
        <div className="space-y-4">
          <Input
            label="Ustama nomi"
            value={bonusLabel}
            placeholder="Masalan: Sinf rahbarligi"
            onChange={(v) => setField("bonusLabel", v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
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
              placeholder={bonusType === "percent" ? "10" : "300000"}
              onChange={(v) => setField("bonusValue", v)}
            />
          </div>
          <Input
            type="month"
            label="Qaysi oydan (ixtiyoriy)"
            value={bonusStartMonth}
            onChange={(v) => setField("bonusStartMonth", v)}
          />
        </div>
      )}

      {/* Izoh */}
      <Input
        type="textarea"
        label="Sabab / izoh (ixtiyoriy)"
        value={reason}
        maxLength={500}
        placeholder="Nima uchun bu so'rovni yuborayapsiz?"
        onChange={(v) => setField("reason", v)}
      />

      {/* Hujjat */}
      <Input
        type="file"
        label="Hujjat (sertifikat, diplom, buyruq — rasm yoki PDF)"
        accept="image/*,application/pdf,.doc,.docx"
        multiple
        onChange={(filesList) => (filesRef.current = filesList)}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Yuborilmoqda..." : "Yuborish"}
      </Button>
    </form>
  );
};

export default PayrollRequestModal;
