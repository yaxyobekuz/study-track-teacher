// Icons
import { Plus } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import MyRequestsList from "../components/MyRequestsList";
import SalaryRequestModal from "../components/SalaryRequestModal";

const SalaryRequestsPage = () => {
  const { openModal } = useModal();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-title">Oylik so'rovlari</h1>
        <Button onClick={() => openModal("salaryRequest")}>
          <Plus className="size-4" /> Yangi so'rov
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Oylik yoki stavkangizni ko'rib chiqishni so'rash uchun ariza yuboring.
        Kerakli hujjatni (sertifikat, diplom, buyruq) biriktiring — administrator
        ko'rib chiqadi.
      </p>

      <MyRequestsList />

      <SalaryRequestModal />
    </div>
  );
};

export default SalaryRequestsPage;
