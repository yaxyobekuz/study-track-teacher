// React
import { useMemo, useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { testSeasonsAPI } from "@/features/tests/api/testSeasons.api";
import { teacherAssignmentsAPI } from "@/features/assignments/api/teacherAssignments.api";

// Components
import Card from "@/shared/components/ui/Card";
import SelectField from "@/shared/components/ui/select/SelectField";

// Utils
import { formatScore } from "@/shared/utils/formatScore";

const SCHOOL = "__school__";

/**
 * O'qituvchi uchun mavsum statistikasi va sinf darajalari boshqaruvi.
 */
const TeacherStatsView = ({ season, user }) => {
  // O'qituvchining shu mavsumdagi biriktiruvlari
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments", "my", season._id],
    queryFn: () =>
      teacherAssignmentsAPI
        .getMy({ season: season._id })
        .then((res) => res.data.data),
  });

  // Maktab (umumiy) + biriktirilgan sinflar
  const classOptions = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      if (a.class && !map.has(a.class._id)) {
        map.set(a.class._id, { label: a.class.name, value: a.class._id });
      }
    }
    return [
      { label: "Maktab (umumiy)", value: SCHOOL },
      ...map.values(),
    ];
  }, [assignments]);

  const [selectedClass, setSelectedClass] = useState(SCHOOL);
  const isSchool = selectedClass === SCHOOL;

  const { data: classStats = [], isLoading } = useQuery({
    queryKey: ["season-class-stats", season._id, selectedClass],
    queryFn: () =>
      (isSchool
        ? testSeasonsAPI.getStats(season._id)
        : testSeasonsAPI.getClassStats(season._id, selectedClass)
      ).then((res) => res.data.data),
    enabled: Boolean(selectedClass),
  });

  return (
    <div className="space-y-4">
      {/* Sinf tanlash */}
      <Card>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <SelectField
              searchable
              label="Sinf"
              value={selectedClass}
              onChange={setSelectedClass}
              options={classOptions}
              placeholder="Sinfni tanlang"
              searchPlaceholder="Sinfni qidirish..."
              emptyText="Sinf topilmadi"
              triggerClassName="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Stats jadvali */}
      {isLoading ? (
        <Card>
          <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
        </Card>
      ) : classStats.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-10">Hali natijalar yo'q</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 px-3 font-medium w-12">#</th>
                  <th className="py-2 px-3 font-medium">O'quvchi</th>
                  <th className="py-2 px-3 font-medium">Topshirgan</th>
                  <th className="py-2 px-3 font-medium">Biriktirilgan</th>
                  <th className="py-2 px-3 font-medium">O'rtacha ball</th>
                </tr>
              </thead>
              <tbody>
                {classStats.map((r) => (
                  <tr
                    key={r.student._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2.5 px-3 text-gray-500">
                      {isSchool ? r.rank : r.classRank}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">
                      {r.student.firstName} {r.student.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {r.resultCount}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {r.assignedCount}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">
                      {formatScore(r.averageScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherStatsView;
