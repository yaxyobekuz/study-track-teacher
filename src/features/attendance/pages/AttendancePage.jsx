import { useQuery } from "@tanstack/react-query";
import { attendanceAPI } from "../api/attendance.api";
import CheckInOutCard from "../components/CheckInOutCard";

const AttendancePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: () => attendanceAPI.getToday().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Davomat</h1>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <CheckInOutCard todayRecord={data} />
      )}
    </div>
  );
};

export default AttendancePage;
