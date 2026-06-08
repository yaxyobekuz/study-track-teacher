// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Trophy, Award, Coins, ListChecks } from "lucide-react";

// API
import { testSeasonsAPI } from "@/features/tests/api/testSeasons.api";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * O'quvchining mavsum statistikasi: ball, o'rin, sinf o'rni, va mukofotlar.
 */
const StudentStatsView = ({ season }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["season-my-stats", season._id],
    queryFn: () =>
      testSeasonsAPI.getMyStats(season._id).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  const totalScore = stats?.totalScore || 0;

  // Mavjud darajalar bo'yicha qaysisiga to'g'ri kelishi
  const absTiers = [...(season.absoluteTiers || [])].sort(
    (a, b) => b.minScore - a.minScore,
  );
  const matchedAbsoluteTier = absTiers.find((t) => totalScore >= t.minScore);
  const nextAbsoluteTier = [...absTiers]
    .reverse()
    .find((t) => totalScore < t.minScore);

  return (
    <div className="space-y-5">
      {/* Asosiy ko'rsatkichlar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={ListChecks} label="Umumiy ball" value={totalScore} highlight />
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
        <Stat icon={ListChecks} label="Testlar" value={stats?.resultCount || 0} />
      </div>

      {/* Joriy daraja */}
      {matchedAbsoluteTier ? (
        <Card className="bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Award size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-700">Sizning darajangiz</p>
              <p className="font-semibold text-gray-900">
                {matchedAbsoluteTier.name}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Mukofot: {matchedAbsoluteTier.coinReward} coin
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-gray-600">
            Hozircha hech qaysi darajaga to'g'ri kelmaysiz.
          </p>
        </Card>
      )}

      {/* Keyingi daraja */}
      {nextAbsoluteTier && (
        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Coins size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700">Keyingi daraja</p>
              <p className="font-semibold text-gray-900">
                {nextAbsoluteTier.name} - {nextAbsoluteTier.coinReward} coin
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Yana <strong>{nextAbsoluteTier.minScore - totalScore}</strong> ball kerak
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Barcha darajalar ro'yxati */}
      {(season.absoluteTiers || []).length > 0 && (
        <Card title="Mavsum darajalari">
          <div className="space-y-2 mt-3">
            {[...(season.absoluteTiers || [])]
              .sort((a, b) => b.minScore - a.minScore)
              .map((tier, idx) => {
                const reached = totalScore >= tier.minScore;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      reached ? "bg-green-50" : "bg-gray-50",
                    )}
                  >
                    <div>
                      <p
                        className={cn(
                          "font-medium",
                          reached ? "text-green-900" : "text-gray-700",
                        )}
                      >
                        {tier.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {tier.minScore} ball'dan boshlab
                      </p>
                    </div>
                    <span className="font-semibold text-amber-600">
                      +{tier.coinReward} coin
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
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
