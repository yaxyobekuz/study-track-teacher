// Toast
import { toast } from "sonner";

// React
import { useRef } from "react";

// Tanstack Query
import { useQueryClient } from "@tanstack/react-query";

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
import { REQUEST_TYPE_OPTIONS } from "../data/salaryRequests.data";

const SalaryRequestModal = () => (
  <ModalWrapper name="salaryRequest" title="Oylik so'rovi" className="max-w-lg">
    <Content />
  </ModalWrapper>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();
  const {
    type,
    reason,
    proposedAmount,
    proposedHourlyRate,
    proposedStartMonth,
    loading,
    setField,
    resetState,
  } = useObjectState({
    type: "raise",
    reason: "",
    proposedAmount: "",
    proposedHourlyRate: "",
    proposedStartMonth: "",
    loading: false,
  });
  const filesRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() && !proposedAmount && !proposedHourlyRate) {
      return toast.warning("Izoh yozing yoki taklif summasini kiriting");
    }

    const formData = new FormData();
    formData.append("type", type);
    if (reason) formData.append("reason", reason);
    if (proposedAmount) formData.append("proposedAmount", proposedAmount);
    if (proposedHourlyRate) formData.append("proposedHourlyRate", proposedHourlyRate);
    if (proposedStartMonth) formData.append("proposedStartMonth", proposedStartMonth);

    const files = filesRef.current;
    if (files) for (const f of files) formData.append("files", f);

    setField("loading", true);
    salaryRequestsAPI
      .create(formData)
      .then(() => {
        toast.success("So'rov yuborildi. Admin ko'rib chiqishini kuting.");
        resetState();
        queryClient.invalidateQueries({ queryKey: ["salaryRequests", "mine"] });
        close?.();
      })
      .catch((err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"))
      .finally(() => setField("loading", false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Turi */}
      <Select
        required
        label="Nima haqida"
        value={type}
        options={REQUEST_TYPE_OPTIONS}
        onChange={(v) => setField("type", v)}
      />

      {/* Izoh / asoslash */}
      <Input
        type="textarea"
        label="Izoh / asoslash"
        value={reason}
        maxLength={1000}
        placeholder="Masalan: malaka oshirdim, oylikni ko'rib chiqishingizni so'rayman"
        onChange={(v) => setField("reason", v)}
      />

      {/* Ixtiyoriy takliflar */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          label="Taklif summa (ixtiyoriy)"
          value={proposedAmount}
          placeholder="so'm / oy"
          onChange={(v) => setField("proposedAmount", v)}
        />
        <Input
          type="number"
          label="Taklif stavka (ixtiyoriy)"
          value={proposedHourlyRate}
          placeholder="so'm / soat"
          onChange={(v) => setField("proposedHourlyRate", v)}
        />
      </div>
      <Input
        type="month"
        label="Qaysi oydan (ixtiyoriy)"
        value={proposedStartMonth}
        onChange={(v) => setField("proposedStartMonth", v)}
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

export default SalaryRequestModal;
