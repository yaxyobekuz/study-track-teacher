/**
 * Test platformasidagi barcha modallar shu yerda ro'yxatga olinadi.
 *
 * MUHIM: yangi modal qo'shganda uning nomini shu massivga qo'shing.
 * Aks holda `openModal("...")` ishlamaydi (modal ochilmaydi), chunki
 * Redux slice faqat shu ro'yxatdagi modallar uchun boshlang'ich holat yaratadi.
 *
 * Nom - `openModal(name)`, `closeModal(name)`, `useModal(name)` va
 * `<ResponsiveModal name="..." />` da ishlatiladigan kalit bilan bir xil bo'lishi kerak.
 */
export const MODAL_NAMES = [
  // Xabarlar (Messages)
  "sendMessage",
  "messageDetails",
  "cancelMessage",

  // Davomat (Attendance)
  "excuseRequest",

  // Testlar (Tests)
  "aiGenerate",

  // Dars jadvali (Schedules)
  "createSchedule",
  "editSchedule",
  "deleteSchedule",

  // Inventar (moddiy-texnik baza) — admin panel bilan bir xil nomlar
  "inventoryCategory",
  "inventoryItem",
  "inventoryLocation",
  "inventoryAddStock",
  "inventoryRepair",
  "inventoryWriteOff",
  "inventoryAdjust",
  "inventoryTransfer",
  "inventoryOpenCheck",
  "inventoryDamage",
  "inventoryCharge",
  "inventoryWaive",
  "inventoryCancelDamage",
  "inventoryCancelCharge",
  "inventoryDamagePayment",
  "inventoryVoidPayment",
];
