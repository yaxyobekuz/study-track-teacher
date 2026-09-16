// UI
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// React
import { useEffect } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Router
import { Link } from "react-router-dom";

// Icons
import {
  CalendarOff,
  CalendarClock,
  MapPinOff,
  Trash2,
  Loader2,
} from "lucide-react";

// Helpers
import { getGradeColor } from "@/shared/helpers/grade.helpers";

// Queries
import { gradesQueries } from "@/features/grades/queries/grades.queries";
import {
  useCreateGrade,
  useUpdateGrade,
  useDeleteGrade,
} from "@/features/grades/queries/grades.mutations";
import { useTodayHoliday } from "@/features/holidays/queries/holidays.queries";

/** Kun tanlovidagi "Bugun" — Radix `Select` bo'sh satrni qabul qilmaydi. */
const TODAY = "today";

/** "Siz maktabda emassiz — bugun ..." → "Bugun ..." (sarlavha alohida turadi). */
const presenceReason = (message = "") => {
  const reason = message.replace(/^Siz maktabda emassiz\s*—\s*/, "");
  return reason.charAt(0).toUpperCase() + reason.slice(1);
};

/**
 * BAHO QO'YISH.
 *
 * ⚠️ BUGUNGI DARSGA — FAQAT MAKTABDA: bugun "Men keldim" bosilmagan yoki
 * "Men ketdim" bosilgan bo'lsa server "Siz maktabda emassiz" deb rad etadi.
 * Sahifa buni oldindan aytadi (`myAccess.presence`), jadvalni esa yopadi.
 *
 * ⚠️ O'TGAN KUNGA — FAQAT BOSHLIQ OCHGAN KUNLARGA: kun tanlovida faqat
 * baho qo'yilmagan darsi bor ochiq kunlar chiqadi (server oylik hisobidan
 * oladi). Bu kunlarga istalgan joydan baho qo'yiladi va qo'yilgan baho
 * darsni o'tilgan qiladi.
 */
