// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { STATUS_LABELS, STATUS_COLORS } from "../data/attendance.data";

const MonthSummary = ({ summary, isLoading }) => {
  if (!summary) return null;

  const items = [
    { key: "present", count: summary?.present },
    { key: "late", count: summary?.late },
    { key: "absent", count: summary?.absent },
    { key: "excused", count: summary?.excused },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map(({ key }) => (
          <div
            key={key}
            className={cn(
              "rounded-xl px-4 py-3 text-center",
              STATUS_COLORS[key],
            )}
          >
            <b className="text-2xl font-bold"></b>
            <p className="text-sm mt-0.5"></p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(({ key, count }) => (
        <div
          key={key}
          className={cn(
            "flex flex-col items-center justify-center h-20 rounded-xl",
            STATUS_COLORS[key],
          )}
        >
          <b className="text-2xl font-bold">{count}</b>
          <p className="text-sm mt-0.5">{STATUS_LABELS[key]}</p>
        </div>
      ))}
    </div>
  );
};

export default MonthSummary;
