// Seanslar ("Qurilmalar") ro'yxatining statik ma'lumotlari — login
// sahifasidagi limit oynasi va profildagi "Qurilmalar" tabi uchun BITTA.

// Icons
import { Laptop, MonitorSmartphone, Smartphone } from "lucide-react";

/** Server `deviceKind` → belgi va rang. */
export const DEVICE_KIND_META = {
  mobile: { icon: Smartphone, className: "bg-sky-100 text-sky-600" },
  desktop: { icon: Laptop, className: "bg-violet-100 text-violet-600" },
  unknown: { icon: MonitorSmartphone, className: "bg-gray-100 text-gray-500" },
};

/**
 * Ro'yxatda filial nomi faqat seanslar BIR NECHTA filialda bo'lsa
 * ko'rsatiladi — bitta filialli maktabda har qatorda bir xil nom shovqin.
 *
 * @param {object[]} sessions
 * @returns {boolean}
 */
export const spansBranches = (sessions = []) =>
  new Set(sessions.map((session) => session.branchId)).size > 1;

/**
 * Faollik matni: "Shu qurilma", "Onlayn" yoki oxirgi faollik vaqti
 * (server tayyor yorliq yuboradi — `lastSeenLabel`).
 *
 * @param {object} session
 * @returns {{ text: string, online: boolean }}
 */
export const sessionActivity = (session) => {
  if (session.isCurrent) return { text: "Shu qurilma · onlayn", online: true };
  if (session.isOnline) return { text: "Onlayn", online: true };
  return { text: `Oxirgi faollik: ${session.lastSeenLabel}`, online: false };
};
