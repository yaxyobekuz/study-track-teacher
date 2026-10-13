export const taskStatusLabels = {
  pending: "Kutilmoqda",
  extended: "Uzaytirilgan",
  pending_rejected: "Kutilmoqda (Rad etilgan)",
  stopped: "To'xtatilgan",
  completed: "Muvaffaqiyatli yakunlangan",
  pending_review: "Yakunlangan (Tasdiq kutilmoqda)",
};

export const taskStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  extended: "bg-blue-100 text-blue-700",
  pending_rejected: "bg-red-100 text-red-700",
  stopped: "bg-gray-100 text-gray-500",
  completed: "bg-green-100 text-green-700",
  pending_review: "bg-purple-100 text-purple-700",
};

export const taskStatusOptions = [
  { value: "all", label: "Barcha statuslar" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "extended", label: "Uzaytirilgan" },
  { value: "pending_rejected", label: "Rad etilgan" },
  { value: "pending_review", label: "Tasdiq kutilmoqda" },
  { value: "stopped", label: "To'xtatilgan" },
  { value: "completed", label: "Yakunlangan" },
];

export const SUBMITTABLE_STATUSES = ["pending", "extended", "pending_rejected"];

// Yakunlash formasi — fayl turlari (server `submissionRules.fileTypes`)
export const FILE_TYPE_LABELS = {
  image: "rasm",
  video: "video",
  document: "hujjat (PDF, Word, Excel)",
};

const FILE_ACCEPT = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm,video/quicktime",
  document:
    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain",
};

/** Ruxsat etilgan turlar → `<input accept>` qiymati. */
export const buildSubmitAccept = (types = ["image", "video", "document"]) =>
  types.map((t) => FILE_ACCEPT[t]).filter(Boolean).join(",");

// ─────────────────────────────────────────────
// TOPSHIRIQ TURI
// ─────────────────────────────────────────────

/**
 * `main` — ASOSIY: lavozim bo'yicha doimiy ish.
 * `extra` — QO'SHIMCHA: bir martalik vazifa.
 *
 * Tur KO'RSATKICH: qoidalar (fayl, muddat, jarima) ikkalasida bir xil.
 */
export const TASK_KIND_META = {
  main: { label: "Asosiy", chip: "bg-indigo-50 text-indigo-700" },
  extra: { label: "Qo'shimcha", chip: "bg-teal-50 text-teal-700" },
};

export const kindMeta = (kind) => TASK_KIND_META[kind] || TASK_KIND_META.main;

// ─────────────────────────────────────────────
// VAQT HOLATI (server: `taskWindow.helpers.js`)
// ─────────────────────────────────────────────
//
// ⚠️ HOLAT SAQLANMAYDI, HISOBLANADI. "Bajarilmadi" (✗) — `status` emas,
// hosila: muddat o'tdi-yu ish topshirilmadi. Shuning uchun muddat
// uzaytirilishi bilan ✗ o'z-o'zidan yo'qoladi.
//
// Server har topshiriqda `timeState` yuboradi, lekin ekran OCHIQ turganda
// vaqt o'tib ketadi — shuning uchun panel uni qayta hisoblaydi.

export const TASK_STATE_META = {
  active: {
    label: "Hozir bajarilish vaqti",
    short: "Hozir vaqti",
    chip: "bg-red-100 text-red-700",
    ring: "ring-2 ring-red-300",
    accent: "bg-red-500",
    text: "text-red-600",
  },
  open: {
    label: "Bajarilmoqda",
    short: "Bajarilmoqda",
    chip: "bg-blue-50 text-blue-700",
    ring: "ring-1 ring-gray-100",
    accent: "bg-blue-500",
    text: "text-blue-600",
  },
  upcoming: {
    label: "Hali boshlanmagan",
    short: "Boshlanmagan",
    chip: "bg-gray-100 text-gray-600",
    ring: "ring-1 ring-gray-100",
    accent: "bg-gray-300",
    text: "text-gray-500",
  },
  missed: {
    label: "Bajarilmadi",
    short: "Bajarilmadi",
    chip: "bg-red-100 text-red-700",
    ring: "ring-1 ring-red-200",
    accent: "bg-red-500",
    text: "text-red-600",
  },
  review: {
    label: "Tekshiruvda",
    short: "Tekshiruvda",
    chip: "bg-amber-50 text-amber-700",
    ring: "ring-1 ring-amber-100",
    accent: "bg-amber-500",
    text: "text-amber-600",
  },
  done: {
    label: "Bajarildi",
    short: "Bajarildi",
    chip: "bg-green-100 text-green-700",
    ring: "ring-1 ring-green-100",
    accent: "bg-green-500",
    text: "text-green-600",
  },
  stopped: {
    label: "To'xtatilgan",
    short: "To'xtatilgan",
    chip: "bg-gray-100 text-gray-500",
    ring: "ring-1 ring-gray-100",
    accent: "bg-gray-300",
    text: "text-gray-500",
  },
};

export const stateMeta = (state) => TASK_STATE_META[state] || TASK_STATE_META.open;

/**
 * Serverdagi `resolveTimeState` bilan AYNI qoida.
 * @param {{ status: string, startDate?: string|null, dueDate: string }} task
 * @param {number} [nowMs]
 * @returns {string}
 */
export const resolveTimeState = (task, nowMs = Date.now()) => {
  if (!task) return "open";
  if (task.status === "completed") return "done";
  if (task.status === "stopped") return "stopped";
  if (task.status === "pending_review") return "review";

  if (new Date(task.dueDate).getTime() < nowMs) return "missed";
  if (!task.startDate) return "open";
  return new Date(task.startDate).getTime() > nowMs ? "upcoming" : "active";
};

/** Ijrochi ro'yxatining kesimlari — server `state` parametri bilan AYNI. */
export const MY_TASK_FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "active", label: "Hozir vaqti" },
  { value: "in_progress", label: "Jarayonda" },
  { value: "missed", label: "Bajarilmadi" },
  { value: "review", label: "Tekshiruvda" },
  { value: "done", label: "Bajarildi" },
];

/**
 * Qolgan/o'tgan vaqt matni: "2 soat 15 daqiqa qoldi" / "3 soat kechikdi".
 * @param {number} ms
 */
export const durationText = (ms) => {
  const minutes = Math.max(1, Math.round(Math.abs(ms) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) return hours ? `${days} kun ${hours} soat` : `${days} kun`;
  if (hours > 0) return mins ? `${hours} soat ${mins} daqiqa` : `${hours} soat`;
  return `${mins} daqiqa`;
};

/**
 * Oraliqning jonli holati: qancha qolgani va (oraliq bo'lsa) necha foizi
 * o'tgani. Progress faqat ORALIQLI topshiriqda ma'noli — "faqat muddat"
 * rejimida boshlanish nuqtasi yo'q, ya'ni foiz ham yo'q.
 *
 * @param {object} task
 * @param {number} nowMs
 */
export const windowProgress = (task, nowMs = Date.now()) => {
  const due = new Date(task.dueDate).getTime();
  const start = task.startDate ? new Date(task.startDate).getTime() : null;
  const left = due - nowMs;

  let percent = null;
  if (start && due > start) {
    percent = Math.min(100, Math.max(0, ((nowMs - start) / (due - start)) * 100));
  }

  return {
    left,
    percent,
    overdue: left < 0,
    text: left < 0 ? `${durationText(left)} kechikdi` : `${durationText(left)} qoldi`,
  };
};
