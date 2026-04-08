import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { attendanceAPI } from "../api/attendance.api";
import MonthSummary from "../components/MonthSummary";
import AttendanceMonthView from "../components/AttendanceMonthView";
import ExcuseRequestForm from "../components/ExcuseRequestForm";
import { MONTH_OPTIONS } from "../data/attendance.data";

const MyAttendancePage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showExcuseForm, setShowExcuseForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "my", { month, year }],
    queryFn: () => attendanceAPI.getMyHistory(month, year).then((r) => r.data),
  });

  const records = data?.records || [];
  const summary = data?.summary;

  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Mening davomatim</h1>

      {/* Filtrlar */}
      <div className="flex gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="flex-1 h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-blue-500"
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24 h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-blue-500"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <>
          {summary && <MonthSummary summary={summary} />}
          <AttendanceMonthView records={records} month={month} year={year} />
        </>
      )}

      <button
        onClick={() => setShowExcuseForm((prev) => !prev)}
        className="w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm text-gray-600 hover:border-gray-400 transition-colors"
      >
        {showExcuseForm ? "Yopish" : "+ Sababli yo'qlik so'rovi"}
      </button>

      {showExcuseForm && (
        <ExcuseRequestForm onSuccess={() => setShowExcuseForm(false)} />
      )}
    </div>
  );
};

export default MyAttendancePage;
