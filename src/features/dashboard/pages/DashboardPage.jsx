// Icons
import {
  Clock,
  BookOpen,
  PlusCircle,
  PartyPopper,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

// React
import { useEffect } from "react";

// Router
import { Link } from "react-router-dom";

// Components
import Card from "@/shared/components/ui/Card";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectStore from "@/shared/hooks/useObjectStore";

// Utils
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

const Dashboard = () => {
  // Holiday Info
  const { getEntity } = useObjectStore("holidayCheck");
  const holidayInfo = getEntity("today") || { isHoliday: false, holiday: null };

  return (
    <div className="space-y-4">
      {/* Holiday Banner */}
      {holidayInfo.isHoliday && (
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <PartyPopper
                className="size-8 text-orange-600"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800">
                Bugun "{holidayInfo.holiday?.name}" bayram kuni!
              </h3>
              {holidayInfo.holiday?.description && (
                <p className="text-orange-600 text-sm mt-1">
                  {holidayInfo.holiday.description}
                </p>
              )}
              <p className="text-orange-500 text-sm mt-2">
                Dam olish kunlarida darslar o'tkazilmaydi va baholar qo'yilmaydi
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="space-y-4" title="Tezkor harakatlar">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Grades */}
          <Link
            to="/grades"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList
              className="size-6 text-blue-600 mr-3"
              strokeWidth={1.5}
            />
            <p className="font-medium text-gray-900">Baholar jurnali</p>
          </Link>

          {/* Add Grades */}
          <Link
            to="/attendance"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="size-6 text-blue-600 mr-3" strokeWidth={1.5} />
            <p className="font-medium text-gray-900">Davomat</p>
          </Link>

          {/* Add Grades */}
          <Link
            to="/add-grade"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusCircle
              className="size-6 text-blue-600 mr-3"
              strokeWidth={1.5}
            />
            <p className="font-medium text-gray-900">Baho qo'yish</p>
          </Link>
        </div>
      </Card>

      <MySchedules />
    </div>
  );
};

const MySchedules = () => {
  const today = new Date();
  const dayName = getDayOfWeekUZ(today);

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore("schedules-today");

  const schedules = getCollectionData() || [];
  const loading = isCollectionLoading();

  function fetchTodaySchedule() {
    setCollectionLoadingState(true);

    schedulesAPI
      .getMyToday()
      .then((res) => setCollection(res.data.data, null))
      .catch(() => setCollectionErrorState(true));
  }

  useEffect(() => {
    if (!hasCollection()) initialize(false);
  }, [initialize, hasCollection]);

  useEffect(() => {
    if (!schedules.length) {
      fetchTodaySchedule();
    }
  }, [schedules.length]);

  const allLessons = schedules
    .flatMap((schedule) =>
      schedule.subjects.map((subject, index) => ({
        order: subject.order,
        displayOrder:
          (schedule.startingOrder || 1) + (subject.order || index + 1) - 1,
        subjectName: subject.subject.name,
        className: schedule.class.name,
        startTime: subject.startTime,
        endTime: subject.endTime,
      })),
    )
    .sort((a, b) => a.order - b.order);

  if (dayName === "yakshanba") {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-gray-500">Yuklanmoqda...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Bugungi dars jadvali" className="space-y-4">
      {/* No data */}
      {allLessons.length === 0 && (
        <div className="text-center py-8">
          <BookOpen
            className="size-12 text-gray-300 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Bugun darslar yo'q</p>
        </div>
      )}

      {/* Lessons */}
      {!!allLessons.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {allLessons.map((lesson, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Order */}
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-semibold rounded">
                {lesson.displayOrder}
              </span>

              {/* Subject and Time */}
              <div className="grow">
                <p className="text-sm font-medium text-gray-900 sm:text-base">
                  {lesson.subjectName}
                </p>
                {lesson.startTime && lesson.endTime && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lesson.startTime} - {lesson.endTime}
                  </p>
                )}
              </div>

              {/* Class */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap
                  strokeWidth={1.5}
                  className="hidden size-4 sm:inline-block"
                />
                <span>{lesson.className}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Dashboard;
