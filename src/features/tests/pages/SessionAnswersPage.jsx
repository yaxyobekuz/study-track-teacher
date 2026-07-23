// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useParams } from "react-router-dom";

// Icons
import { ArrowLeft } from "lucide-react";

// API
import { testResultsAPI } from "@/features/grading/api/testResults.api";

// Data
import {
  RESULT_STATUS_LABELS,
  RESULT_STATUS_COLORS,
} from "@/features/grading/data/resultStatuses.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SessionStatusBadge from "../components/SessionStatusBadge";
import SessionGradingPanel from "../components/SessionGradingPanel";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { formatScore } from "@/shared/utils/formatScore";

/**
 * O'quvchining bitta sessiyasidagi individual javoblarini batafsil ko'rish
 * va baholash sahifasi.
 * URL: /tests/:id/answers/:resultId
 */
const SessionAnswersPage = () => {
  const { id: testId, resultId } = useParams();
  const backHref = `/tests/${testId}?tab=answers`;

  const { data: result, isLoading } = useQuery({
    queryKey: ["test-result", resultId],
    queryFn: () =>
      testResultsAPI.getOne(resultId).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <BackButton href={backHref} />
        <Card>
          <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-5">
        <BackButton href={backHref} />
        <Card>
          <p className="text-center text-gray-500 py-10">Natija topilmadi</p>
        </Card>
      </div>
    );
  }

  const session = result.session;
  const student = result.student;
  const meta = [result.season?.name, result.subject?.name, result.class?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-5">
      {/* Sarlavha: o'quvchi + kontekst + holat */}
      <div className="flex items-start gap-3 flex-wrap">
        <BackButton href={backHref} />

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 truncate">
            {student?.firstName} {student?.lastName}
          </h1>
          {meta && <p className="text-sm text-gray-600 mt-0.5">{meta}</p>}
          <p className="text-xs text-gray-500 mt-0.5">
            Urinish #{session?.attemptNumber} ·{" "}
            {session?.submittedAt
              ? formatDateUZ(session.submittedAt)
              : "topshirilmagan"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <SessionStatusBadge status={session?.status} />
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-xs font-medium",
              RESULT_STATUS_COLORS[result.status] || "bg-gray-100",
            )}
          >
            {RESULT_STATUS_LABELS[result.status]} ·{" "}
            {formatScore(result.finalScore)} ball
          </span>
        </div>
      </div>

      {/* Batafsil javoblar va baholash */}
      <SessionGradingPanel
        test={{ id: testId }}
        session={session}
        resultId={resultId}
      />
    </div>
  );
};

const BackButton = ({ href }) => (
  <Link to={href}>
    <Button variant="outline" size="sm" className="size-9 p-0">
      <ArrowLeft size={18} />
    </Button>
  </Link>
);

export default SessionAnswersPage;
