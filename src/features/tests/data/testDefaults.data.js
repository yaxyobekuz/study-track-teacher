// Test yaratishdagi default qiymatlar va statik yorliqlar

export const TEST_DEFAULTS = {
  QUESTION_COUNT: 30,
  TIME_LIMIT_MINUTES: 30,
};

export const QUESTION_TYPE_OPTIONS = [
  { label: "Variantli", value: "standard" },
  { label: "Ochiq (matnli javob)", value: "open" },
];

export const QUESTION_TYPE_LABELS = {
  standard: "Variantli",
  open: "Ochiq",
};

export const QUESTION_TYPE_COLORS = {
  standard: "bg-blue-100 text-blue-700",
  open: "bg-emerald-100 text-emerald-700",
};

export const TEST_TABS = {
  QUESTIONS: "questions",
  BINDINGS: "bindings",
  ANSWERS: "answers",
  RESULTS: "results",
};

export const TEST_TAB_LABELS = {
  questions: "Savollar",
  bindings: "Biriktirish",
  answers: "Javoblar",
  results: "Natijalar",
};

// AI savol generatsiyasi uchun statik data
export const AI_DIFFICULTY_OPTIONS = [
  { label: "Oson", value: "easy" },
  { label: "O'rta", value: "medium" },
  { label: "Qiyin", value: "hard" },
];

export const AI_SOURCE_TABS = {
  PROMPT: "prompt",
  FILES: "files",
};

export const AI_SOURCE_TAB_LABELS = {
  prompt: "Matn orqali",
  files: "Fayl orqali",
};

export const AI_DEFAULTS = {
  COUNT: 10,
  MIN_COUNT: 1,
  MAX_COUNT: 20,
  DIFFICULTY: "medium",
  TYPE: "standard",
};

// File input "accept" - rasm, PDF, Word, matn
export const AI_ACCEPTED_FILES = "image/*,.pdf,.docx,.txt";
export const AI_MAX_FILES = 10;

export const BINDING_STATUS_LABELS = {
  draft: "Tayyorlanmoqda",
  published: "E'lon qilingan",
  closed: "Yopilgan",
};

export const BINDING_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};
