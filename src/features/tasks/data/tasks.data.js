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
