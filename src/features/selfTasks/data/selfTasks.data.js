/**
 * O'ZIM BELGILAGAN ISHLAR — statik ma'lumotlar.
 *
 * ⚠️ VAQT HOLATI VA TUR `features/tasks/data/tasks.data.js` DAN olinadi
 * (ikki oqimda ular AYNI): `resolveTimeState`, `stateMeta`, `kindMeta`,
 * `windowProgress`. Bu yerda faqat shaxsiy oqimga XOS narsalar.
 */

// ─────────────────────────────────────────────
// KESIMLAR
// ─────────────────────────────────────────────

/**
 * Server `state` parametri bilan AYNI kalitlar.
 *
 * ⚠️ "Tekshiruvda" YO'Q va bu bo'shliq emas, STRUKTURA: shaxsiy ishda
 * tasdiqlash bosqichi umuman bo'lmaydi (xodim topshirgani darhol
 * yakunlanadi), ya'ni bu kesim har doim bo'sh ro'yxat qaytarardi.
 */
export const SELF_TASK_FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "active", label: "Hozir vaqti" },
  { value: "in_progress", label: "Jarayonda" },
  { value: "missed", label: "Bajarilmadi" },
  { value: "done", label: "Bajarildi" },
  { value: "stopped", label: "To'xtatilgan" },
];

// ─────────────────────────────────────────────
// TAKRORLANISH (doimiy ish qoidasi)
// ─────────────────────────────────────────────

export const TASK_FREQUENCIES = [
  { value: "weekly", label: "Haftalik", hint: "Haftaning tanlangan kunlari" },
  { value: "days", label: "Kun oralig'ida", hint: "Har N kunda bir" },
  { value: "months", label: "Oylik", hint: "Oyning tanlangan kunlari" },
];

/**
 * Hafta kunlari — `value` JS `getDay()` konvensiyasida (0 = yakshanba),
 * serverdagi `taskSchedule.helpers.js` bilan AYNI.
 *
 * ⚠️ Hisobotlardagi "0 = dushanba" indeksi BOSHQA narsa va bu yerda
 * ishlatilmaydi.
 */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Du", full: "Dushanba" },
  { value: 2, label: "Se", full: "Seshanba" },
  { value: 3, label: "Ch", full: "Chorshanba" },
  { value: 4, label: "Pa", full: "Payshanba" },
  { value: 5, label: "Ju", full: "Juma" },
  { value: 6, label: "Sh", full: "Shanba" },
  { value: 0, label: "Ya", full: "Yakshanba" },
];

/**
 * Formaning boshlang'ich qiymatlari.
 *
 * ⚠️ BITTA VAQT: server bir kunda bir nechta vaqtni (`slots`) qabul
 * qiladi, lekin bu panel BITTASINI so'raydi — telefon ekranida ikki-uch
 * vaqtli jadval o'qilmas bo'lib qolardi. Bir nechta vaqt kerak bo'lsa u
 * admin panelda qo'yiladi va bu yerda ro'yxatda KO'RINADI (matn serverdan
 * keladi).
 */
export const DEFAULT_RECURRENCE = {
  frequency: "weekly",
  weekdays: [1],
  intervalDays: 7,
  intervalMonths: 1,
  monthDays: [1],
  start: "",
  due: "18:00",
  leadDays: 1,
};

// Server bilan QO'LDA sinxron (`taskSchedule.helpers.js`)
export const MAX_LEAD_DAYS = 30;

/**
 * Qoidaning qisqa matni — forma hali saqlanmaganda "nima yoziladi" ni
 * ko'rsatish uchun. Saqlangandan keyin matn SERVERDAN keladi
 * (`ruleLabel`), ya'ni ikkita haqiqat manbai bo'lmaydi.
 */
export const describeRecurrence = (rule) => {
  if (!rule) return "—";

  const time = rule.due ? (rule.start ? `${rule.start}–${rule.due}` : rule.due) : "—";

  let text;
  if (rule.frequency === "weekly") {
    const days = WEEKDAY_OPTIONS.filter((d) => (rule.weekdays || []).includes(d.value))
      .map((d) => d.full.toLowerCase())
      .join(", ");
    text = days ? `Har ${days}` : "Har hafta";
  } else if (rule.frequency === "days") {
    const step = Number(rule.intervalDays) || 1;
    text = step === 1 ? "Har kuni" : `Har ${step} kunda`;
  } else {
    const step = Number(rule.intervalMonths) || 1;
    const days = [...(rule.monthDays || [])].sort((a, b) => a - b).join(", ");
    const period = step === 1 ? "Har oy" : `Har ${step} oyda`;
    text = days ? `${period}, ${days}-kun` : period;
  }

  return `${text} · ${time}`;
};

/**
 * Formadagi xatolar — server xatosini kutib o'tirmaslik uchun. Server
 * baribir hammasini qayta tekshiradi.
 */
export const recurrenceProblems = (rule) => {
  const problems = [];
  if (rule.frequency === "weekly" && (rule.weekdays || []).length === 0)
    problems.push("Kamida bitta hafta kunini tanlang");
  if (rule.frequency === "months" && (rule.monthDays || []).length === 0)
    problems.push("Oyning kamida bitta kunini tanlang");
  if (!rule.due) problems.push("Tugash vaqtini belgilang");
  if (rule.start && rule.due && rule.start >= rule.due)
    problems.push("Boshlanish vaqti tugash vaqtidan oldin bo'lsin");
  return problems;
};
