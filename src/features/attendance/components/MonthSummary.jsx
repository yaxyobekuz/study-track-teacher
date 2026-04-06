import { STATUS_LABELS, STATUS_COLORS } from "../data/attendance.data";

/**
 * Oylik davomat statistikasi
 * @param {{ summary: { present: number, late: number, absent: number, excused: number } }} props
 */
const MonthSummary = ({ summary }) => {
  if (!summary) return null;

  const items = [
    { key: "present", count: summary.present },
    { key: "late", count: summary.late },
    { key: "absent", count: summary.absent },
    { key: "excused", count: summary.excused },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ key, count }) => (
        <div
          key={key}
          className={`rounded-xl px-4 py-3 text-center ${STATUS_COLORS[key]}`}
        >
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-sm mt-0.5">{STATUS_LABELS[key]}</p>
        </div>
      ))}
    </div>
  );
};

export default MonthSummary;
