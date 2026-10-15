import http from "@/shared/api/http";

export const authAPI = {
  register: (data) => http.post("auth/register", data),
  login: (data) => http.post("auth/login", data),

  /**
   * FILIALNI TANLASH — login'ning ikkinchi qadami.
   *
   * ⚠️ Access token BERILMAGAN holat uchun: hakam — `selectionToken`
   * (5 daqiqa, alohida kalit bilan imzolangan). Shuning uchun so'rov
   * `Authorization` sarlavhasiga tayanmaydi.
   */
  selectLoginBranch: ({ selectionToken, branchId }) =>
    http.post("auth/login/branch", { selectionToken, branchId }),
  getMe: () => http.get("auth/me"),

  /** Seansni SERVERDA yopish — usiz u 30 kun "ochiq" qurilma bo'lib sanalardi. */
  logout: () => http.post("auth/logout"),
};
