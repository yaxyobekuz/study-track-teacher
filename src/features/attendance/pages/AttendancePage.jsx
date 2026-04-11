// Icons
import { History } from "lucide-react";

// Router
import { Link } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { attendanceAPI } from "../api/attendance.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import CheckInOutCard from "../components/CheckInOutCard";
import ExcuseRequestModal from "../components/ExcuseRequestModal";

const AttendancePage = () => {
  const { openModal } = useModal("excuseRequest");

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: () => attendanceAPI.getToday().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <h1 className="page-title">Davomat</h1>

        {/* History */}
        <Button variant="outline" asChild>
          <Link to="/attendance/my">
            <History />
            Tarix
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <CheckInOutCard todayRecord={data} />
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => openModal("excuseRequest")}
      >
        Uzrli yo'qlik so'rovi
      </Button>

      <ExcuseRequestModal />
    </div>
  );
};

export default AttendancePage;
