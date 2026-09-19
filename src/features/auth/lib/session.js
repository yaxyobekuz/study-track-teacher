// API
import { authAPI } from "../api/auth.api";

/** Login javobidagi tokenni saqlash — keyingi so'rovlar shu seans bilan. */
export const saveSession = (token) => localStorage.setItem("authToken", token);

/** Server javob bermasa chiqish shuncha kutadi (tarmoq yo'q holati). */
const LOGOUT_TIMEOUT_MS = 3000;

/**
 * CHIQISH — avval seans SERVERDA yopiladi, keyin token o'chiriladi.
 *
 * ⚠️ Faqat tokenni o'chirish YETMAYDI: server seansni 30 kun "ochiq"
 * deb biladi va o'qituvchining 4 ta qurilma limitidan bittasini egallab
 * turardi — "Chiqish" ni bosgan odam keyingi safar boshqa qurilmada
 * "limit to'lgan" oynasiga tushardi.
 *
 * ⚠️ Server javob bermasa ham chiqiladi: tarmoq yo'qligi odamni tizimda
 * ushlab turmasligi kerak (seans muddati o'tib o'zi yopiladi).
 *
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  if (localStorage.getItem("authToken")) {
    await Promise.race([
      authAPI.logout().catch(() => null),
      new Promise((resolve) => setTimeout(resolve, LOGOUT_TIMEOUT_MS)),
    ]);
  }

  localStorage.removeItem("authToken");
};
