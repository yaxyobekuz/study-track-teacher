// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { attendanceAPI } from "../api/attendance.api";

// Data
import { MONTH_OPTIONS } from "../data/attendance.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import MonthSummary from "../components/MonthSummary";
import Button from "@/shared/components/ui/button/Button";
import ExcuseRequestModal from "../components/ExcuseRequestModal";
import AttendanceMonthView from "../components/AttendanceMonthView";
import SelectField from "@/shared/components/ui/select/SelectField";

const MyAttendancePage = () => {
  const now = new Date();
  const { state, setField } = useObjectState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const { openModal } = useModal("excuseRequest");

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "my", { month: state.month, year: state.year }],
    queryFn: () =>
      attendanceAPI.getMyHistory(state.month, state.year).then((r) => r.data),
  });

  const records = data?.records || [];
  const summary = data?.summary;

  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => ({
    value: currentYear - i,
    label: String(currentYear - i),
  }));

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="page-title">Mening davomatim</h1>

      {/* Filters */}
      <div className="flex gap-4">
        <SelectField
          value={state.month}
          className="max-w-48"
          options={MONTH_OPTIONS}
          onChange={(val) => setField("month", val)}
        />

        <SelectField
          value={state.year}
          className="max-w-48"
          options={yearOptions}
          onChange={(val) => setField("year", val)}
        />
      </div>

      <MonthSummary isLoading={isLoading} summary={summary} />

      <AttendanceMonthView
        records={records}
        year={state.year}
        month={state.month}
        isLoading={isLoading}
      />

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

export default MyAttendancePage;
