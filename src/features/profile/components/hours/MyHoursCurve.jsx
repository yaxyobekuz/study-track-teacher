// React
import { useId, useMemo, useState } from "react";

// Icons
import { TrendingUp } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import HoursPanel from "./HoursPanel";

// Tokens
import { HUE, T, formatHourNumber } from "../../data/ledger.tokens";

/**
 * OY BO'YLAB SOAT TO'PLANISHI — qo'lda chizilgan SVG.
 *
 * ⚠️ DIAGRAMMA KUTUBXONASI YO'Q va u qo'shilmaydi ham: bu panelda
 * `recharts` (yoki boshqa) umuman o'rnatilmagan. Kerak bo'lgan narsa —
 * bitta to'planuvchi chiziq va kunlik ustunlar; buning uchun butun
 * kutubxonani olib kelish paketni ikki barobar og'irlashtirardi.
 *
 * ⚠️ ADMIN PANELIDAGI `HoursCurve.jsx` BILAN BIR XIL O'QISH QOIDASI:
 * o'tgan kunlar to'q va uzluksiz, kelgusi kunlar so'niq punktir. Ikki
 * panelda bir xil diagramma boshqacha o'qilsa, odam raqamlarga ishonchini
 * yo'qotardi.
 *
 * ⚠️ `useId()` — gradient identifikatori uchun: ikkita nusxa bir sahifada
 * turganda qattiq yozilgan `id` bo'yoqni chalkashtirardi.
 */
const VIEW = { w: 720, h: 170, padX: 8, padTop: 12, padBottom: 18 };

const MyHoursCurve = ({ data, isLoading, isError, delay = 0 }) => {
  const gradientId = useId();
  const [hover, setHover] = useState(null);

  // ⚠️ `data?.series ?? []` to'g'ridan-to'g'ri bog'liqlikka berilsa, har
  // renderda yangi massiv bo'lib model qayta hisoblanardi.
  const series = useMemo(() => data?.series ?? [], [data]);

  const model = useMemo(() => {
    if (series.length === 0) return null;

    const maxCumulative = Math.max(1, ...series.map((p) => p.cumulative ?? 0));
    const maxDaily = Math.max(1, ...series.map((p) => p.hours));
    const innerW = VIEW.w - VIEW.padX * 2;
    const innerH = VIEW.h - VIEW.padTop - VIEW.padBottom;
    const step = innerW / Math.max(1, series.length - 1);

    const points = series.map((point, index) => ({
      ...point,
      x: VIEW.padX + index * step,
      y: VIEW.padTop + innerH - ((point.cumulative ?? 0) / maxCumulative) * innerH,
      barH: (point.hours / maxDaily) * (innerH * 0.4),
    }));

    const lastPastIndex = points.reduce((acc, p, i) => (p.isPast ? i : acc), -1);
    const toPath = (list) =>
      list
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" ");

    const pastPoints = lastPastIndex >= 0 ? points.slice(0, lastPastIndex + 1) : [];
    const baseY = VIEW.padTop + innerH;

    return {
      points,
      line: toPath(points),
      pastLine: pastPoints.length ? toPath(pastPoints) : null,
      area:
        pastPoints.length > 1
          ? `${toPath(pastPoints)} L${pastPoints[pastPoints.length - 1].x.toFixed(1)},${baseY} L${pastPoints[0].x.toFixed(1)},${baseY} Z`
          : null,
      baseY,
      innerH,
      step,
      lastPastIndex,
    };
  }, [series]);

  const active = hover != null ? model?.points[hover] : null;

  return (
    <HoursPanel
      title="Oy bo'ylab to'planish"
      hint="Ustunlar — kunlik dars, chiziq — jamlanma soat"
      icon={TrendingUp}
      tone="taught"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !model}
      emptyText="Bu oyda dars jadvali bo'yicha soat topilmadi"
      action={
        <div className="text-right">
          <p className={T.label}>{active ? `${active.day}-kun` : "Jami"}</p>
          <p className={cn(T.value, T.sizeMd, "mt-1")}>
            {formatHourNumber(active ? active.cumulative : data?.hours)}
          </p>
        </div>
      }
    >
      {model && (
        <div>
          <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            preserveAspectRatio="none"
            className="h-[170px] w-full"
            role="img"
            aria-label="Oy bo'ylab dars soatlarining to'planishi"
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`${gradientId}-a`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={HUE.line} stopOpacity="0.20" />
                <stop offset="100%" stopColor={HUE.line} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gorizontal yo'riqchilar — vertikal panjara "qafas" qilardi */}
            {[0, 0.33, 0.66, 1].map((ratio) => (
              <line
                key={ratio}
                x1={VIEW.padX}
                x2={VIEW.w - VIEW.padX}
                y1={VIEW.padTop + model.innerH * ratio}
                y2={VIEW.padTop + model.innerH * ratio}
                stroke={HUE.grid}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {model.points.map((p) =>
              p.hours > 0 ? (
                <rect
                  key={`bar-${p.day}`}
                  x={p.x - Math.min(9, model.step * 0.34)}
                  width={Math.min(18, model.step * 0.68)}
                  y={model.baseY - p.barH}
                  height={p.barH}
                  rx="2"
                  fill={p.isPast ? HUE.lineSoft : HUE.future}
                  opacity={p.isPast ? 0.75 : 0.55}
                />
              ) : null,
            )}

            {model.area && <path d={model.area} fill={`url(#${gradientId}-a)`} />}

            <path
              d={model.line}
              fill="none"
              stroke={HUE.future}
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {model.pastLine && (
              <path
                d={model.pastLine}
                fill="none"
                stroke={HUE.line}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {model.lastPastIndex >= 0 &&
              model.lastPastIndex < model.points.length - 1 && (
                <circle
                  cx={model.points[model.lastPastIndex].x}
                  cy={model.points[model.lastPastIndex].y}
                  r="3.5"
                  fill="#fff"
                  stroke={HUE.line}
                  strokeWidth="2.4"
                  vectorEffect="non-scaling-stroke"
                />
              )}

            {model.points.map((p, index) => (
              <rect
                key={`hit-${p.day}`}
                x={p.x - model.step / 2}
                width={model.step}
                y={0}
                height={VIEW.h}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
              />
            ))}

            {active && (
              <line
                x1={active.x}
                x2={active.x}
                y1={VIEW.padTop - 4}
                y2={model.baseY}
                stroke={HUE.axis}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* O'q yorliqlari HTML'da — SVG matnini cho'zmaslik uchun */}
          <div className="mt-1.5 flex items-center justify-between px-1">
            <span className={T.meta}>1-kun</span>
            <span className={T.meta}>
              {data?.isCurrentMonth ? "Bugun" : "O'rtasi"}
            </span>
            <span className={T.meta}>{series.length}-kun</span>
          </div>
        </div>
      )}
    </HoursPanel>
  );
};

export default MyHoursCurve;
