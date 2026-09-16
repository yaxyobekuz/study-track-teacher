import { useQuery } from "@tanstack/react-query";
import { salaryAPI } from "../api/salary.api";

/** O'z oylik statistikasi (joriy oy oyligi, dars soati, umumiy qarz). */
export const useMySalaryStats = () =>
  useQuery({
    queryKey: ["salary", "my-stats"],
    queryFn: () => salaryAPI.getMyStats().then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });
