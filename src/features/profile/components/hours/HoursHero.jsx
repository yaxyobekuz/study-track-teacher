// Icons
import { Coins, Timer } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Tokens
import {
  CHIP,
  DELAY,
  MODE,
  MOTION,
  SURFACE,
  T,
  formatHourNumber,
  metricDelay,
} from "../../data/ledger.tokens";

/**
 * MENING MAOSHIM — jonli sarlavha.
 *
 * ⚠️ SHARTNOMA SHARTI FAQAT KO'RSATILADI. O'qituvchi bu ekranda hech
 * narsani o'zgartira olmaydi: rejimni ham, stavkani ham boshliq
 * belgilaydi (`payroll.assign`). Tahrirlash tugmasi qo'yilsa, odam
 * o'z oyligini o'zi belgilaydigan holatga tushardi.
 *
 * ⚠️ IKKI RAQAM YONMA-YON: "hozirgacha yig'ildi" va "oy oxirida chiqadi".
 * Bittasi ko'rsatilsa, oyning 10-kunidagi past raqam "maosh kamayibdi"
 * deb o'qilardi.
 *
 * ⚠️ HERO FONIDAGI `tide` — bu ekrandagi UZLUKSIZ HARAKATLARNING
 * BIRINCHISI. Ikkinchisi jonli nuqta halqasi. Uchinchisi qo'shilmaydi.
 */
const HoursHero = ({ data, isLoading }) => {
  const mode = MODE[data?.salaryType];
  const isLive = data?.isCurrentMonth;

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-6 xs:px-6")}
      style={{ animationDelay: `${DELAY.header}ms` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(120%_140%_at_88%_-10%,rgba(99,102,241,0.28),transparent_58%)," +
            "radial-gradient(90%_120%_at_-5%_110%,rgba(16,185,129,0.16),transparent_60%)]",
          MOTION.tide,
        )}
      />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={T.labelDark}>Dars soatim</span>
              {isLive && (
                <span className="flex items-center gap-1.5">
                  <span className={MOTION.liveDot}>
                    <span className={MOTION.liveRing} />
                    <span className={MOTION.liveCore} />
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-emerald-300/90">
                    Jonli
                  </span>
                </span>
              )}
            </div>

            <h2 className={cn(T.valueHero, T.size2xl, "mt-2")}>
              {data?.monthLabel ?? "—"}
            </h2>

            {/* Shartnoma sharti — faqat ko'rish */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={cn(CHIP, "bg-white/10 text-white/80")}>
                {mode?.label ?? "Oylik qoidasi belgilanmagan"}
              </span>
              {data?.formulaLabel && (
                <span className={T.formulaDark}>{data.formulaLabel}</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className={T.labelDark}>O'tilgan soat</p>
            <p className={cn(T.valueHero, T.size3xl, "mt-2")}>
              {isLoading ? "—" : formatHourNumber(data?.taughtHours)}
            </p>
            <p className={cn(T.metaDark, "mt-2")}>
              {isLoading
                ? "—"
                : `oy oxirida ${formatHourNumber(data?.hours)}`}
            </p>
          </div>
        </div>

        {/* Oy bo'yicha ulush */}
        <Progress
          taught={data?.taughtHours ?? 0}
          total={data?.hours ?? 0}
          isLoading={isLoading}
        />

        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Tile
            index={0}
            icon={Coins}
            label="Hozirgacha yig'ildi"
            value={formatMoney(data?.accruedAmount)}
            hint="o'tilgan soat bo'yicha"
            isLoading={isLoading}
          />
          <Tile
            index={1}
            icon={Coins}
            label="Oy oxirida"
            value={formatMoney(data?.projectedAmount)}
            hint="jadval o'zgarmasa"
            isLoading={isLoading}
            emphasis
          />
          <Tile
            index={2}
            icon={Timer}
            label="Haftalik yuklama"
            value={formatHourNumber(data?.weeklyHours)}
            hint="jadval bo'yicha"
            isLoading={isLoading}
          />
          <Tile
            index={3}
            icon={Timer}
            label="Qolgan"
            value={formatHourNumber(data?.remainingHours)}
            hint="oy oxirigacha"
            isLoading={isLoading}
          />
        </div>

        {/* Norma — faqat aralash rejimda ma'noli */}
        {data?.salaryType === "mixed" && data?.monthlyHourNorm && (
          <p className={cn(T.metaDark, "mt-4 leading-relaxed")}>
            Oylik norma: {data.monthlyHourNorm} soat.{" "}
            {data.extraHours > 0
              ? `Normadan ${data.extraHours} soat ortiq — qo'shimcha haq hisoblanmoqda.`
              : `Normagacha ${Math.max(0, data.monthlyHourNorm - data.hours)} soat qoldi.`}
          </p>
        )}
      </div>
    </section>
  );
};

/**
 * ⚠️ `width` EMAS, `scaleX`: kenglik animatsiyasi har kadrda layout
 * hisoblatardi.
 */
const Progress = ({ taught, total, isLoading }) => {
  const ratio = total > 0 ? Math.min(1, taught / total) : 0;

  return (
    <div className="mt-6">
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full bg-emerald-400/90", MOTION.bar)}
          style={{
            transform: `scaleX(${isLoading ? 0 : ratio})`,
            transformOrigin: "left",
            animationDelay: `${DELAY.hero + 150}ms`,
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={T.metaDark}>Oy boshi</span>
        <span className="text-[10.5px] font-semibold tabular-nums text-emerald-300/90">
          {isLoading ? "—" : `${Math.round(ratio * 100)}%`}
        </span>
        <span className={T.metaDark}>Oy oxiri</span>
      </div>
    </div>
  );
};

const Tile = ({ icon: Icon, label, value, hint, isLoading, index, emphasis }) => (
  <div
    className={cn(SURFACE.heroTile, MOTION.enter, emphasis && "bg-white/[0.085]")}
    style={{ animationDelay: `${metricDelay(index)}ms` }}
  >
    <div className="flex items-center gap-1.5">
      <Icon className="size-3 text-white/35" strokeWidth={2} />
      <span className={T.labelDark}>{label}</span>
    </div>
    <p className={cn(T.valueHero, T.sizeLg, "mt-2 truncate")}>
      {isLoading ? "—" : value}
    </p>
    {hint && <p className={cn(T.metaDark, "mt-1.5 truncate")}>{hint}</p>}
  </div>
);

export default HoursHero;
