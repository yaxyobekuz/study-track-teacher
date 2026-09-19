import http from "@/shared/api/http";

export const authAPI = {
  register: (data) => http.post("auth/register", data),
  login: (data) => http.post("auth/login", data),
  getMe: () => http.get("auth/me"),

  /** Seansni SERVERDA yopish — usiz u 30 kun "ochiq" qurilma bo'lib sanalardi. */
  logout: () => http.post("auth/logout"),

  /**
   * QURILMALAR LIMITI OYNASIDAN DAVOM ETISH — tanlangan seanslar yakunlanadi
   * va login javobi qaytadi. Token yo'q: kimligini 5 daqiqalik tiket aytadi.
   *
   * @param {{ ticket: string, sessionIds?: string[], all?: boolean }} data
   */
  resolveSessionLimit: (data) => http.post("auth/login/terminate", data),
};
