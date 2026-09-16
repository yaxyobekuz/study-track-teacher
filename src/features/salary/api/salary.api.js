import http from "@/shared/api/http";

/**
 * O'qituvchining O'Z oylik statistikasi (bosh sahifa dashboardi uchun).
 * Server: /payroll/my-stats — ruxsatsiz, faqat o'zi (auth orqali).
 */
export const salaryAPI = {
  getMyStats: () => http.get("/payroll/my-stats"),
};
