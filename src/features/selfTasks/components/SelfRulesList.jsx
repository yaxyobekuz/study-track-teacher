// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Ban, CalendarClock, Play, Repeat, Trash2 } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Queries
import { selfTasksQueries } from "../queries/selfTasks.queries";
import { useResumeSelfRule } from "../queries/selfTasks.mutations";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

/**
 * O'ZIMNING DOIMIY ISHLARIM — "har dushanba jurnalni tekshirish".
 *
 * ⚠️ QOIDANING O'ZI ISH EMAS: undan server ishlarni VAQTIDAN OLDIN
 * (`leadDays`) yozadi va shu yozilish eslatma bo'ladi. Shuning uchun u
 * ishlar ro'yxatidan ALOHIDA turadi — bir joyda ko'rsatilsa, foydalanuvchi
 * qoidani yakunlamoqchi bo'lardi.
 *
 * ⚠️ Qoida matni (`ruleLabel`) SERVERDAN keladi: panel uni o'zi yig'masa,
 * "nima yozilgan" degan savolga bitta javob bo'ladi.
 */
const SelfRulesList = () => {
  const { openModal } = useModal();
  const [status, setStatus] = useState("active");
  const { data, isLoading } = useQuery(selfTasksQueries.rules({ status }));
  const { mutate: resumeRule } = useResumeSelfRule();

  const rules = data?.data || [];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-800">Doimiy ishlarim</h2>
          <p className="text-xs text-gray-500">Takrorlanadigan ishlar — avtomatik yoziladi</p>
        </div>
        <div className="flex gap-1 rounded-full bg-gray-100 p-0.5">
          {[
            { value: "active", label: "Faol" },
            { value: "stopped", label: "To'xtatilgan" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                status === item.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
      ) : rules.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-8 text-gray-400">
          <Repeat className="size-7" strokeWidth={1.5} />
          <p className="px-6 text-center text-sm">
            {status === "active"
              ? "Doimiy ishingiz yo'q — \"O'zimga belgilash\" da turni \"Asosiy\" qilib tanlang"
              : "To'xtatilgan doimiy ish yo'q"}
          </p>
        </Card>
      ) : (
        <ul className="space-y-2.5">
          {rules.map((rule) => (
            <li key={rule.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-gray-100">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 font-medium leading-snug text-gray-900">{rule.title}</p>
                {!rule.isActive && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    To'xtatilgan
                  </span>
                )}
              </div>

              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Repeat className="size-3.5" />
                {rule.ruleLabel}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {rule.isActive && rule.nextOccurrence && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Keyingisi: {formatDateUz(rule.nextOccurrence, { utc: true })}
                  </span>
                )}
                <span>{rule.generatedCount} ta ish yozilgan</span>
              </div>

              {rule.stopReason && (
                <p className="mt-1 text-xs text-gray-400">Sababi: {rule.stopReason}</p>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-1">
                {rule.isActive ? (
                  <button
                    type="button"
                    onClick={() => openModal("stopSelfTask", { task: rule, mode: "rule" })}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 active:bg-gray-100"
                  >
                    <Ban className="size-3.5" />
                    To'xtatish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      resumeRule(rule.id, {
                        onSuccess: () => toast.success("Doimiy ish qayta yoqildi"),
                        onError: (err) =>
                          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 active:bg-blue-50"
                  >
                    <Play className="size-3.5" />
                    Qayta yoqish
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openModal("deleteSelfTask", { task: rule, mode: "rule" })}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 active:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                  O'chirish
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelfRulesList;
