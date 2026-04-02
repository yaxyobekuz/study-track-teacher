// UI
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// React
import { useEffect } from "react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectStore from "@/shared/hooks/useObjectStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Icons
import { CalendarOff, Trash2, Loader2 } from "lucide-react";

// Helpers
import { getGradeColor } from "@/shared/helpers/grade.helpers";

// API
import { gradesAPI } from "@/features/grades/api/grades.api";
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

const AddGrade = () => {
  const {
    loading,
    subjects,
    students,
    setField,
    setFields,
    searchQuery,
    todayClasses,
    currentTopic,
    selectedClass,
    loadingStudentId,
    selectedSubjectWithOrder,
  } = useObjectState({
    subjects: [],
    students: [],
    loading: false,
    searchQuery: "",
    todayClasses: [],
    selectedClass: "",
    currentTopic: null,
    loadingStudentId: null,
    selectedSubjectWithOrder: "",
  });

  // Holiday Info
  const { getEntity } = useObjectStore("holidayCheck");
  const holidayInfo = getEntity("today") || { isHoliday: false, holiday: null };

  // Fetch today's classes from schedule
  useEffect(() => {
    schedulesAPI
      .getMyToday()
      .then((res) => {
        const classes = res.data.data.map((schedule) => schedule.class);
        setField("todayClasses", classes);
      })
      .catch((error) => {
        toast.error("Bugungi dars jadvalini yuklashda xatolik");
        console.error(error);
      });
  }, []);

  // Load saved selections from localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem("addGrade_selectedClass");
    const savedSubjectWithOrder = localStorage.getItem(
      "addGrade_selectedSubjectWithOrder",
    );

    if (savedClass) setField("selectedClass", savedClass);
    if (savedSubjectWithOrder)
      setField("selectedSubjectWithOrder", savedSubjectWithOrder);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTeacherSubjects();
      setFields({
        selectedSubjectWithOrder: "",
        students: [],
        searchQuery: "",
      });
      localStorage.setItem("addGrade_selectedClass", selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubjectWithOrder) {
      fetchStudentsWithGrades();
      setField("searchQuery", "");
      localStorage.setItem(
        "addGrade_selectedSubjectWithOrder",
        selectedSubjectWithOrder,
      );
    }
  }, [selectedClass, selectedSubjectWithOrder]);

  const fetchTeacherSubjects = async () => {
    try {
      const response = await gradesAPI.getTeacherSubjects(selectedClass);
      if (response.data.message && response.data.data.length === 0) {
        toast.info(response.data.message);
      }
      const data = response.data.data;
      setField("subjects", data);

      // Auto-select first subject
      if (data.length > 0) {
        setField("selectedSubjectWithOrder", `${data[0]._id}_${data[0].order}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Fanlarni yuklashda xatolik",
      );
      console.error(error);
    }
  };

  const fetchStudentsWithGrades = async (showLoader = true) => {
    if (!selectedSubjectWithOrder) return;

    // Parse subjectId and lessonOrder from "subjectId_order" format
    const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

    if (showLoader) setField("loading", true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await gradesAPI.getStudentsWithGrades({
        classId: selectedClass,
        subjectId: subjectId,
        lessonOrder: lessonOrder,
        date: today,
      });
      setFields({
        students: response.data.data,
        currentTopic: response.data.currentTopic || null,
      });
    } catch (error) {
      toast.error("O'quvchilarni yuklashda xatolik");
      console.error(error);
    } finally {
      setField("loading", false);
    }
  };

  const handleGradeChange = async (student, gradeValue) => {
    if (gradeValue === "") return;

    const hasGrade = student.grade !== null;
    const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

    setField("loadingStudentId", student._id);
    try {
      if (hasGrade) {
        await gradesAPI.update(student.grade._id, {
          grade: parseInt(gradeValue),
          comment: student.grade.comment || "",
        });
      } else {
        await gradesAPI.create({
          studentId: student._id,
          subjectId,
          classId: selectedClass,
          lessonOrder: parseInt(lessonOrder),
          grade: parseInt(gradeValue),
          comment: "",
        });
      }

      await fetchStudentsWithGrades(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
    } finally {
      setField("loadingStudentId", null);
    }
  };

  const handleDeleteGrade = async (student) => {
    setField("loadingStudentId", student._id);
    try {
      await gradesAPI.delete(student.grade._id);
      await fetchStudentsWithGrades(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
    } finally {
      setField("loadingStudentId", null);
    }
  };

  if (holidayInfo.isHoliday) {
    return (
      <Card className="text-center py-12">
        <CalendarOff
          className="w-16 h-16 text-orange-500 mx-auto mb-4"
          strokeWidth={1.5}
        />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Bugun dam olish kuni
        </h2>
        <p className="text-gray-600 mb-2 font-medium">
          {holidayInfo.holiday?.name}
        </p>
        {holidayInfo.holiday?.description && (
          <p className="text-gray-500 text-sm">
            {holidayInfo.holiday.description}
          </p>
        )}
        <p className="text-orange-600 mt-4">
          Dam olish kunlarida baho qo'yish mumkin emas
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="page-title">Baho qo'yish</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          required
          label="Sinf"
          value={selectedClass}
          onChange={(value) => setField("selectedClass", value)}
          options={todayClasses.map((cls) => ({
            label: cls.name,
            value: cls._id,
          }))}
        />

        <Select
          required
          label="Fan"
          value={selectedSubjectWithOrder}
          onChange={(value) => setField("selectedSubjectWithOrder", value)}
          options={subjects.map((subject) => {
            const displayOrder =
              (subject.startingOrder || 1) + (subject.order || 1) - 1;
            return {
              label: `${displayOrder}. ${subject.name}`,
              value: `${subject._id}_${subject.order}`,
            };
          })}
        />
      </div>

      {/* Current Topic Display */}
      {selectedClass && selectedSubjectWithOrder && currentTopic && (
        <Card className="mb-4 space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentTopic.name}
          </h3>

          {currentTopic.description && (
            <p className="text-gray-600">{currentTopic.description}</p>
          )}
        </Card>
      )}

      {/* Students Table */}
      {selectedClass && selectedSubjectWithOrder && (
        <div className="rounded-lg overflow-hidden">
          {/* No data */}
          {students.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Bu sinfda o'quvchilar yo'q</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Yuklanmoqda...</p>
            </div>
          )}

          {/* Students Table */}
          {students.length > 0 && !loading && (
            <>
              <Input
                className="mb-4"
                value={searchQuery}
                placeholder="Qidirish..."
                onChange={(e) => setField("searchQuery", e.target.value)}
              />

              <div className="rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Thead */}
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left max-sm:hidden">#</th>
                      <th className="px-6 py-3 text-left">O'quvchi</th>
                      <th className="px-6 py-3 text-left">Baho</th>
                    </tr>
                  </thead>

                  {/* Tbody */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students
                      .sort((a, b) => a.firstName.localeCompare(b.firstName))
                      .filter((student) => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        const fullName =
                          `${student.firstName} ${student.lastName}`.toLowerCase();
                        return fullName.includes(q);
                      })
                      .map((student, index) => {
                        const hasGrade = student.grade !== null;
                        const isRowLoading = loadingStudentId === student._id;

                        return (
                          <tr key={student._id} className="hover:bg-gray-50">
                            {/* Index */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-sm:hidden">
                              {index + 1}
                            </td>

                            {/* Student */}
                            <td className="px-4 py-4 whitespace-nowrap xs:px-6">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} <br className="xs:hidden" />{" "}
                                {student.lastName}
                              </div>
                            </td>

                            {/* Grade */}
                            <td className="px-6 py-4 whitespace-nowrap max-sm:pl-0">
                              <div className="flex items-center gap-2">
                                {isRowLoading ? (
                                  <div className="flex items-center justify-center w-40 h-10">
                                    <Loader2
                                      className="size-6 text-indigo-600 animate-spin"
                                      strokeWidth={2}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <Select
                                      value={
                                        hasGrade
                                          ? String(student.grade.grade)
                                          : ""
                                      }
                                      onChange={(value) =>
                                        handleGradeChange(student, value)
                                      }
                                      disabled={isRowLoading}
                                      placeholder="Bahoni tanlang"
                                      triggerClassName={cn(
                                        "w-40",
                                        hasGrade
                                          ? getGradeColor(student.grade.grade)
                                          : "",
                                      )}
                                      options={[
                                        { label: "5 - A'lo", value: "5" },
                                        { label: "4 - Yaxshi", value: "4" },
                                        { label: "3 - Qoniqarli", value: "3" },
                                        { label: "2 - Qoniqarsiz", value: "2" },
                                        { label: "1 - Yomon", value: "1" },
                                      ]}
                                    />

                                    {hasGrade && (
                                      <Button
                                        variant="danger"
                                        className="size-10"
                                        disabled={isRowLoading}
                                        onClick={() =>
                                          handleDeleteGrade(student)
                                        }
                                      >
                                        <Trash2 strokeWidth={1.5} />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            Baho qo'yish uchun sinf va fan tanlang
          </p>
        </div>
      )}
    </div>
  );
};

export default AddGrade;