const AddGrade = () => {
  const {
    setField,
    setFields,
    searchQuery,
    selectedDay,
    selectedClass,
    loadingStudentId,
    selectedSubjectWithOrder,
  } = useObjectState({
    searchQuery: "",
    selectedDay: TODAY,
    selectedClass: "",
    loadingStudentId: null,
    selectedSubjectWithOrder: "",
  });

  const isPastDay = selectedDay !== TODAY;
  // API uchun sana: o'tgan kun — "YYYY-MM-DD", bugun — berilmaydi
  const pastDate = isPastDay ? selectedDay : undefined;

  // Holiday Info
  const { data: holidayInfo = { isHoliday: false, holiday: null } } =
    useTodayHoliday();

  // Maktabdami + boshliq ochgan kunlar
  const { data: access } = useQuery(gradesQueries.myAccess());
  const openDays = access?.days ?? [];
  const activeDay = openDays.find((day) => day.date === selectedDay) ?? null;
  const notAtSchool = Boolean(access?.presence && !access.presence.atSchool);

  // Today's classes from the teacher's schedule
  const { data: todayClasses = [] } = useQuery(gradesQueries.myTodayClasses());

  // O'tgan kunda sinflar — shu kunning baho qo'yilmagan darslaridan
  const classOptions = isPastDay
    ? [
        ...new Map(
          (activeDay?.lessons ?? []).map((l) => [
            l.classId,
            { id: l.classId, name: l.className },
          ]),
        ).values(),
      ]
    : todayClasses;

  // Subjects the teacher teaches in the selected class
  const { data: teacherSubjectsData } = useQuery(
    gradesQueries.teacherSubjects(selectedClass, pastDate),
  );
  const subjects = teacherSubjectsData?.data ?? [];

  // Parse subjectId and lessonOrder from "subjectId_order" format
  const [subjectId, lessonOrder] = selectedSubjectWithOrder.split("_");

  // Students of the class with their grade for the chosen subject/lessonOrder
  const {
    data: studentsData,
    isLoading: loading,
    isFetching: studentsFetching,
  } = useQuery(
    gradesQueries.studentsWithGrades({
      classId: selectedClass,
      subjectId,
      lessonOrder,
      date: pastDate ?? new Date().toISOString().split("T")[0],
    }),
  );
  const students = studentsData?.data ?? [];
  const currentTopic = studentsData?.currentTopic ?? null;

  // Mutations
  const { mutate: createGrade } = useCreateGrade();
  const { mutate: updateGrade } = useUpdateGrade();
  const { mutate: deleteGrade } = useDeleteGrade();

  // Ochiq kun yopilsa (muddati tugadi yoki hamma darsiga baho qo'yildi) — bugunga qaytadi
  useEffect(() => {
    if (isPastDay && access && !activeDay) {
      setFields({
        selectedDay: TODAY,
        selectedClass: "",
        selectedSubjectWithOrder: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  // Load saved selections from localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem("addGrade_selectedClass");
    const savedSubjectWithOrder = localStorage.getItem(
      "addGrade_selectedSubjectWithOrder",
    );

    if (savedClass) setField("selectedClass", savedClass);
    if (savedSubjectWithOrder)
      setField("selectedSubjectWithOrder", savedSubjectWithOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the selected class when it changes (faqat bugungi — o'tgan kun vaqtincha)
  useEffect(() => {
    if (selectedClass && !isPastDay) {
      localStorage.setItem("addGrade_selectedClass", selectedClass);
    }
  }, [selectedClass, isPastDay]);

  // Persist the selected subject when it changes
  useEffect(() => {
    if (selectedClass && selectedSubjectWithOrder && !isPastDay) {
      localStorage.setItem(
        "addGrade_selectedSubjectWithOrder",
        selectedSubjectWithOrder,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjectWithOrder]);

  // React to the teacher's subjects for the selected class
  useEffect(() => {
    if (!teacherSubjectsData) return;

    if (teacherSubjectsData.message && subjects.length === 0) {
      toast.info(teacherSubjectsData.message);
    }

    // Auto-select the first subject when none is selected
    if (subjects.length > 0 && !selectedSubjectWithOrder) {
      setField(
        "selectedSubjectWithOrder",
        `${subjects[0].id}_${subjects[0].order}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherSubjectsData]);

  // Keep the row spinner up until the post-write refetch settles, mirroring the
  // old "await fetchStudentsWithGrades()" behavior.
  useEffect(() => {
    if (loadingStudentId !== null && !studentsFetching) {
      setField("loadingStudentId", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsFetching]);

  const handleGradeChange = (student, gradeValue) => {
    if (gradeValue === "") return;

    const hasGrade = student.grade !== null;

    setField("loadingStudentId", student.id);

    const onError = (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      console.error(error);
      setField("loadingStudentId", null);
    };

    if (hasGrade) {
      updateGrade(
        {
          id: student.grade.id,
          data: {
            grade: parseInt(gradeValue),
            comment: student.grade.comment || "",
          },
        },
        { onError },
      );
    } else {
      createGrade(
        {
          studentId: student.id,
          subjectId,
          classId: selectedClass,
          lessonOrder: parseInt(lessonOrder),
          grade: parseInt(gradeValue),
          comment: "",
          ...(pastDate ? { date: pastDate } : {}),
        },
        { onError },
      );
    }
  };

  const handleDeleteGrade = (student) => {
    setField("loadingStudentId", student.id);
    deleteGrade(student.grade.id, {
      onError: (error) => {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        console.error(error);
        setField("loadingStudentId", null);
      },
    });
  };

  /** Ochiq kundagi darsni bir bosishda tanlash: kun, sinf va fan birga. */
  const pickLesson = (day, lesson) =>
    setFields({
      selectedDay: day.date,
      selectedClass: lesson.classId,
      selectedSubjectWithOrder: `${lesson.subjectId}_${lesson.lessonOrder}`,
      searchQuery: "",
    });

  // Bugungi darslarga baho qo'yib bo'lmaydigan holat — jadval yopiladi
  const todayBlocked = !isPastDay && (holidayInfo.isHoliday || notAtSchool);

  if (holidayInfo.isHoliday && openDays.length === 0) {
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

      {/* Kun — faqat boshliq ochgan kunlar bo'lsa */}
      {openDays.length > 0 && (
        <Select
          label="Kun"
          value={selectedDay}
          onChange={(value) =>
            setFields({
              selectedDay: value,
              selectedClass: "",
              selectedSubjectWithOrder: "",
              searchQuery: "",
            })
          }
          options={[
            { label: "Bugun", value: TODAY },
            ...openDays.map((day) => ({
              label: `${day.dateLabel}, ${day.dayName} — ${day.lessons.length} ta dars`,
              value: day.date,
            })),
          ]}
        />
      )}

      {/* Maktabda emas — bugungi darsga baho qo'yib bo'lmaydi */}
      {!isPastDay && notAtSchool && (
        <Card className="flex items-start gap-3 border border-red-200 bg-red-50">
          <MapPinOff
            className="mt-0.5 size-6 shrink-0 text-red-600"
            strokeWidth={1.5}
          />
          <div className="space-y-2">
            <p className="font-semibold text-red-700">Siz maktabda emassiz</p>
            {/* Sarlavha takrorlanmasin: server xabari API xatosi uchun ham ishlatiladi */}
            <p className="text-sm text-red-700">
              {presenceReason(access.presence.message)}
            </p>
            {access.presence.state === "notArrived" && (
              <Button asChild variant="secondary" size="sm" className="w-fit">
                <Link to="/attendance">Davomatga o'tish</Link>
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Bugun dam olish kuni, lekin ochiq kunlar bor */}
      {!isPastDay && holidayInfo.isHoliday && (
        <Card className="flex items-start gap-3 bg-orange-50">
          <CalendarOff
            className="mt-0.5 size-6 shrink-0 text-orange-500"
            strokeWidth={1.5}
          />
          <p className="text-sm text-orange-700">
            Bugun dam olish kuni: {holidayInfo.holiday?.name}. Bugungi darslarga
            baho qo'yilmaydi.
          </p>
        </Card>
      )}

      {/* Boshliq ochgan kunlar — baho qo'yilmagan darslar */}
      {openDays.length > 0 && (!isPastDay || activeDay) && (
        <OpenDaysCard
          days={isPastDay ? [activeDay] : openDays}
          isPastDay={isPastDay}
          selectedClass={selectedClass}
          selectedSubjectWithOrder={selectedSubjectWithOrder}
          onPick={pickLesson}
        />
      )}

      {/* Filters */}
      {!todayBlocked && (
        <div className="grid grid-cols-2 gap-4">
          <Select
            required
            label="Sinf"
            value={selectedClass}
            onChange={(value) =>
              setFields({
                selectedClass: value,
                selectedSubjectWithOrder: "",
                searchQuery: "",
              })
            }
            options={classOptions.map((cls) => ({
              label: cls.name,
              value: cls.id,
            }))}
          />

          <Select
            required
            label="Fan"
            value={selectedSubjectWithOrder}
            onChange={(value) =>
              setFields({ selectedSubjectWithOrder: value, searchQuery: "" })
            }
            options={subjects.map((subject) => {
              const displayOrder = subject.order || 1;
              return {
                label: `${displayOrder}. ${subject.name}`,
                value: `${subject.id}_${subject.order}`,
              };
            })}
          />
        </div>
      )}

      {/* Current Topic Display */}
      {!todayBlocked &&
        selectedClass &&
        selectedSubjectWithOrder &&
        currentTopic && (
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
      {!todayBlocked && selectedClass && selectedSubjectWithOrder && (
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
                type="search"
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
                        const isRowLoading = loadingStudentId === student.id;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
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
                                      className="size-6 text-blue-600 animate-spin"
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

      {!todayBlocked && !selectedClass && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            Baho qo'yish uchun sinf va fan tanlang
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * OCHIQ KUNLAR — boshliq baho qo'yishni ochgan kunlardagi baho qo'yilmagan
 * darslar. Darsga bosilsa kun, sinf va fan birga tanlanadi.
 */
const OpenDaysCard = ({
  days,
  isPastDay,
  selectedClass,
  selectedSubjectWithOrder,
  onPick,
}) => {
  const total = days.reduce((sum, day) => sum + day.lessons.length, 0);

  return (
    <Card className="space-y-3 border border-indigo-100 bg-indigo-50/60">
      <div className="flex items-start gap-3">
        <CalendarClock
          className="mt-0.5 size-5 shrink-0 text-indigo-600"
          strokeWidth={1.8}
        />
        <div>
          <p className="font-semibold text-indigo-900">
            {isPastDay
              ? `${days[0].dateLabel} darslariga baho qo'yyapsiz`
              : `Boshliq o'tgan kunlarga baho qo'yishni ochdi — ${total} ta dars`}
          </p>
          <p className="text-sm text-indigo-700">
            {isPastDay
              ? `${days[0].expiresAtLabel} gacha ochiq. Baho qo'yilgan dars o'tilgan hisoblanadi.`
              : "Baho qo'yilmagan darslar. Bosing — kun, sinf va fan tanlanadi."}
          </p>
        </div>
      </div>

      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {days.map((day) => (
          <li key={day.date} className="space-y-1">
            {!isPastDay && (
              <p className="text-xs font-medium text-indigo-800">
                {day.dateLabel}, {day.dayName} · {day.expiresAtLabel} gacha
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {day.lessons.map((lesson) => {
                const selected =
                  isPastDay &&
                  selectedClass === lesson.classId &&
                  selectedSubjectWithOrder ===
                    `${lesson.subjectId}_${lesson.lessonOrder}`;

                return (
                  <button
                    key={`${lesson.classId}-${lesson.lessonOrder}`}
                    type="button"
                    onClick={() => onPick(day, lesson)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-indigo-100",
                    )}
                  >
                    {lesson.lessonOrder}-dars · {lesson.className} ·{" "}
                    {lesson.subjectName}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AddGrade;
