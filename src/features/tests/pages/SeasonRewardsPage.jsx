// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useParams } from "react-router-dom";

// Icons
import {
  ArrowLeft,
  BarChart3,
  Award,
  User as UserIcon,
} from "lucide-react";

// API
import { testSeasonsAPI } from "@/features/tests/api/testSeasons.api";
import { authAPI } from "@/features/auth/api/auth.api";
import { teacherAssignmentsAPI } from "@/features/assignments/api/teacherAssignments.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import StudentStatsView from "../components/StudentStatsView";
import TeacherStatsView from "../components/TeacherStatsView";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Mavsum mukofotlari sahifasi.
 * Rolga qarab:
 *  - O'quvchi: o'z reytingi va mukofotlari (StudentStatsView)
 *  - O'qituvchi: biriktirilgan sinflar bo'yicha stats + class-tier config
 */
const SeasonRewardsPage = () => {
  const { id: seasonId } = useParams();

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: season, isLoading } = useQuery({
    queryKey: ["test-season", seasonId],
    queryFn: () =>
      testSeasonsAPI.getOne(seasonId).then((res) => res?.data?.data),
  });

  if (isLoading || !user) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }
  if (!season) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Mavsum topilmadi</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 flex-wrap">
        <Link to="/seasons">
          <Button variant="outline" size="sm" className="size-9 p-0">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            {season.name}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {formatDateUZ(season.startDate)} → {formatDateUZ(season.endDate)}
            {season.distributedAt && (
              <span className="ml-2 text-green-700">· Mukofotlar tarqatildi</span>
            )}
          </p>
        </div>
      </div>

      {user.role === "student" ? (
        <StudentStatsView season={season} />
      ) : (
        <TeacherStatsView season={season} user={user} />
      )}
    </div>
  );
};

export default SeasonRewardsPage;
