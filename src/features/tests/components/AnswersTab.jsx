// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { CheckSquare, Loader2 } from "lucide-react";

// API
import { testSessionsAPI, testResultsAPI } from "@/features/grading/api/testResults.api";

// Data
import {
  RESULT_STATUS_LABELS,
  RESULT_STATUS_COLORS,
} from "@/features/grading/data/resultStatuses.data";

// Components
import Card from "@/shared/components/ui/Card";
import SessionGradingPanel from "./SessionGradingPanel";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

/**
 * Tab 2: Javoblar - o'quvchilar sessiyalari, qatorga bosib inline grading.
 */
const AnswersTab = ({ test }) => {
  const [openSessionId, setOpenSessionId] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["test-sessions", "by-test", test._id],
    queryFn: () =>
      testSessionsAPI.getByTest(test._id).then((res) => res.data.data),
  });

  // Natijalar mapping - session.id → result
  const { data: results = [] } = useQuery({
    queryKey: ["test-results", "by-test", test._id],
    queryFn: () =>
      testResultsAPI
        .getByTest(test._id, { limit: 200 })
        .then((res) => res.data.data),
  });

  const resultBySession = new Map();
  for (const r of results) {
    if (r.session) {
      const sid = typeof r.session === "string" ? r.session : r.session._id;
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
        const isOpen = openSessionId === s._id;
        const result = resultBySession.get(s._id.toString());
        return (
          <div key={s._id} className="space-y-2">
            <Card
              className={cn(
                "cursor-pointer transition-shadow",
                isOpen ? "shadow-md" : "hover:shadow-sm",
              )}
              responsive
            >
              <div
                className="p-4"
                onClick={() => setOpenSessionId(isOpen ? null : s._id)}
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
                            {s.binding.classes
                              .map((c) => c.name)
                              .join(", ")}
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
                        {result.finalScore} ball
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {isOpen && result && (
              <SessionGradingPanel
                test={test}
                session={s}
                resultId={result._id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const SessionStatusBadge = ({ status }) => {
  const map = {
    in_progress: { label: "Jarayonda", cls: "bg-blue-100 text-blue-700" },
    submitted: { label: "Topshirilgan", cls: "bg-green-100 text-green-700" },
    expired: { label: "Vaqti tugagan", cls: "bg-yellow-100 text-yellow-700" },
  };
  const info = map[status] || { label: status, cls: "bg-gray-100" };
  return (
    <span
      className={cn("px-2 py-0.5 rounded-md text-xs font-medium", info.cls)}
    >
      {info.label}
    </span>
  );
};

export default AnswersTab;
