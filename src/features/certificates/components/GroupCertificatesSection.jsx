// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { CalendarClock, GraduationCap, Pencil } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EditGroupCertificateModal from "./EditGroupCertificateModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { certificatesQueries } from "../queries/certificates.queries";

const COLUMNS = [
  "O'quvchi",
  "Yo'nalish",
  "Muddat",
  "Mavzu progressi",
  { label: "", align: "right" },
];

/**
 * GURUHDAGI SERTIFIKAT REJALARI — guruh rahbari uchun.
 *
 * Tyutor o'z guruhidagi o'quvchilarning rejalarini ko'radi va MUDDAT bilan
 * YO'NALISHNI to'g'rilaydi: o'quvchi formani to'ldirgandan keyin sana
 * surilishi yoki fan o'zgarishi odatiy hol, va buni markaziy adminni
 * kutib turmasdan guruh rahbari qiladi.
 *
 * ⚠️ Faqat TAHRIRLASH: reja qo'shish, bekor qilish va "topshirdi" belgisi
 * ma'muriyatning qarori va bu ekranda yo'q.
 *
 * ⚠️ Rejasi YO'Q o'quvchi ham ro'yxatda qoladi — "kim hali bildirmagan"
 * degan savolga ham javob bo'lishi kerak.
 *
 * ⚠️ Forma to'ldirilgan vaqt bu yerga KELMAYDI (server yubormaydi).
 */
const GroupCertificatesSection = ({ classId }) => {
  const { openModal } = useModal();
  const { data, isLoading } = useQuery(certificatesQueries.group(classId));

  const students = data?.students ?? [];
  const tracks = data?.tracks ?? [];

  const rows = students.flatMap((student) =>
    student.plans.length > 0
      ? student.plans.map((plan) => ({ student, plan }))
      : [{ student, plan: null }],
  );

  const planCount = students.reduce((sum, student) => sum + student.plans.length, 0);
  const withoutPlan = students.filter((student) => student.plans.length === 0).length;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-gray-900">Sertifikat rejalari</h2>
        {!isLoading && students.length > 0 && (
          <p className="text-xs text-gray-500">
            {planCount} ta reja
            {withoutPlan > 0 && ` · ${withoutPlan} o'quvchi hali bildirmagan`}
          </p>
        )}
      </div>

      {isLoading ? (
        <Card className="p-0 xs:p-0">
          <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={GraduationCap} title="Guruhda o'quvchi yo'q" />
        </Card>
      ) : (
        <Table columns={COLUMNS}>
          {rows.map(({ student, plan }) => (
            <Tr key={plan ? plan.id : student.id}>
              <Td className="font-medium text-gray-900">{student.fullName}</Td>

              {plan ? (
                <>
                  <Td>
                    {plan.track.name}
                    {plan.track.subject && (
                      <span className="block text-xs text-gray-400">
                        {plan.track.subject.name}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <DueCell plan={plan} />
                  </Td>

                  <Td nowrap={false}>
                    <ProgressCell progress={plan.progress} />
                  </Td>

                  <Td align="right">
                    {plan.status === "planned" ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Muddat va yo'nalishni to'g'rilash"
                        onClick={() => openModal("editGroupCertificate", { plan, tracks })}
                      >
                        <Pencil className="size-4" strokeWidth={1.75} />
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600">Topshirdi</span>
                    )}
                  </Td>
                </>
              ) : (
                <Td colSpan={4} className="text-gray-400">
                  Sertifikat rejasi bildirilmagan
                </Td>
              )}
            </Tr>
          ))}
        </Table>
      )}

      <EditGroupCertificateModal />
    </section>
  );
};

/**
 * MUDDAT KATAGI.
 *
 * Sana SERVER bergan yorliqdan (`dueDateLabel`): muddat `@db.Date` va UTC
 * yarim tunida yotadi — brauzerda qayta formatlansa manfiy ofsetli
 * mintaqada bir kun orqaga siljirdi.
 */
const DueCell = ({ plan }) => {
  if (!plan.dueDate) {
    return <span className="text-gray-400">Muddati aniq emas</span>;
  }

  const overdue = plan.daysLeft < 0;
  const soon = plan.daysLeft >= 0 && plan.daysLeft <= 30;

  return (
    <div>
      <p className="text-gray-900">{plan.dueDateLabel}</p>
      <p
        className={cn(
          "flex items-center gap-1 text-xs",
          overdue ? "text-red-600" : soon ? "text-amber-600" : "text-gray-500",
        )}
      >
        <CalendarClock className="size-3.5 shrink-0" strokeWidth={1.75} />
        {plan.daysLeftLabel}
      </p>
    </div>
  );
};

/**
 * MAVZU PROGRESSI.
 *
 * ⚠️ Progress bo'lmasa SABABI yoziladi, "—" emas: har sabab boshqa
 * harakat talab qiladi (yo'nalishni fanga bog'lash, mavzu yuklash).
 */
const ProgressCell = ({ progress }) => {
  if (!progress) return <span className="text-gray-400">—</span>;

  if (!progress.available) {
    return <span className="text-xs text-gray-500">{progress.reason}</span>;
  }

  return (
    <div className="min-w-28 space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-gray-900">{progress.percent}%</span>
        <span className="text-xs text-gray-500">
          {progress.reachedTopics} / {progress.totalTopics}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(Math.max(progress.percent, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

export default GroupCertificatesSection;
