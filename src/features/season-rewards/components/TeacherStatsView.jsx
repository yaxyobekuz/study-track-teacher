// React
import { useMemo, useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { BarChart3, Settings2 } from "lucide-react";

// API
import { testSeasonsAPI } from "@/features/test-seasons/api/testSeasons.api";
import { teacherAssignmentsAPI } from "@/features/assignments/api/teacherAssignments.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import ClassTiersInlineForm from "./ClassTiersInlineForm";

// Utils
import { cn } from "@/shared/utils/cn";

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

  // Unique sinflar
  const classOptions = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      if (a.class && !map.has(a.class._id)) {
        map.set(a.class._id, { label: a.class.name, value: a.class._id });
      }
    }
    return [...map.values()];
  }, [assignments]);

  const [selectedClass, setSelectedClass] = useState("");
  const [showTiers, setShowTiers] = useState(false);

  const { data: classStats = [], isLoading } = useQuery({
    queryKey: ["season-class-stats", season._id, selectedClass],
    queryFn: () =>
      testSeasonsAPI
        .getClassStats(season._id, selectedClass)
        .then((res) => res.data.data),
    enabled: Boolean(selectedClass),
  });

  if (classOptions.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center py-10 text-center">
          <BarChart3 size={40} className="text-gray-300" />
          <p className="mt-3 text-gray-600">
            Ushbu mavsumda sizga biriktirilgan sinflar yo'q.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sinf tanlash */}
      <Card>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <SelectField
              label="Sinf"
              value={selectedClass}
              onChange={setSelectedClass}
              options={classOptions}
              placeholder="Sinfni tanlang"
              triggerClassName="w-full"
            />
          </div>
          {selectedClass && (
            <Button
              variant="outline"
              onClick={() => setShowTiers(!showTiers)}
              className="gap-2"
            >
              <Settings2 size={16} />
              {showTiers ? "Yashirish" : "O'rinlar"}
            </Button>
          )}
        </div>
      </Card>

      {/* Sinf tier konfiguratsiyasi */}
      {selectedClass && showTiers && (
        <Card>
          <ClassTiersInlineForm
            season={season}
            classId={selectedClass}
            className={
              classOptions.find((o) => o.value === selectedClass)?.label ||
              "Sinf"
            }
          />
        </Card>
      )}

      {/* Stats jadvali */}
      {!selectedClass ? (
        <Card>
          <p className="text-center text-gray-500 py-10">
            Sinfni tanlang
          </p>
        </Card>
      ) : isLoading ? (
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
                  <th className="py-2 px-3 font-medium">Testlar</th>
                  <th className="py-2 px-3 font-medium">Umumiy ball</th>
                </tr>
              </thead>
              <tbody>
                {classStats.map((r) => (
                  <tr
                    key={r.student._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2.5 px-3 text-gray-500">{r.classRank}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">
                      {r.student.firstName} {r.student.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {r.resultCount}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">
                      {r.totalScore}
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
