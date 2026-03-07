import http from "@/shared/api/http";

export const penaltiesAPI = {
  // Kategoriyalar
  getCategories: (params) => http.get("/penalties/categories", { params }),

  // Jarimalar
  create: (data) =>
    http.post("/penalties", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Sozlamalar
  getSettings: () => http.get("/penalties/settings"),

  // O'z jarimalari
  getMyPenalties: (params) => http.get("/penalties/my", { params }),

  // Bergan jarimalar
  getGivenPenalties: (params) => http.get("/penalties/given", { params }),
};
