// Router
import { useNavigate } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { CheckSquare } from "lucide-react";

// API
import { testSessionsAPI, testResultsAPI } from "@/features/grading/api/testResults.api";

// Data
import {
  RESULT_STATUS_LABELS,
  RESULT_STATUS_COLORS,
} from "@/features/grading/data/resultStatuses.data";

// Utils
import { formatScore } from "@/shared/utils/formatScore";

// Components
import Card from "@/shared/components/ui/Card";
import SessionStatusBadge from "./SessionStatusBadge";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Tab 2: Javoblar - o'quvchilar sessiyalari. Qatorga bosib individual javoblar
 * sahifasiga (batafsil ko'rish + baholash) o'tiladi.
 */
const AnswersTab = ({ test }) => {
  const navigate = useNavigate();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["test-sessions", "by-test", test.id],
    queryFn: () =>
      testSessionsAPI.getByTest(test.id).then((res) => res.data.data),
  });

  // Natijalar mapping - session.id → result
  const { data: results = [] } = useQuery({
    queryKey: ["test-results", "by-test", test.id],
    queryFn: () =>
      testResultsAPI
        .getByTest(test.id, { limit: 200 })
        .then((res) => res.data.data),
  });

  const resultBySession = new Map();
  for (const r of results) {
    if (r.session) {
      const sid = typeof r.session === "string" ? r.session : r.session.id;
      resultBySession.set(sid?.toString(), r);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckSquare size={40} className="text-gray-300" />
          <p className="mt-3 text-gray-600">
            Hali hech kim testni topshirmagan.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => {
        const result = resultBySession.get(s.id.toString());
        const canOpen = Boolean(result);
        return (
          <Card
            key={s.id}
            className={cn(
              "transition-shadow",
              canOpen ? "cursor-pointer hover:shadow-sm" : "opacity-80",
            )}
            responsive
          >
            <div
              className="p-4"
              onClick={
                canOpen
                  ? () => navigate(`/tests/${test.id}/answers/${result.id}`)
                  : undefined
              }
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {s.student?.firstName} {s.student?.lastName}
                  </p>
                  {s.binding && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {s.binding.season?.name} · {s.binding.subject?.name}
                      {s.binding.classes && s.binding.classes.length > 0 && (
                        <>
                          {" · "}
                          {s.binding.classes.map((c) => c.name).join(", ")}
                        </>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    Urinish #{s.attemptNumber} ·{" "}
                    {s.submittedAt
                      ? formatDateUZ(s.submittedAt)
                      : "topshirilmagan"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <SessionStatusBadge status={s.status} />
                  {result && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-medium",
                        RESULT_STATUS_COLORS[result.status] || "bg-gray-100",
                      )}
                    >
                      {RESULT_STATUS_LABELS[result.status]} ·{" "}
                      {formatScore(result.finalScore)} ball
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AnswersTab;
