// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { STATUS_LABELS, STATUS_COLORS } from "../data/attendance.data";

const AttendanceMonthView = ({ records, month, year }) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  const recordsByDay = {};
  records.forEach((rec) => {
    const day = new Date(rec.date).getUTCDate();
    recordsByDay[day] = rec;
  });

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const emptyCells = Array(firstDayOfMonth).fill(null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dayLabels = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

  return (
    <Card className="rounded-lg !p-0 overflow-hidden">
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="flex items-center justify-center h-10 bg-primary text-xs font-medium text-white py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2 p-4 pt-0 md:gap-4">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {dayCells.map((day) => {
          const rec = recordsByDay[day];
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() + 1 === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              title={rec ? STATUS_LABELS[rec.status] : ""}
              className={cn(
                STATUS_COLORS[rec?.status],
                isToday ? "border-primary" : "border-transparent",
                "flex items-center justify-center text-center rounded-full border-2 aspect-square xs:py-1 xs:aspect-auto",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AttendanceMonthView;
