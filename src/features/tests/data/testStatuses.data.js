// Test holatlari uchun yorliq, rang va variantlar

export const TEST_STATUSES = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

export const TEST_STATUS_LABELS = {
  draft: "Tayyorlanmoqda",
  published: "E'lon qilingan",
  closed: "Yopilgan",
};

export const TEST_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};

export const TEST_STATUS_FILTER_OPTIONS = [
  { label: "Hammasi", value: "all" },
  { label: "Tayyorlanmoqda", value: "draft" },
  { label: "E'lon qilingan", value: "published" },
  { label: "Yopilgan", value: "closed" },
];
