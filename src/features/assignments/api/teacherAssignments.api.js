import http from "@/shared/api/http";

// O'qituvchi biriktiruvlari - o'qituvchi UI ko'rinadigan sinf/fanlarni cheklash uchun.
export const teacherAssignmentsAPI = {
  getMy: (params = {}) => http.get("/teacher-assignments/my", { params }),
};
