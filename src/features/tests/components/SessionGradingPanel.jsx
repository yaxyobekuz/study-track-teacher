// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { CheckCircle, Check, X, Plus, Pencil, Trash2 } from "lucide-react";

// API
import { testResultsAPI } from "@/features/grading/api/testResults.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ExtraPointsForm from "@/features/grading/components/ExtraPointsForm";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { formatScore } from "@/shared/utils/formatScore";

/**
 * Inline grading paneli - Tab 2 ichida bitta sessiya/natija uchun.
 * Variantli savollar avto-baholangan, ochiq savollar inline baholanadi.
 */
const SessionGradingPanel = ({ test, session, resultId }) => {
  const [showExtra, setShowExtra] = useState(false);
  const [editingExtraId, setEditingExtraId] = useState(null);
  const queryClient = useQueryClient();

  const invalidateResult = () => {
    queryClient.invalidateQueries({ queryKey: ["test-result", resultId] });
    queryClient.invalidateQueries({
      queryKey: ["test-results", "by-test", test.id],
    });
  };

  const deleteExtraMutation = useMutation({
    mutationFn: (entryId) =>
      testResultsAPI.deleteExtraPoints(resultId, entryId),
    onSuccess: () => {
      invalidateResult();
      toast.success("Qo'shimcha ball o'chirildi");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Xatolik"),
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ["test-result", resultId],
    queryFn: () =>
      testResultsAPI.getOne(resultId).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-5">Yuklanmoqda...</p>
      </Card>
    );
  }
  if (!result) return null;

  const fullSession = result.session || session;
  const questions = fullSession.questions || [];
  const answers = fullSession.answers || [];
  const perQuestionMap = new Map(
    (result.perQuestion || []).map((pq) => [pq.question.toString(), pq]),
  );
  const answerMap = new Map(
    answers.map((a) => [a.question.toString(), a]),
  );

  const extraSum =
    result.extraPoints?.reduce((s, e) => s + (e.amount || 0), 0) || 0;

  const maxPossible = questions.reduce((s, q) => s + (q.points || 0), 0);

  return (
    <Card className="space-y-4 border-l-4 border-l-blue-500">
      {/* Ball xulosa */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox
          label="Yakuniy ball"
          value={`${formatScore(result.finalScore)} / ${formatScore(
            result.maxScore ?? maxPossible,
          )}`}
          highlight
        />
        <StatBox label="Avtomatik" value={formatScore(result.autoGradedScore)} />
        <StatBox label="Qo'lda" value={formatScore(result.manualGradedScore)} />
        <StatBox label="Qo'shimcha" value={formatScore(extraSum)} />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {fullSession.submittedAt && (
          <p className="text-xs text-gray-500">
            Topshirilgan: {formatDateUZ(fullSession.submittedAt)}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExtra(!showExtra)}
          className="gap-2"
        >
          <Plus size={16} />
          Qo'shimcha ball
        </Button>
      </div>

      {showExtra && (
        <div className="p-3 rounded-lg bg-gray-50">
          <ExtraPointsForm
            resultId={resultId}
            onSuccess={() => {
              setShowExtra(false);
              queryClient.invalidateQueries({
                queryKey: ["test-result", resultId],
              });
              queryClient.invalidateQueries({
                queryKey: ["test-results", "by-test", test.id],
              });
            }}
          />
        </div>
      )}

      {/* Qo'shimcha ballar tarixi */}
      {result.extraPoints?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Qo'shimcha ballar:
          </p>
          {result.extraPoints.map((ep) =>
            editingExtraId === ep.id ? (
              <div key={ep.id} className="p-3 rounded-lg bg-gray-50">
                <ExtraPointsForm
                  resultId={resultId}
                  entry={ep}
                  onSuccess={() => setEditingExtraId(null)}
                />
                <button
                  type="button"
                  onClick={() => setEditingExtraId(null)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Bekor qilish
                </button>
              </div>
            ) : (
              <div
                key={ep.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="text-sm text-gray-900">{ep.reason}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ep.addedBy?.firstName} {ep.addedBy?.lastName} ·{" "}
                    {formatDateUZ(ep.addedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "font-semibold",
                      ep.amount >= 0 ? "text-green-700" : "text-red-700",
                    )}
                  >
                    {ep.amount >= 0 ? "+" : ""}
                    {ep.amount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingExtraId(ep.id)}
                    className="size-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-md"
                    title="Tahrirlash"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Ushbu qo'shimcha ballni o'chirishni xohlaysizmi?",
                        )
                      ) {
                        deleteExtraMutation.mutate(ep.id);
                      }
                    }}
                    disabled={deleteExtraMutation.isPending}
                    className="size-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md"
                    title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Savollar va javoblar */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-semibold text-gray-700">
          Savollar va javoblar:
        </p>
        {questions.map((q, idx) => {
          const pq = perQuestionMap.get(q.question.toString());
          const ans = answerMap.get(q.question.toString());
          return (
            <QuestionAnswerBlock
              key={idx}
              index={idx + 1}
              question={q}
              answer={ans}
              perQuestion={pq}
              resultId={resultId}
              onGraded={() => {
                queryClient.invalidateQueries({
                  queryKey: ["test-result", resultId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["test-results", "by-test", test.id],
                });
              }}
            />
          );
        })}
      </div>
    </Card>
  );
};

const StatBox = ({ label, value, highlight = false }) => (
  <div
    className={cn(
      "p-3 rounded-xl text-center",
      highlight ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-900",
    )}
  >
    <p className="text-xs text-gray-600">{label}</p>
    <p className="font-bold mt-1">{value}</p>
  </div>
);

const QuestionAnswerBlock = ({
  index,
  question,
  answer,
  perQuestion,
  resultId,
  onGraded,
}) => {
  const [awardedPoints, setAwardedPoints] = useState(
    perQuestion?.awardedPoints ?? "",
  );
  const [feedback, setFeedback] = useState(perQuestion?.feedback || "");

  const mutation = useMutation({
    mutationFn: (data) => testResultsAPI.gradeOpenAnswer(resultId, data),
    onSuccess: () => {
      toast.success("Javob baholandi");
      onGraded?.();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Xatolik"),
  });

  const handleGrade = () => {
    if (awardedPoints === "" || isNaN(Number(awardedPoints))) {
      toast.error("Ball noto'g'ri");
      return;
    }
    mutation.mutate({
      questionId: question.question,
      awardedPoints: Number(awardedPoints),
      feedback,
    });
  };

  const isStandard = question.type === "standard";
  const isCorrect =
    isStandard && perQuestion?.awardedPoints === perQuestion?.maxPoints;

  return (
    <div className="p-3 rounded-xl border border-gray-200 bg-white space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-gray-500">{index}.</span>
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {isStandard ? "Variantli" : "Ochiq"}
        </span>
        <span className="text-xs text-gray-500">
          {formatScore(perQuestion?.awardedPoints ?? 0)} /{" "}
          {formatScore(question.points)} ball
        </span>
      </div>

      <div className="flex items-start gap-3">
        {question.image?.url && (
          <img
            src={question.image.url}
            alt="Savol rasmi"
            className="size-20 rounded-lg object-cover border shrink-0"
          />
        )}
        <p className="text-gray-900 break-words">
          {question.text || (
            <span className="text-gray-400">(rasmli savol)</span>
          )}
        </p>
      </div>

      {isStandard && (
        <div className="space-y-1.5 pt-1">
          {question.options.map((opt) => {
            const isSelected =
              answer?.selectedOptionId?.toString() ===
              opt.optionId?.toString();
            return (
              <div
                key={opt.optionId}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg border text-sm",
                  isSelected
                    ? isCorrect
                      ? "border-green-400 bg-green-50"
                      : "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white",
                )}
              >
                {isSelected ? (
                  isCorrect ? (
                    <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <X size={16} className="text-red-600 mt-0.5 shrink-0" />
                  )
                ) : (
                  <span className="size-4 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 flex items-start gap-2 min-w-0">
                  {opt.image?.url && (
                    <img
                      src={opt.image.url}
                      alt="Variant rasmi"
                      className="size-12 rounded object-cover border shrink-0"
                    />
                  )}
                  <p className="text-gray-900 break-words">
                    {opt.text || "(rasm)"}
                  </p>
                </div>
              </div>
            );
          })}
          {!answer && (
            <p className="text-xs text-gray-500">O'quvchi javob bermagan</p>
          )}
        </div>
      )}

      {!isStandard && (
        <div className="space-y-2 pt-1">
          <div className="p-2.5 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">O'quvchi javobi:</p>
            <p className="text-gray-900 whitespace-pre-wrap break-words text-sm">
              {answer?.textAnswer || (
                <span className="text-gray-400">(javob yo'q)</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_2fr]">
            <InputField
              type="number"
              name={`points-${index}`}
              label={`Ball (0–${formatScore(question.points)})`}
              min={0}
              max={question.points}
              step="0.01"
              value={awardedPoints}
              onChange={(e) => setAwardedPoints(e.target.value)}
            />
            <InputField
              name={`feedback-${index}`}
              label="Izoh (ixtiyoriy)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="O'quvchiga izoh"
            />
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleGrade}
            disabled={mutation.isPending}
            className="gap-2"
          >
            <CheckCircle size={16} />
            {perQuestion?.status === "graded" ? "Yangilash" : "Baholash"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionGradingPanel;
