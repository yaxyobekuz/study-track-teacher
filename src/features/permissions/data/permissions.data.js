// ─────────────────────────────────────────────
// RUXSATLAR — xodim paneli uchun yordamchilar
// ─────────────────────────────────────────────
// Ruxsat kaliti — `<bo'lim>.<amal>` (masalan "inventory.stock"). Kalitlar
// SERVER katalogi bilan bir xil (`server/src/utils/permissions.js`); ularni
// admin panel beradi va olib qo'yadi, bu panel esa faqat O'QIYDI
// (`/auth/me` javobidagi `permissions`).
//
// To'liq katalog bu yerda YO'Q va kerak ham emas: panelning asosiy
// sahifalari rol bo'yicha ochiq (o'qituvchi — baho, davomat, jadval),
// ruxsat bilan ochiladigan qo'shimcha bo'limlar esa quyidagi ro'yxatda.
// Ruxsat berilsa bo'lim yon menyuda paydo bo'ladi, olib qo'yilsa yo'qoladi;
// server baribir har so'rovda tekshiradi — bu faqat UI qatlami.

/**
 * Foydalanuvchida berilgan ruxsat bormi? (server `hasPermission` bilan bir xil)
 * Eski, amalga bo'linmagan bo'lim kaliti ham qabul qilinadi.
 *
 * @param {string[]} permissions
 * @param {string} key - "inventory.stock"
 * @returns {boolean}
 */
export const hasPermission = (permissions = [], key) => {
  if (!key) return true;
  if (permissions.includes(key)) return true;
  return permissions.includes(key.split(".")[0]);
};

/**
 * Bo'limda hech bo'lmasa bitta amal bormi?
 *
 * @param {string[]} permissions
 * @param {string} section - "inventory"
 * @returns {boolean}
 */
export const hasSection = (permissions = [], section) => {
  if (!section) return true;
  if (permissions.includes(section)) return true;
  return permissions.some((p) => p.startsWith(`${section}.`));
};

// Route prefiks → talab qilinadigan ruxsat kaliti. Yon menyu filtri va route
// guard shu jadvaldan foydalanadi — sahifaga kirish uchun `.view` yetarli,
// aniq amal (tugma) esa sahifaning o'zida `<Can do="...">` bilan tekshiriladi.
//
// Inventar UCHTA ruxsat bo'limiga bo'lingan: xatlov (`inventory`), kunlik
// hisobot (`monitoring`) va zarar/undiruv (`damages`). Eng UZUN mos prefiks
// yutadi: `/inventory/checks` uchun `monitoring.view`, qolgan `/inventory/*`
// uchun `inventory.view`. Sozlamalar sahifasi alohida kalit bilan.
const ROUTE_PERMISSIONS = [
  { prefix: "/inventory", key: "inventory.view" },
  { prefix: "/inventory/checks", key: "monitoring.view" },
  { prefix: "/inventory/damages", key: "damages.view" },
  { prefix: "/inventory/debtors", key: "damages.view" },
  { prefix: "/inventory/settings", key: "inventory.settings" },
];

/**
 * Berilgan yo'l (pathname yoki sidebar url) uchun talab qilinadigan ruxsat
 * kalitini qaytaradi. Hech bir prefiks mos kelmasa `null` — ya'ni sahifa
 * ruxsatsiz, rol bo'yicha ochiq (masalan "/", "/grades", "/profile").
 *
 * @param {string} pathname
 * @returns {string|null}
 */
export const permissionForPath = (pathname = "") => {
  let match = null;
  for (const route of ROUTE_PERMISSIONS) {
    const hit = pathname === route.prefix || pathname.startsWith(`${route.prefix}/`);
    if (hit && (!match || route.prefix.length > match.prefix.length)) {
      match = route;
    }
  }
  return match?.key || null;
};
