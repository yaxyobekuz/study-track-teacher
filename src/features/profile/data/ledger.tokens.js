/**
 * "LEDGER" — DARS SOATI PANELINING DIZAYN TILI (o'qituvchi paneli).
 *
 * ⚠️ ADMIN PANELIDAGI `features/lessonHours/data/ledger.tokens.js` NING
 * NUSXASI va bu ATAYLAB: panellar alohida repo, umumiy paket yo'q.
 * Import qilib bo'lmaydi, shuning uchun qiymatlar AYNAN bir xil bo'lishi
 * shart — bitta odam ikki panelda bir xil ekranni ko'radi va rang yoki
 * o'lcham farq qilsa, u ikki xil mahsulot bo'lib qolardi.
 *
 * ⚠️ Bu yerda ADMINDAGIDAN KAMROQ token bor: o'qituvchi paneli faqat O'Z
 * ma'lumotini ko'rsatadi (vedomost, reyting va rejim taqsimoti yo'q).
 * Kerak bo'lmagan token ko'chirilmaydi — nusxa qanchalik kichik bo'lsa,
 * ikkalasi shunchalik kam ajraladi.
 *
 * ⚠️ `dark:` VARIANT YOZILMAYDI. Panelda `ThemeProvider` yo'q va `.dark`
 * sinfi hech qachon qo'yilmaydi; qolgan barcha ekranlar ham `bg-white`
 * bilan yozilgan.
 */

/** Maosh rejimi — server `SalaryType` enumining ko'zgusi. */
export const MODE = {
  fixed: {
    key: "fixed",
    label: "Fiksa",
    short: "Fiksa",
    hint: "Oyiga qat'iy summa — dars soati summaga ta'sir qilmaydi",
    chip: "bg-slate-100 text-slate-700",
    hex: "#475569",
  },
  hourly: {
    key: "hourly",
    label: "Soatbay",
    short: "Soatbay",
    hint: "Har bir o'tilgan akademik soat uchun",
    chip: "bg-indigo-50 text-indigo-700",
    hex: "#4F46E5",
  },
  mixed: {
    key: "mixed",
    label: "Fiksa + ortiqcha soat",
    short: "Aralash",
    hint: "Bazaviy oylik + normadan ortig'i uchun stavka",
    chip: "bg-amber-50 text-amber-800",
    hex: "#B45309",
  },
};

/** Diagramma ranglari — HEX, chunki Tailwind sinfi SVG atributiga yetmaydi. */
export const HUE = {
  line: "#4F46E5",
  lineSoft: "#A5B4FC",
  future: "#CBD5E1",
  grid: "#E2E8F0",
  axis: "#94A3B8",
  given: "#BE123C",
  taken: "#047857",
};

export const SURFACE = {
  /** Sahifa zamini — chegarasiz karta faqat shu farq bilan ko'rinadi. */
  page: "bg-[#F4F5F7]",

  card:
    "relative overflow-hidden bg-white rounded-[18px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.13)] " +
    "transition-[box-shadow,transform] duration-300 ease-out-quint",

  hero:
    "relative overflow-hidden rounded-[18px] " +
    "bg-[linear-gradient(150deg,#0B1220_0%,#151E2E_46%,#080D16_100%)] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.20),0_24px_60px_-24px_rgba(15,23,42,0.55)]",

  heroTile: "rounded-2xl bg-white/[0.05] px-4 py-3.5",
  tile: "rounded-2xl bg-slate-50/80 px-4 py-3.5",
  tileHover: "transition-colors duration-200 ease-out-quint hover:bg-slate-100/80",

  /** Ajratgich — chiziq emas, tipografik rels. */
  rule: "h-px flex-1 bg-slate-200",
};

export const RAIL = {
  base: "absolute inset-y-0 left-0 w-[3px] origin-top",
  draw: "motion-safe:animate-rail-draw",
  tone: {
    planned: "bg-slate-300",
    taught: "bg-indigo-500",
    accrued: "bg-amber-500",
    settled: "bg-emerald-500",
    given: "bg-rose-400",
  },
};

export const T = {
  title: "text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900",
  hint: "text-[11px] font-normal leading-snug text-slate-500",

  label: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-slate-400",
  labelDark: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-white/45",

  value: "font-semibold tabular-nums tracking-[-0.02em] text-slate-900",
  valueHero: "font-semibold tabular-nums tracking-[-0.03em] text-white",
  size3xl: "text-[38px] leading-none",
  size2xl: "text-[28px] leading-none",
  sizeXl: "text-[21px] leading-none",
  sizeLg: "text-[17px] leading-none",
  sizeMd: "text-[14.5px] leading-none",

  meta: "text-[10.5px] font-medium text-slate-500",
  metaDark: "text-[10.5px] font-medium text-white/50",

  td: "text-[12.5px] text-slate-600",
  tdName: "text-[12.5px] font-medium text-slate-900",
  tdNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",

  formula: "font-mono text-[11px] tracking-tight text-slate-500",
  formulaDark: "font-mono text-[11px] tracking-tight text-white/60",
};

export const CHIP =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
  "text-[10.5px] font-medium leading-none whitespace-nowrap";

/**
 * ⚠️ UZLUKSIZ HARAKAT IKKITA: `tide` (hero foni) va jonli nuqta halqasi.
 * Uchinchisi qo'shilmaydi — ekran "reklama banneri" bo'lib qolardi.
 * Hammasi `motion-safe:` orqali.
 */
export const MOTION = {
  enter: "motion-safe:animate-post",
  rail: "motion-safe:animate-rail-draw",
  bar: "origin-left motion-safe:animate-grow-x",
  tide: "bg-[length:220%_220%] motion-safe:animate-tide",

  liveDot: "relative flex size-2 items-center justify-center",
  liveCore: "size-1.5 rounded-full bg-emerald-400",
  liveRing:
    "absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-pulse-ring",
};

export const DELAY = {
  header: 0,
  hero: 70,
  metricStart: 170,
  metricStep: 38,
  gridStart: 300,
  gridStep: 65,
};

export const metricDelay = (i) => DELAY.metricStart + i * DELAY.metricStep;
export const gridDelay = (i) => DELAY.gridStart + i * DELAY.gridStep;

/* ─────────────────────── YORDAMCHILAR ─────────────────────── */

const hourFormatter = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 0,
});

/** Soat — butun son (domenda "soat" = dars soni). Bo'sh qiymat → em-dash. */
export const formatHours = (value) =>
  value == null ? "—" : `${hourFormatter.format(value)} soat`;

export const formatHourNumber = (value) =>
  value == null ? "—" : hourFormatter.format(value);

/** Sabab TOIFASI — server `SubstitutionReason` enumining ko'zgusi. */
export const REASON_LABELS = {
  illness: "Kasallik",
  business_trip: "Xizmat safari",
  personal: "Shaxsiy sabab",
  training: "Malaka oshirish",
  other: "Boshqa sabab",
};
