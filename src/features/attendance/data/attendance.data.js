export const STATUS_LABELS = {
  present: "Keldi",
  late: "Kech keldi",
  absent: "Kelmadi",
  excused: "Sababli",
};

export const STATUS_COLORS = {
  present: "bg-green-100 text-green-700",
  late: "bg-yellow-100 text-yellow-700",
  absent: "bg-red-100 text-red-700",
  excused: "bg-blue-100 text-blue-700",
};

export const MONTH_OPTIONS = [
  { label: "Yanvar", value: 1 },
  { label: "Fevral", value: 2 },
  { label: "Mart", value: 3 },
  { label: "Aprel", value: 4 },
  { label: "May", value: 5 },
  { label: "Iyun", value: 6 },
  { label: "Iyul", value: 7 },
  { label: "Avgust", value: 8 },
  { label: "Sentyabr", value: 9 },
  { label: "Oktyabr", value: 10 },
  { label: "Noyabr", value: 11 },
  { label: "Dekabr", value: 12 },
];

export const EXCUSE_TYPE_OPTIONS = [
  { label: "Oldindan so'rov", value: "advance" },
  { label: "Keyindan so'rov", value: "after" },
];

export const EXCUSE_TYPE_LABELS = {
  advance: "Oldindan",
  after: "Keyindan",
};

export const EXCUSE_STATUS_LABELS = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlandi",
  rejected: "Rad etildi",
};

export const EXCUSE_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

// ─────────────────────────────────────────────
// QAYD ETISH JOYLASHUVI
//
// Serverdagi `geolocation.helpers.js` dagi holatlarning AYNAN o'zi.
// ⚠️ "Ofisda" va "ofisda emas" degan ikkita holat yetarli emas: GPS o'zi
// ham aniq emas va joylashuv umuman kelmagan holat ham bor. Ular bitta
// so'z bilan ko'rsatilsa, GPS-ni o'chirib qo'ygan xodim ofisda o'tirgani
// bilan bir xil ko'rinardi.
// ─────────────────────────────────────────────

export const LOCATION_STATUS_LABELS = {
  inside: "Ofis hududida",
  edge: "Chegarada",
  outside: "Ofisdan tashqarida",
  missing: "Joylashuv berilmagan",
  invalid: "Joylashuv yaroqsiz",
  unconfigured: "Ofis joylashuvi sozlanmagan",
};

/** Har bir holat nimani anglatishi — tafsilot oynasi uchun. */
export const LOCATION_STATUS_HINTS = {
  inside: "Qayd etilgan nuqta ofis hududi ichida",
  edge: "GPS aniqligi hudud ichida yoki tashqarida ekanini ayta olmadi",
  outside: "Qayd etilgan nuqta ofis hududidan tashqarida",
  missing: "Qurilma joylashuvni bermadi — GPS o'chiq yoki ruxsat berilmagan",
  invalid: "Qurilmadan tushgan koordinata yaroqsiz",
  unconfigured: "Sozlamalarda ofis joylashuvi belgilanmagan",
};

export const LOCATION_STATUS_COLORS = {
  inside: "bg-green-100 text-green-700",
  edge: "bg-yellow-100 text-yellow-700",
  outside: "bg-red-100 text-red-700",
  missing: "bg-gray-100 text-gray-600",
  invalid: "bg-orange-100 text-orange-700",
  unconfigured: "bg-gray-100 text-gray-600",
};

/**
 * Masofani o'qiladigan ko'rinishga keltiradi: "85 m" / "1.2 km".
 * @param {number|null|undefined} meters
 * @returns {string}
 */
export const formatDistance = (meters) => {
  if (meters === null || meters === undefined || Number.isNaN(Number(meters))) {
    return "—";
  }

  const value = Number(meters);
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(1)} km`;
};

/**
 * Holatlarning JIDDIYLIK tartibi (kattasi — jiddiyroq).
 * Kelish va ketish ikki xil bo'lganda bitta yorliq ko'rsatish kerak
 * bo'ladi: eng jiddiysi ko'rsatiladi, aks holda "kelganda ofisda edi"
 * degan yorliq ketishdagi muammoni yashirib qo'yardi.
 */
const LOCATION_SEVERITY = {
  inside: 0,
  unconfigured: 1,
  edge: 2,
  missing: 3,
  invalid: 4,
  outside: 5,
};

/**
 * Yozuvdagi ENG JIDDIY joylashuv holatini qaytaradi.
 * @param {{checkInLocationStatus?: string, checkOutLocationStatus?: string}} record
 * @returns {string|null}
 */
export const worstLocationStatus = (record) => {
  const statuses = [
    record?.checkInLocationStatus,
    record?.checkOutLocationStatus,
  ].filter(Boolean);

  if (!statuses.length) return null;

  return statuses.reduce((worst, current) =>
    (LOCATION_SEVERITY[current] ?? 0) > (LOCATION_SEVERITY[worst] ?? 0)
      ? current
      : worst,
  );
};

/**
 * Yozuv bo'yicha bitta qatorlik joylashuv xulosasi.
 *
 * Masofa AYNAN o'sha holatga tegishlisi olinadi: eng jiddiy holat
 * ketishdan chiqqan bo'lsa, kelishning masofasini ko'rsatish raqam bilan
 * matnni bir-biriga zid qilib qo'yardi.
 *
 * @param {object} record
 * @returns {{status: string, label: string, distance: number|null, severe: boolean}|null}
 */
export const locationSummary = (record) => {
  const status = worstLocationStatus(record);
  if (!status) return null;

  const distance =
    record?.checkInLocationStatus === status
      ? record?.checkInDistance
      : record?.checkOutDistance;

  return {
    status,
    label: LOCATION_STATUS_LABELS[status] || status,
    distance: distance ?? null,
    severe: status === "outside",
  };
};
