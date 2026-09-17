// Icons
import {
  Wallet,
  HandCoins,
  Hourglass,
  Clock,
  BadgePercent,
  GraduationCap,
  MinusCircle,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Query
import { useMySalaryStats } from "../queries/salary.queries";
import LiveMonthBreakdown from "./LiveMonthBreakdown";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

/**
 * O'QITUVCHINING O'Z OYLIK STATISTIKASI — bosh sahifa kartasi.
 *
 * Joriy oy oyligi (tarkibi bilan), dars soati (reja / o'tgan / qolgan),
 * stavka, toifa va umumiy (butun tarix) olingan/qarz.
 */

const StatTile = ({ icon: Icon, label, value, sub, tone = "text-gray-900", bg }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
    <span className={`rounded-xl p-2.5 ${bg}`}>
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`truncate text-lg font-bold ${tone}`}>{value}</p>
      {sub && <p className="truncate text-[11px] text-gray-400">{sub}</p>}
    </div>
  </div>
);

const MySalaryCard = () => {
  const { data, isLoading } = useMySalaryStats();

  if (isLoading) {
    return (
      <Card title="Mening oyligim" icon={<Wallet className="size-5 text-indigo-600" />}>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  // Oylik belgilanmagan bo'lsa kartani ko'rsatmaymiz (chalkashlik yaratmaslik uchun)
  if (!data?.hasSalary) return null;

  const c = data.current;
  const h = data.hours;
  const t = data.totals;

  // Oylik tarkibi izohi (soatbay + ustama)
  const parts = [];
  if (Number(c.kpiAmount) > 0) parts.push(`Soatbay ${formatMoney(c.kpiAmount)}`);
  if (Number(c.fixedAmount) > 0) parts.push(`Fiksa ${formatMoney(c.fixedAmount)}`);
  if (Number(c.allowanceAmount) > 0) parts.push(`Ustama ${formatMoney(c.allowanceAmount)}`);

  const deductions = (c.deductions ?? []).filter((d) => Number(d.amount) > 0);
  // To'xtatilgan qismlar — qaysi qism, nima uchun, qancha (serverdan tayyor)
  const suspensions = (c.suspensions ?? []).filter((s) => Number(s.amount) > 0);
  // Tyutor guruhlari — qaysi sinf, necha o'quvchi, qancha (serverdan tayyor)
  const tutorLines = (c.allowanceBreakdown ?? []).filter((line) => line.type === "tutor");

  return (
    <Card title={`Mening oyligim — ${data.monthLabel}`} icon={<Wallet className="size-5 text-indigo-600" />}>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Bu oy oyligi */}
        <StatTile
          icon={Wallet}
          label="Bu oy oyligim"
          value={formatMoney(c.amount)}
          sub={
            // Dars qoldirilgan bo'lsa — qoldirmaganda qancha bo'lardi
            !data.isSealed && Number(data.live?.missedAmount) > 0
              ? `Dars qoldirmaganda: ${formatMoney(data.live.plannedAmount)}`
              : parts.join(" + ") || null
          }
          bg="bg-indigo-50 text-indigo-600"
          tone="text-gray-900"
        />

        {/* Oylik to'xtatildi — qaysi qism va sababi */}
        {Number(c.suspendedAmount) > 0 && (
          <StatTile
            icon={MinusCircle}
            label="Oylik to'xtatildi"
            value={`− ${formatMoney(c.suspendedAmount)}`}
            sub={suspensions.map((s) => `${s.label}: ${s.reason}`).join(", ") || null}
            bg="bg-slate-100 text-slate-600"
            tone="text-slate-700"
          />
        )}

        {/* Ushlab qolindi — sababi bilan (batafsil: Profil → Oylik) */}
        {Number(c.deductionAmount) > 0 && (
          <StatTile
            icon={MinusCircle}
            label="Oylikdan ushlab qolindi"
            value={`− ${formatMoney(c.deductionAmount)}`}
            sub={deductions.map((d) => d.reason).join(", ") || null}
            bg="bg-red-50 text-red-600"
            tone="text-red-600"
          />
        )}

        {/* Bu oy uchun olingani / qolgani */}
        <StatTile
          icon={HandCoins}
          label="Bu oy olganim"
          value={formatMoney(c.paid)}
          sub={
            Number(c.debt) > 0
              ? `Qoldi: ${formatMoney(c.debt)}`
              : "To'liq olindi"
          }
          bg="bg-green-50 text-green-600"
          tone="text-green-700"
        />

        {/* Umumiy qarz (butun tarix) */}
        <StatTile
          icon={Hourglass}
          label="Jami olishim kerak (qarz)"
          value={formatMoney(t.debt)}
          sub={`Jami olingan: ${formatMoney(t.paid)}`}
          bg="bg-amber-50 text-amber-600"
          tone={Number(t.debt) > 0 ? "text-amber-700" : "text-gray-900"}
        />

        {/* Dars soati — o'qituvchi bo'lsa */}
        {h && (
          <>
            <StatTile
              icon={Clock}
              label="Dars soati (bu oy)"
              value={`${h.taught} / ${h.planned} soat`}
              sub={`Qolgan: ${h.remaining} soat · haftasiga ${h.weekly}`}
              bg="bg-blue-50 text-blue-600"
              tone="text-gray-900"
            />

            <StatTile
              icon={BadgePercent}
              label="Soatbay stavka"
              value={`${formatMoney(c.perHourRate)}`}
              sub="1 dars soati narxi"
              bg="bg-violet-50 text-violet-600"
              tone="text-gray-900"
            />

            <StatTile
              icon={GraduationCap}
              label="Toifam"
              value={c.categoryName || "—"}
              sub="Malaka toifasi"
              bg="bg-rose-50 text-rose-600"
              tone="text-gray-900"
            />
          </>
        )}

        {/* O'qituvchi bo'lmasa — lavozim */}
        {!h && c.positionName && (
          <StatTile
            icon={GraduationCap}
            label="Lavozim"
            value={c.positionName}
            bg="bg-rose-50 text-rose-600"
          />
        )}
      </div>

      {/* Dars bo'yicha hisob — vedomost bilan bir xil: qoldirmaganda / ayrilgan / oy oxirida */}
      <LiveMonthBreakdown live={data.live} monthLabel={data.monthLabel} className="mt-3" />

      {/* Tyutor guruhlari uchun qo'shimcha oylik */}
      {tutorLines.length > 0 && (
        <ul className="mt-3 space-y-2">
          {tutorLines.map((line) => (
            <li
              key={line.tutorGroupId ?? line.label}
              className="flex items-start justify-between gap-3 rounded-xl bg-amber-50/60 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{line.label}</p>
                <p className="text-xs text-gray-600">
                  {line.studentCount} o'quvchi × {formatMoney(line.perStudentAmount)} +
                  guruh uchun {formatMoney(line.groupAmount)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-amber-700">
                + {formatMoney(line.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Ushlab qolish sabablari — izohi bilan */}
      {deductions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {deductions.map((d) => (
            <li key={d.id} className="rounded-xl bg-red-50/60 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{d.reason}</p>
                <span className="shrink-0 text-sm font-semibold text-red-600">
                  − {formatMoney(d.amount)}
                </span>
              </div>
              {d.note && <p className="mt-0.5 whitespace-pre-line text-xs text-gray-600">{d.note}</p>}
            </li>
          ))}
        </ul>
      )}

      {!data.isSealed && (
        <p className="mt-3 text-xs text-gray-400">
          Bu — joriy oy uchun taxminiy hisob (dars soatiga qarab o'zgaradi).
          Oy yopilganda summa muhrlanadi.
        </p>
      )}
    </Card>
  );
};

export default MySalaryCard;
