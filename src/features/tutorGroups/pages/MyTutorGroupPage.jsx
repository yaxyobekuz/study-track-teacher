// React
import { useState } from "react";

// Router
import { useNavigate, useParams } from "react-router-dom";

// Icons
import {
  ArrowLeft,
  CalendarCheck,
  GraduationCap,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import StatTile from "@/features/profile/components/StatTile";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import {
  ATTENDANCE_STATUS_META,
  GROUP_STATUS_META,
  STUDENT_COLUMNS,
  SUBJECT_COLUMNS,
  buildMonthOptions,
  currentMonthKey,
  percentClass,
} from "../data/tutorGroups.data";
import { tutorGroupsQueries } from "../queries/tutorGroups.queries";

const formatPercent = (value) => (value == null ? "—" : `${value}%`);
const formatGrade = (value) => (value == null ? "—" : String(value));

/**
 * GURUH MANZARASI (tyutorning o'zi uchun) — o'quvchilar, bugungi va oylik
 * davomat, baholar hamda shu guruh uchun qo'shimcha oylik.
 *
 * Oylik davomat foizi davomat hisobotining O'ZIDAN keladi — admin panel bilan
 * bir xil raqam chiqadi.
 */
const MyTutorGroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonthKey());

  const { data, isLoading, isError, isFetching } = useQuery(
    tutorGroupsQueries.overview(groupId, month),
  );

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (isError || !data) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-gray-500">Guruh topilmadi</p>
        <Button onClick={() => navigate("/tutor-groups")}>Orqaga</Button>
      </div>
    );
  }

  const { group, today, attendance, grades, payroll, students } = data;
  const status = GROUP_STATUS_META[group.status];

  return (
    <div className="space-y-4">
      {/* Sarlavha */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button variant="ghost" onClick={() => navigate("/tutor-groups")}>
            <ArrowLeft strokeWidth={1.5} />
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="page-title">{group.className} guruhi</h1>
              {status && (
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", status.className)}>
                  {status.label}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{group.periodLabel}</p>
          </div>
        </div>

        <div className="w-48">
          <Select
            value={String(month)}
            onChange={(v) => setMonth(Number(v))}
            options={buildMonthOptions(12)}
          />
        </div>
      </div>

      {/* Ko'rsatkichlar */}
      <div
        className={cn(
          "grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-5",
          isFetching && "opacity-70",
        )}
      >
        <StatTile icon={Users} label="O'quvchilar" value={students.length} />
        <StatTile
          icon={UserCheck}
          label={`Bugun (${formatDateUz(today.date)})`}
          value={`${today.summary.came} / ${today.summary.total}`}
          hint={`Kelmadi: ${today.summary.absent} · sababli: ${today.summary.excused} · belgilanmagan: ${today.summary.unmarked}`}
        />
        <StatTile
          icon={CalendarCheck}
          label={`Davomat · ${data.monthLabel}`}
          value={formatPercent(attendance.percent)}
          valueClassName={percentClass(attendance.percent)}
          hint={`${attendance.came} / ${attendance.expected} kun · ${attendance.schoolDays} o'quv kuni`}
        />
        <StatTile
          icon={GraduationCap}
          label={`O'rtacha baho · ${data.monthLabel}`}
          value={formatGrade(grades.average)}
          hint={`${grades.count} ta baho`}
        />
        <StatTile
          icon={Wallet}
          label="Qo'shimcha oylik"
          value={formatMoney(payroll.sealed?.amount ?? payroll.liveAmount)}
          hint={
            payroll.sealed
              ? `${data.monthLabel} oyligida muhrlangan${
                  payroll.sealed.studentCount != null
                    ? ` (${payroll.sealed.studentCount} o'quvchi)`
                    : ""
                }`
              : `${students.length} × ${formatMoney(group.perStudentAmount)} + ${formatMoney(group.groupAmount)}`
          }
        />
      </div>

      {/* Kunlar kesimida davomat */}
      {attendance.byDay.length > 0 && (
        <Card title="Kunlar kesimida davomat">
          <div className="mt-3 flex flex-wrap gap-2">
            {attendance.byDay.map((day) => (
              <div
                key={day.date}
                className="min-w-20 rounded-xl border border-gray-100 px-2.5 py-1.5 text-center"
              >
                <p className="text-xs text-gray-500">
                  {formatDateUz(day.date, { hideYear: true })}
                </p>
                <p className={cn("text-sm font-semibold", percentClass(day.percent))}>
                  {formatPercent(day.percent)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* O'quvchilar */}
      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">O'quvchilar</h2>

        {students.length === 0 ? (
          <Card className="p-0 xs:p-0">
            <EmptyState icon={Users} title="Guruhda o'quvchi yo'q" />
          </Card>
        ) : (
          <Table columns={STUDENT_COLUMNS}>
            {students.map((student, index) => {
              const todayMeta = ATTENDANCE_STATUS_META[student.today.status ?? "unmarked"];
              const att = student.attendance;

              return (
                <Tr key={student.id}>
                  <Td className="text-gray-400">{index + 1}</Td>
                  <Td className="font-medium text-gray-900">{student.fullName}</Td>
                  <Td>
                    <span
                      title={student.today.excuseReason || undefined}
                      className={cn("rounded-md px-2 py-0.5 text-xs font-medium", todayMeta.className)}
                    >
                      {todayMeta.label}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className={cn("font-medium", percentClass(att?.percent))}>
                      {formatPercent(att?.percent)}
                    </span>
                    {att && (
                      <span className="block text-xs text-gray-400">
                        {att.came} / {att.expected} kun
                      </span>
                    )}
                  </Td>
                  <Td align="right" className={att?.missed > 0 ? "text-red-600" : "text-gray-400"}>
                    {att ? att.missed : "—"}
                  </Td>
                  <Td align="right" className="text-gray-500">
                    {att ? att.late : "—"}
                  </Td>
                  <Td align="right">
                    <span className="font-medium text-gray-900">
                      {formatGrade(student.grades.average)}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {student.grades.count} ta baho
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </section>

      {/* Fanlar bo'yicha baholar */}
      {grades.bySubject.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">Fanlar bo'yicha baholar</h2>

          <Table columns={SUBJECT_COLUMNS}>
            {grades.bySubject.map((subject) => (
              <Tr key={subject.subjectId}>
                <Td className="font-medium text-gray-900">{subject.subjectName}</Td>
                <Td align="right">{formatGrade(subject.average)}</Td>
                <Td align="right" className="text-gray-500">
                  {subject.count}
                </Td>
              </Tr>
            ))}
          </Table>
        </section>
      )}
    </div>
  );
};

export default MyTutorGroupPage;
