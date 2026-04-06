import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from "../data/attendance.data";

/**
 * Oylik davomat kalendar ko'rinishi
 * @param {{ records: Object[], month: number, year: number }} props
 */
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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Kun sarlavhalari */}
      <div className="grid grid-cols-7 mb-2">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Kunlar */}
      <div className="grid grid-cols-7 gap-1">
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
              className={`relative flex flex-col items-center rounded-lg p-1.5 ${
                isToday ? "ring-2 ring-blue-400" : ""
              }`}
              title={rec ? `${STATUS_LABELS[rec.status]}` : ""}
            >
              <span
                className={`text-sm ${
                  isToday ? "font-bold text-blue-600" : "text-gray-700"
                }`}
              >
                {day}
              </span>

              {rec ? (
                <span
                  className={`mt-0.5 inline-block size-2 rounded-full ${STATUS_DOT_COLORS[rec.status]}`}
                />
              ) : (
                <span className="mt-0.5 inline-block size-2 rounded-full bg-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Izoh */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`inline-block size-2 rounded-full ${STATUS_DOT_COLORS[key]}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AttendanceMonthView;
