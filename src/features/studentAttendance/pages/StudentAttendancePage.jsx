// React
import { useEffect } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { CalendarOff, MapPinOff, TriangleAlert, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import SummaryCards from "../components/SummaryCards";
import MarkToolbar from "../components/MarkToolbar";
import StudentMarkRow from "../components/StudentMarkRow";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import useMarkAttendance from "../hooks/useMarkAttendance";

// Queries
import { studentAttendanceQueries } from "../queries/studentAttendance.queries";
import { useMarkStudentAttendance } from "../queries/studentAttendance.mutations";

// Data
import {
  CLOSED_TITLES,
  lessonLabel,
  classOptionLabel,
} from "../data/studentAttendance.data";

/** "Siz maktabda emassiz — bugun ..." → "Bugun ..." (sarlavha alohida turadi). */
const presenceReason = (message = "") => {
  const reason = message.replace(/^Siz maktabda emassiz\s*—\s*/, "");
  return reason.charAt(0).toUpperCase() + reason.slice(1);
};

/**
 * O'QUVCHILAR DAVOMATI — o'qituvchi o'z darsiga belgilaydi.
 *
 * ⚠️ SINFLAR SERVERDAN: faqat bugun o'zi dars o'tadigan (yoki o'rinbosar
 * bo'lib chiqadigan) sinflar chiqadi. Panel ro'yxatni o'zidan to'ldirmaydi
 * va saqlashda ham serverning qarori ustun — eskirgan ekran begona sinfga
 * tegmaydi.
 *
 * ⚠️ FAQAT BUGUN: o'tgan kunni ma'muriyat to'g'rilaydi, shuning uchun kun
 * tanlagichi ATAYLAB yo'q (baho qo'yishdagi "ochilgan kunlar" bu yerda
 * qo'llanilmaydi — davomat hisobot va jarima maxrajiga ta'sir qiladi).
 *
 * ⚠️ MAKTABDA BO'LISH SHARTI baho qo'yish bilan AYNI: "Men keldim"
 * bosilmagan yoki "Men ketdim" bosilgan bo'lsa ro'yxat KO'RINADI, lekin
 * yozish yopiladi — o'qituvchi nimani ko'rib turganini bilsin.
 *
 * ⚠️ DAVOMAT KUNLIK: bitta o'quvchiga bir kunda bitta yozuv. Shu sabab
 * qatorda KIM belgilagani ko'rsatiladi — boshqaning qarori jimgina bosib
 * ketilmasin.
 */
const StudentAttendancePage = () => {
  const { setField, setFields, selectedClass, search } = useObjectState({
    selectedClass: "",
    search: "",
  });

  const { data: day, isLoading, error } = useQuery(studentAttendanceQueries.day());

  const classes = day?.classes ?? [];
  const activeClassId = selectedClass || classes[0]?.id || "";
  const activeClass = classes.find((cls) => cls.id === activeClassId) ?? null;

  // Jadval o'zgarsa (dars o'rinbosarga berildi) tanlangan sinf ro'yxatdan
  // chiqib ketishi mumkin — u holda birinchi sinfga qaytamiz.
  // ⚠️ Bog'liqlik — sinf ID lari SATRI: `classes` massivi har renderda yangi
  // havola bo'lishi mumkin va effekt bekorga ishlab turardi.
  const classIdsKey = classes.map((cls) => cls.id).join(",");
  useEffect(() => {
    if (selectedClass && classes.length > 0 && !activeClass) {
      setFields({ selectedClass: "", search: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classIdsKey]);

  const {
    data: roster,
    isLoading: rosterLoading,
    dataUpdatedAt,
  } = useQuery(studentAttendanceQueries.roster(activeClassId));

  const people = (roster?.students ?? []).map((row) => ({
    id: row.student.id,
    name: `${row.student.lastName} ${row.student.firstName}`,
    originalStatus: row.attendance?.status ?? null,
    originalNote: row.attendance?.excuseReason ?? "",
    row,
  }));

  // Server javobi yangilanganda tanlov qayta tiklanadi
  const syncKey = roster ? dataUpdatedAt : null;
  const { marks, setStatus, setNote, setAll, dirty, counts } = useMarkAttendance(
    people,
    syncKey,
  );

  // Qidiruv — mijoz tomonda: qator o'zgartirilganda ro'yxatdan yo'qolmaydi
  const query = search.trim().toLowerCase();
  const visible = query
    ? people.filter((p) => p.name.toLowerCase().includes(query))
    : people;

  const { mutate: save, isPending } = useMarkStudentAttendance();

  const canMark = Boolean(day?.canMark);

  const handleSave = () => {
    if (dirty.length === 0) return;

    save(
      {
        classId: activeClassId,
        records: dirty.map((p) => ({
          studentId: p.id,
          status: marks[p.id].status,
          // Izoh ixtiyoriy va har qanday holatda yuboriladi
          excuseReason: marks[p.id].note || "",
        })),
      },
      {
        onSuccess: () => toast.success("Davomat saqlandi"),
        onError: (error) =>
          toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center text-gray-500">Yuklanmoqda...</div>
    );
  }

  // ⚠️ Xato bo'lsa SABABI yoziladi: usiz server "sizda bu huquq yo'q" desa
  // ham ekranda "bugun darsingiz yo'q" turib, odam jadvalni qidirardi
  if (error) {
    return (
      <div className="space-y-4">
        <Header />

        <Card>
          <EmptyState
            icon={TriangleAlert}
            title="Davomat ro'yxatini ochib bo'lmadi"
            description={
              error.response?.data?.message ||
              "Serverga ulanib bo'lmadi — birozdan keyin qayta urinib ko'ring."
            }
          />
        </Card>
      </div>
    );
  }

  // Yakshanba / bayram / ta'til oyi — dars yo'q
  if (day?.closed) {
    return (
      <div className="space-y-4">
        <Header dateLabel={day.dateLabel} />

        <Card>
          <EmptyState
            icon={CalendarOff}
            title={CLOSED_TITLES[day.closed] ?? "Bugun dars yo'q"}
            description={`${day.message} — davomat belgilanmaydi.`}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header dateLabel={day?.dateLabel} />

      {/* Maktabda emas — ro'yxat ko'rinadi, yozish yopiq */}
      {day?.presence && !day.presence.atSchool && (
        <Card className="flex items-start gap-3 border border-red-200 bg-red-50">
          <MapPinOff
            className="mt-0.5 size-6 shrink-0 text-red-600"
            strokeWidth={1.5}
          />
          <div className="space-y-2">
            <p className="font-semibold text-red-700">Siz maktabda emassiz</p>
            <p className="text-sm text-red-700">
              {presenceReason(day.presence.message)}
            </p>
            {day.presence.state === "notArrived" && (
              <Button asChild variant="secondary" size="sm" className="w-fit">
                <Link to="/attendance">Davomatga o&apos;tish</Link>
              </Button>
            )}
          </div>
        </Card>
      )}

      {classes.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Bugun darsingiz yo'q"
            description="Davomat faqat o'zingiz dars o'tadigan sinflarga belgilanadi. Jadvalda bugungi darsingiz bo'lmasa, bu ro'yxat bo'sh turadi."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/schedules">Dars jadvalim</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Sinf tanlovi */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Sinf</p>
            <Select
              value={activeClassId || undefined}
              placeholder="Sinfni tanlang"
              onChange={(value) =>
                setFields({ selectedClass: value, search: "" })
              }
              options={classes.map((cls) => ({
                label: classOptionLabel(cls),
                value: cls.id,
              }))}
            />
          </div>

          {/* Tanlangan sinfning bugungi darslari */}
          {activeClass && (
            <div className="flex flex-wrap gap-1.5">
              {activeClass.lessons.map((lesson) => (
                <span
                  key={lesson.order}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {lessonLabel(lesson)}
                </span>
              ))}
            </div>
          )}

          {rosterLoading ? (
            <div className="py-10 text-center text-gray-500">
              Yuklanmoqda...
            </div>
          ) : people.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title="Bu sinfda bugun o'qiyotgan o'quvchi yo'q"
                description="Ro'yxatda faqat o'qish davri bugunni qamragan o'quvchilar bo'ladi."
              />
            </Card>
          ) : (
            <>
              <SummaryCards summary={counts} />

              <MarkToolbar
                disabled={!canMark}
                dirtyCount={dirty.length}
                isSaving={isPending}
                onSave={handleSave}
                onBulk={(status) =>
                  setAll(
                    status,
                    visible.map((p) => p.id),
                  )
                }
              />

              {people.length > 8 && (
                <Input
                  type="search"
                  value={search}
                  placeholder="Ism yoki familiya bo'yicha qidirish..."
                  onChange={(e) => setField("search", e.target.value)}
                />
              )}

              {visible.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Users}
                    title="Qidiruvga mos o'quvchi topilmadi"
                  />
                </Card>
              ) : (
                <div className="overflow-hidden rounded-2xl bg-white">
                  {visible.map((person, index) => {
                    const mark = marks[person.id] || {};

                    return (
                      <StudentMarkRow
                        key={person.id}
                        row={person.row}
                        index={index + 1}
                        mark={mark}
                        disabled={!canMark}
                        changed={dirty.some((p) => p.id === person.id)}
                        onStatusChange={(status) => setStatus(person.id, status)}
                        onNoteChange={(note) => setNote(person.id, note)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

/** Sarlavha — sana SERVERDAN tayyor matn (`dates.md` §5). */
const Header = ({ dateLabel }) => (
  <div className="flex flex-wrap items-center justify-between gap-2">
    <h1 className="page-title">O&apos;quvchilar davomati</h1>
    {dateLabel && <span className="text-sm text-gray-500">{dateLabel}</span>}
  </div>
);

export default StudentAttendancePage;
