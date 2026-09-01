// Icons
import { Plus } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import MyRequestsList from "../components/MyRequestsList";
import PayrollRequestModal from "../components/PayrollRequestModal";

const PayrollRequestsPage = () => {
  const { openModal } = useModal();

  return (
    <div className="space-y-4">
      {/* Sarlavha + yangi zayavka */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-title">Oylik zayavkalari</h1>
        <Button onClick={() => openModal("payrollRequest")}>
          <Plus className="size-4" /> Yangi zayavka
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Malaka toifangizni o'zgartirish yoki ustama haq so'rash uchun zayavka
        yuboring. Kerakli hujjatni (sertifikat, diplom, buyruq) biriktiring —
        administrator ko'rib chiqadi.
      </p>

      <MyRequestsList />

      <PayrollRequestModal />
    </div>
  );
};

export default PayrollRequestsPage;
