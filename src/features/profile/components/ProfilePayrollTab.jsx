// Icons
import { MinusCircle, Wallet, CirclePause } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import StatTile from "./StatTile";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  ENTRY_STATUS_META,
  PAYROLL_ENTRY_COLUMNS,
  PAYROLL_RULE_COLUMNS,
  buildPayrollTiles,
  formatDeductionValue,
  getRuleStatus,
  allowanceLineLabel,
} from "../data/profile.data";
import { profileQueries } from "../queries/profile.queries";

/**
 * MENING OYLIGIM — "qancha olaman va qanchasi hali to'lanmagan".
 *
 * Tab FAQAT O'QISH uchun: oylikni belgilash, to'lash va bekor qilish
 * ma'muriyatning "Xodimlar oyligi" bo'limida. Bu yerda xodim o'z holatini
 * ko'radi, xolos.
 *
 * Ikkita so'rov ATAYLAB: qoida (qancha) va majburiyat (har oy nima
 * hisoblangani) — ikki xil narsa. Qoida to'g'rilansa o'tgan oy majburiyati
 * o'zgarmaydi, chunki uning summasi MUHRLANGAN.
 */
const ProfilePayrollTab = () => {
  const {
    data: salary,
    isLoading: isSalaryLoading,
    isError: isSalaryError,
  } = useQuery(profileQueries.salary());
  const {
    data: entries,
    isLoading: isEntriesLoading,
    isError: isEntriesError,
  } = useQuery(profileQueries.payroll());
  // Ixtiyoriy bo'lim — yuklanmasa oylik tabi baribir ishlaydi
  const { data: suspensions } = useQuery(profileQueries.suspensions());
  // Ushlab qolishlar — alohida so'rov: yiqilsa ham oylik jadvali ko'rinaveradi
  const { data: deductions } = useQuery(profileQueries.deductions());

  if (isSalaryLoading || isEntriesLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  if (isSalaryError || isEntriesError) {
    return (
      <Card className="text-center">
        <p className="text-sm text-red-500">Oylik ma'lumotini yuklab bo'lmadi</p>
      </Card>
    );
  }

  const rules = salary?.items ?? [];
  const items = entries?.items ?? [];
  const currentMonth = salary?.currentMonth;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {buildPayrollTiles({ salary, entries }).map((tile) => (
          <StatTile key={tile.key} {...tile} />
        ))}
      </div>

      {rules.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Oylik belgilanmagan"
            description="Sizga hali oylik qoidasi belgilanmagan. Oylik belgilansa, har oy majburiyat avtomatik hisoblanadi va shu yerda ko'rinadi."
          />
        </Card>
      ) : (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">Oylik qoidalari</h2>

          <Table columns={PAYROLL_RULE_COLUMNS}>
            {rules.map((rule) => {
              const badge = getRuleStatus(rule, currentMonth);

              return (
                <Tr key={rule.id}>
                  {/* Qoidada bitta summa yo'q: fiksa, soat narxi va ustamalar alohida */}
                  <Td align="right" nowrap={false} className="font-medium text-gray-900">
                    {Number(rule.fixedAmount) > 0 && (
                      <span className="block">{formatMoney(rule.fixedAmount)}</span>
                    )}
                    {Number(rule.effectiveRate) > 0 && (
                      <span className="block">{formatMoney(rule.effectiveRate)} × soat</span>
                    )}
                    {!(Number(rule.fixedAmount) > 0) && !(Number(rule.effectiveRate) > 0) && "—"}
                    {(rule.allowanceBreakdown ?? []).map((item, index) => (
                      <span key={`${item.label}-${index}`} className="block text-xs font-normal text-amber-600">
                        + {item.label}
                        {item.type === "percent" ? ` · ${item.value}%` : `: ${formatMoney(item.amount)}`}
                      </span>
                    ))}
                  </Td>

                  <Td nowrap={false} className="text-gray-500">
                    {rule.periodLabel}
                    {rule.note && (
                      <span className="block text-xs text-gray-400">
                        {rule.note}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </section>
      )}

      {deductions?.items?.length > 0 && (
        <DeductionsSection deductions={deductions} />
      )}

      {suspensions?.items?.length > 0 && <SuspensionsSection suspensions={suspensions} />}

      {items.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">Oylik majburiyatlari</h2>

          <Table columns={PAYROLL_ENTRY_COLUMNS}>
            {items.map((entry) => {
              // To'liq to'xtatilgan oy (0 so'm) serverda "paid" — "To'langan" deb
              // ko'rsatilsa yolg'on bo'lardi
              const badge =
                Number(entry.amount) === 0 &&
                Number(entry.paidAmount) === 0 &&
                Number(entry.suspendedAmount) > 0
                  ? { label: "To'xtatilgan", className: "bg-slate-200 text-slate-700" }
                  : ENTRY_STATUS_META[entry.status];

              return (
                <Tr key={entry.id}>
                  <Td nowrap={false} className="font-medium text-gray-900">
                    {entry.monthLabel}
                    {/* Ustamalar (tyutor guruhlari ham) — muhrlangan tafsilot */}
                    {entry.allowanceBreakdown?.map((item, index) => (
                      <span
                        key={`${item.label}-${index}`}
                        className="block text-xs font-normal text-amber-600"
                      >
                        + {allowanceLineLabel(item)}: {formatMoney(item.amount)}
                      </span>
                    ))}
                    {/* To'xtatilgan qism — shu oy hisoblanmagan, sababi bilan */}
                    {entry.suspensionBreakdown
                      ?.filter((item) => Number(item.amount) > 0)
                      .map((item, index) => (
                        <span
                          key={`suspension-${item.id ?? index}`}
                          className="block text-xs font-normal text-red-600"
                        >
                          − To'xtatildi: {item.label}
                          {item.reason ? ` (${item.reason})` : ""}: {formatMoney(item.amount)}
                        </span>
                      ))}
                  </Td>

                  {/* Hisoblangan summadan allaqachon ayirilgan */}
                  <Td
                    align="right"
                    className={
                      Number(entry.deductionAmount) > 0
                        ? "text-red-600"
                        : "text-gray-400"
                    }
                  >
                    {Number(entry.deductionAmount) > 0
                      ? `− ${formatMoney(entry.deductionAmount)}`
                      : "—"}
                  </Td>

                  <Td align="right">{formatMoney(entry.amount)}</Td>

                  <Td align="right" className="text-green-600">
                    {formatMoney(entry.paidAmount)}
                  </Td>

                  <Td
                    align="right"
                    className={cn(
                      "font-medium",
                      Number(entry.debt) > 0 ? "text-red-600" : "text-gray-400",
                    )}
                  >
                    {formatMoney(entry.debt)}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        badge?.className ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {badge?.label ?? entry.statusLabel}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </section>
      )}
    </div>
  );
};

/**
 * OYLIKDAN USHLAB QOLISHLAR — nima uchun (sabab + izoh), qancha va qaysi oyda.
 *
 * ⚠️ Summa muhrlangan oyda AYNAN ushlangani, joriy shakllanmagan oyda
 * "hisoblanmoqda" (oy yopilguncha dars soatiga qarab o'zgarishi mumkin).
 */
const DeductionsSection = ({ deductions }) => (
  <section className="space-y-3">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-semibold text-gray-900">Oylikdan ushlab qolishlar</h2>
      {Number(deductions.totals?.withheld) > 0 && (
        <p className="text-sm text-gray-500">
          Jami ushlangan:{" "}
          <span className="font-medium text-red-600">
            {formatMoney(deductions.totals.withheld)}
          </span>
        </p>
      )}
    </div>

    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {deductions.items.map((item) => (
        <li key={item.id}>
          <Card className="h-full space-y-3">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-red-50 p-2 text-red-600">
                <MinusCircle className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{item.reason}</p>
                {item.note && (
                  <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">
                    {item.note}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {formatDeductionValue(item.type, item.value)} · {item.periodLabel}{" "}
                  · {item.createdAtLabel}
                </p>
              </div>
              {item.status === "cancelled" && (
                <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  Bekor qilingan
                </span>
              )}
            </div>

            {item.months.length > 0 ? (
              <ul className="space-y-1">
                {item.months.map((month) => (
                  <li
                    key={month.month}
                    className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="text-gray-700">
                      {month.monthLabel}
                      {!month.sealed && (
                        <span className="ml-1.5 text-xs text-gray-400">
                          hisoblanmoqda
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-red-600">
                      {month.noRate ? "soat narxi yo'q — ushlanmadi" : `− ${formatMoney(month.amount)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">
                Hali birorta oy oyligidan ushlanmagan
              </p>
            )}

            {item.cancelReason && (
              <p className="text-xs text-gray-500">
                Bekor qilish sababi: {item.cancelReason}
              </p>
            )}
          </Card>
        </li>
      ))}
    </ul>
  </section>
);

/**
 * TO'XTATILGAN OYLIK — qaysi oy, oylikning qaysi qismi, NIMA UCHUN (sabab +
 * izoh) va qancha. Ma'muriyat oylikni (yoki uning bir qismini) bekor qilsa,
 * xodim buxgalteriyaga emas, shu yerga qaraydi.
 *
 * ⚠️ Summa muhrlangan oyda aynan to'xtatilgani, joriy shakllanmagan oyda
 * "hisoblanmoqda". Bekor qilingan to'xtatish — oylik qaytgan.
 */
const SuspensionsSection = ({ suspensions }) => (
  <section className="space-y-3">
    <h2 className="font-semibold text-gray-900">To'xtatilgan oylik</h2>

    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {suspensions.items.map((item) => (
        <li key={item.id}>
          <Card className="h-full space-y-3">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <CirclePause className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{item.componentLabel}</p>
                <p className="mt-0.5 text-sm text-gray-700">Sabab: {item.reason}</p>
                {item.note && (
                  <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">{item.note}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {item.periodLabel} · {item.createdAtLabel}
                </p>
              </div>
              {item.status === "cancelled" && (
                <span className="shrink-0 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  Bekor qilingan — oylik qaytgan
                </span>
              )}
            </div>

            {item.months.length > 0 && (
              <ul className="space-y-1 border-t border-gray-100 pt-2 text-sm">
                {item.months.map((m) => (
                  <li key={m.month} className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">
                      {m.monthLabel}
                      {!m.sealed && <span className="ml-1 text-xs text-gray-400">(hisoblanmoqda)</span>}
                    </span>
                    <span className="font-medium text-red-600">− {formatMoney(m.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </li>
      ))}
    </ul>
  </section>
);

export default ProfilePayrollTab;
