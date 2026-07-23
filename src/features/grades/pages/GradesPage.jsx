// Toast
import { toast } from "sonner";

// Helpers
import {
  getGradeColor,
  getGradeForSubject,
  calculateAverageGrade,
} from "@/shared/helpers/grade.helpers";

// React
import { useState, useEffect } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Eye, Calendar, Download } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";

// Queries
import { gradesQueries } from "@/features/grades/queries/grades.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// API
import { gradesAPI } from "@/features/grades/api/grades.api";
import Button from "@/shared/components/form/button";
import { useNavigate } from "react-router-dom";

const Grades = () => {
  // Load saved filters from localStorage
  const getSavedFilters = () => {
    const savedClassId = localStorage.getItem("grades_classId");
    const savedSubjectId = localStorage.getItem("grades_subjectId");
    const savedDate = localStorage.getItem("grades_date");

    return {
      classId: savedClassId || "",
      subjectId: savedSubjectId || "all",
      date: savedDate || new Date().toISOString().split("T")[0],
    };
  };

  const [filters, setFilters] = useState(getSavedFilters());

  // Classes and subjects reference data
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();

  // Students with their grades for the selected class/date
  const { data: students = [], isLoading } = useQuery(
    gradesQueries.classDate(filters.classId, filters.date),
  );

  // Subjects scheduled for the selected class/date (table columns)
  const { data: todaySubjects = [] } = useQuery(
    gradesQueries.scheduleSubjects(filters.classId, filters.date),
  );

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("grades_classId", filters.classId);
    localStorage.setItem("grades_subjectId", filters.subjectId);
    localStorage.setItem("grades_date", filters.date);
  }, [filters]);

  const navigate = useNavigate();

  const handleExport = async () => {
    try {
      const response = await gradesAPI.exportGrades(
        filters.classId,
        filters.date,
        filters.subjectId,
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const className =
        classes.find((c) => c.id === filters.classId)?.name || "Sinf";
      link.download = `${className}_baholar_${filters.date}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fayl muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error(error.message || "Eksport qilishda xatolik yuz berdi");
    }
  };

  if (isLoading && !filters.classId) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <Card className="grid grid-cols-1 gap-5 mb-6 md:grid-cols-3">
        <Select
          required
          label="Sinf"
          value={filters.classId}
          onChange={(value) => setFilters({ ...filters, classId: value })}
          options={classes.map((cls) => ({ label: cls.name, value: cls.id }))}
        />

        <Select
          required
          label="Fan"
          value={filters.subjectId}
          onChange={(v) => setFilters({ ...filters, subjectId: v })}
          options={[
            { label: "Barchasi", value: "all" },
            ...subjects.map((subject) => ({
              label: subject.name,
              value: subject.id,
            })),
          ]}
        />

        <Input
          required
          label="Sana"
          type="date"
          value={filters.date}
          onChange={(v) => setFilters({ ...filters, date: v })}
        />
      </Card>

      {/* Grades View */}
      {!filters.classId && !isLoading && (
        <Card className="text-center">
          <Calendar
            className="w-12 h-12 text-blue-600 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-blue-800 text-lg">
            Baholarni ko'rish uchun kerakli maydonlarni tanlang
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && filters.classId && (
        <Card className="text-center">
          <p className="text-gray-500">Yuklanmoqda...</p>
        </Card>
      )}

      {/* No data */}
      {students.length === 0 && !isLoading && filters.classId && (
        <Card className="text-center">
          <Eye
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Tanlangan kun uchun baholar topilmadi</p>
        </Card>
      )}

      {/* Grades */}
      {students.length > 0 && (
        <Card responsive>
          <div className="rounded-lg overflow-x-auto">
            <table className="divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">O'quvchi</th>

                  {/* Subject */}
                  {filters.subjectId !== "all" && (
                    <>
                      <th className="px-6 py-3 text-center">Baho</th>
                      <th className="px-6 py-3 text-left">O'qituvchi</th>
                    </>
                  )}

                  {/* All subjects */}
                  {filters.subjectId === "all" && (
                    <>
                      {todaySubjects.map((subject, index) => (
                        <th
                          className="px-4 py-3 text-center"
                          key={`${subject.lessonOrder}-${subject.id}`}
                        >
                          {index + 1}. {subject.name}
                        </th>
                      ))}

                      <th className="px-6 py-3 text-center">O'rtacha</th>
                    </>
                  )}
                </tr>
              </thead>

              {/* Tbody */}
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((studentData, index) => {
                  const relevantGrades =
                    filters.subjectId !== "all"
                      ? studentData.grades.filter(
                          (g) => g.subject.id === filters.subjectId,
                        )
                      : studentData.grades;

                  return (
                    <tr
                      key={studentData.student.id}
                      className="hover:bg-gray-50"
                    >
                      {/* Index */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {studentData.student.firstName}{" "}
                          {studentData.student.lastName}
                        </div>
                      </td>

                      {/* Single subject */}
                      {filters.subjectId !== "all" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {relevantGrades.length > 0 ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                  relevantGrades[0].grade,
                                )}`}
                              >
                                {relevantGrades[0].grade}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {relevantGrades.length > 0 ? (
                              <span className="text-sm text-gray-600">
                                {relevantGrades[0].teacher.firstName}{" "}
                                {relevantGrades[0].teacher.lastName}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* All subjects */}
                      {filters.subjectId == "all" && (
                        <>
                          {(() => {
                            // Fan takrorlanish indekslarini hisoblash
                            const subjectOccurrences = {};

                            return todaySubjects.map((subject) => {
                              const subjectIdStr = subject.id.toString();

                              // Bu fanning nechanchi marta takrorlanishini hisoblash
                              if (!subjectOccurrences[subjectIdStr]) {
                                subjectOccurrences[subjectIdStr] = 0;
                              }
                              const occurrenceIndex =
                                subjectOccurrences[subjectIdStr];
                              subjectOccurrences[subjectIdStr]++;

                              const grade = getGradeForSubject(
                                studentData.grades,
                                subject.id,
                                occurrenceIndex,
                              );

                              return (
                                <td
                                  key={`${subject.lessonOrder}-${subject.id}`}
                                  className="px-4 py-4 whitespace-nowrap text-center"
                                >
                                  {grade ? (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                                        grade.grade,
                                      )}`}
                                      title={
                                        grade.comment
                                          ? `Izoh: ${grade.comment}`
                                          : ""
                                      }
                                    >
                                      {grade.grade}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      -
                                    </span>
                                  )}
                                </td>
                              );
                            });
                          })()}

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {studentData.grades.length > 0 ? (
                              <span className="text-sm font-semibold text-blue-900">
                                {calculateAverageGrade(studentData.grades)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {students.length > 0 && (
        <div className="flex justify-end gap-5 mt-6">
          {/* Export Button */}
          <Button
            disabled={!filters.classId || !filters.date}
            variant="default"
            onClick={handleExport}
            className="gap-3.5 px-3.5"
          >
            <Download className="size-4" strokeWidth={1.5} />
            Baholarni yuklash
          </Button>

          <Button
            variant="danger"
            className="gap-3.5 px-3.5"
            onClick={() => navigate("/grades/missing")}
          >
            <Eye className="size-4" strokeWidth={1.5} />
            Qo'yilmagan baholar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Grades;
