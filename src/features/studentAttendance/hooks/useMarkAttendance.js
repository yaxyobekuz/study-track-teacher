// React
import { useState } from "react";

/**
 * Belgilash holati — LOKAL forma holati (server holati TanStack Query'da).
 *
 * `people` — `[{ id, originalStatus, originalNote }]`:
 *   · `originalStatus` — bazadagi holat (`null` — belgilanmagan),
 *   · `originalNote` — yozuvdagi izoh.
 * `syncKey` — ma'lumot yangilanganda tanlovni qayta tiklash kaliti
 * (`query.dataUpdatedAt`).
 *
 * ⚠️ DASTLABKI TANLOV — BAZADAGI HOLAT, avtomatik "Keldi" YO'Q: usiz
 * o'qituvchi hech narsa tanlamasdan "Saqlash" bosib, butun sinfni kelgan
 * qilib qo'yardi.
 *
 * ⚠️ Faqat O'ZGARGAN qatorlar yuboriladi (`dirty`): tegilmagan qatorni
 * qayta yozish `lastModifiedBy` ni almashtirib, "kim belgilagan" degan
 * javobni yo'qotardi.
 *
 * @returns {{marks: object, setStatus: Function, setNote: Function,
 *   setAll: Function, dirty: Array, counts: object}}
 */
const useMarkAttendance = (people, syncKey) => {
  const [marks, setMarks] = useState({});
  const [syncedKey, setSyncedKey] = useState(null);

  // Yangi ma'lumot kelganda tanlov qayta tiklanadi (render vaqtida, effektsiz)
  if (syncKey != null && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setMarks(
      Object.fromEntries(
        people.map((p) => [
          p.id,
          { status: p.originalStatus ?? null, note: p.originalNote || "" },
        ]),
      ),
    );
  }

  const setStatus = (id, status) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], status } }));

  const setNote = (id, note) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  /** "Barchasini belgilash" — `ids` berilsa faqat ko'rinib turgan qatorlar. */
  const setAll = (status, ids) =>
    setMarks((prev) => {
      const only = ids ? new Set(ids) : null;
      const next = { ...prev };
      for (const p of people) {
        if (only && !only.has(p.id)) continue;
        next[p.id] = { ...prev[p.id], status };
      }
      return next;
    });

  // Izoh HAR QANDAY holatda hisobga olinadi: faqat izohni to'g'rilash ham
  // saqlanishi kerak
  const dirty = people.filter((p) => {
    const mark = marks[p.id] || {};
    const current = mark.status || null;
    if (!current) return false;
    if (current !== (p.originalStatus || null)) return true;
    return (mark.note || "").trim() !== (p.originalNote || "").trim();
  });

  const counts = {
    total: people.length,
    came: 0,
    notCame: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    unmarked: 0,
  };
  for (const p of people) {
    const status = marks[p.id]?.status;
    if (status && counts[status] !== undefined) counts[status] += 1;
    else counts.unmarked += 1;
  }
  counts.came = counts.present + counts.late;
  counts.notCame = counts.total - counts.came;

  return { marks, setStatus, setNote, setAll, dirty, counts };
};

export default useMarkAttendance;
