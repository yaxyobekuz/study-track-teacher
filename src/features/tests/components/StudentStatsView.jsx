// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Trophy, Award, ListChecks, BarChart3, Coins } from "lucide-react";

// API
import { testSeasonsAPI } from "@/features/tests/api/testSeasons.api";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatScore } from "@/shared/utils/formatScore";

/**
 * O'quvchining mavsum statistikasi: o'rtacha ball, o'rin, sinf o'rni,
 * maktab/sinf mukofotlari va sinf/maktab darajasidagi reytinglar.
 */
const StudentStatsView = ({ season }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["season-my-stats", season.id],
    queryFn: () =>
      testSeasonsAPI.getMyStats(season.id).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  const averageScore = stats?.averageScore || 0;
  const myId = stats?.student?.id;
  const myClassId = stats?.student?.classes?.[0]?.id;

  const schoolTiers = [...(season.schoolTiers || [])].sort(
    (a, b) => a.position - b.position,
  );
  // Sinf darajalari umumiy - har sinfga qo'llanadi
  const classTiers = [...(season.classTiers || [])].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <div className="space-y-5">
      {/* Asosiy ko'rsatkichlar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          icon={ListChecks}
          label="O'rtacha ball"
          value={formatScore(averageScore)}
          highlight
        />
        <Stat
          icon={Trophy}
          label="Umumiy o'rin"
          value={stats?.rank ? `#${stats.rank}` : "-"}
        />
        <Stat
          icon={Award}
          label="Sinfdagi o'rin"
          value={stats?.classRank ? `#${stats.classRank}` : "-"}
        />
        <Stat
          icon={ListChecks}
          label="Topshirgan / Biriktirilgan"
          value={`${stats?.resultCount || 0} / ${stats?.assignedCount || 0}`}
        />
      </div>

      {/* Mukofotlar */}
      <RewardsCard
        title="Maktab bo'yicha mukofotlar"
        tiers={schoolTiers}
        myPosition={stats?.rank}
      />
      <RewardsCard
        title="Sinf bo'yicha mukofotlar"
        tiers={classTiers}
        myPosition={stats?.classRank}
      />

      {/* Sinf / maktab reytingi */}
      <StandingsSection
        seasonId={season.id}
        myId={myId}
        myClassId={myClassId}
      />
    </div>
  );
};

/**
 * O'rin-asosidagi mukofotlar ro'yxati. O'quvchining joriy o'rni ajratiladi.
 */
const RewardsCard = ({ title, tiers, myPosition }) => {
  if (!tiers || tiers.length === 0) return null;
  return (
    <Card title={title}>
      <div className="space-y-2 mt-3">
        {tiers.map((tier, idx) => {
          const isMine = myPosition && myPosition === tier.position;
          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                isMine ? "bg-green-50 ring-1 ring-green-200" : "bg-gray-50",
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-medium",
                    isMine ? "text-green-900" : "text-gray-700",
                  )}
                >
                  {tier.position}-o'rin
                  {isMine && (
                    <span className="ml-1 text-xs text-green-600">(siz)</span>
                  )}
                </p>
                {tier.note && (
                  <p className="text-xs text-gray-600 truncate">{tier.note}</p>
                )}
              </div>
              <span className="flex items-center gap-1 font-semibold text-amber-600 shrink-0">
                <Coins size={15} />+{tier.coinReward}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/**
 * Sinf va maktab darajasidagi reyting jadvali.
 */
const StandingsSection = ({ seasonId, myId, myClassId }) => {
  const [level, setLevel] = useState("school");
  const isClass = level === "class";

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["season-standings", seasonId, level, myClassId || "-"],
    queryFn: () =>
      (isClass && myClassId
        ? testSeasonsAPI.getClassStats(seasonId, myClassId)
        : testSeasonsAPI.getStats(seasonId)
      ).then((res) => res.data.data),
    enabled: !isClass || Boolean(myClassId),
  });

  return (
    <Card title="Reyting">
      <div className="mt-3 mb-3 inline-flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setLevel("school")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md",
            !isClass ? "bg-white shadow font-medium" : "text-gray-600",
          )}
        >
          Maktab
        </button>
        <button
          type="button"
          onClick={() => setLevel("class")}
          disabled={!myClassId}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md",
            isClass ? "bg-white shadow font-medium" : "text-gray-600",
            !myClassId && "opacity-40 cursor-not-allowed",
          )}
        >
          Sinf
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-8">Yuklanmoqda...</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <BarChart3 size={36} className="text-gray-300" />
          <p className="mt-2 text-gray-600">Hozircha natijalar yo'q</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 px-3 font-medium w-12">#</th>
                <th className="py-2 px-3 font-medium">O'quvchi</th>
                <th className="py-2 px-3 font-medium">O'rtacha ball</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isMe = myId && r.student.id === myId;
                return (
                  <tr
                    key={r.student.id}
                    className={cn(
                      "border-b",
                      isMe ? "bg-blue-50 font-medium" : "hover:bg-gray-50",
                    )}
                  >
                    <td className="py-2.5 px-3 text-gray-500">
                      {isClass ? r.classRank : r.rank}
                    </td>
                    <td className="py-2.5 px-3 text-gray-900">
                      {r.student.firstName} {r.student.lastName}
                      {isMe && (
                        <span className="ml-1 text-xs text-blue-600">(siz)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">
                      {formatScore(r.averageScore)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

const Stat = ({ icon: Icon, label, value, highlight = false }) => (
  <div
    className={cn(
      "p-3 rounded-xl flex items-center gap-3",
      highlight ? "bg-blue-50" : "bg-gray-50",
    )}
  >
    <Icon size={20} className={highlight ? "text-blue-600" : "text-gray-500"} />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-600 truncate">{label}</p>
      <p
        className={cn(
          "font-bold",
          highlight ? "text-blue-900" : "text-gray-900",
        )}
      >
        {value}
      </p>
    </div>
  </div>
);

export default StudentStatsView;
