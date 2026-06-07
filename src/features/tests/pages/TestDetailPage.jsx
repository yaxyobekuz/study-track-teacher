// React
import { useState } from "react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Router
import { Link, useParams, useSearchParams } from "react-router-dom";

// Icons
import {
  ArrowLeft,
  Edit,
  ClipboardList,
  Link2,
  CheckSquare,
  Award,
  Plus,
  Trash2,
  ListChecks,
} from "lucide-react";

// API
import { testsAPI, testQuestionsAPI } from "../api/tests.api";

// Data
import { TEST_TABS, TEST_TAB_LABELS } from "../data/testDefaults.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InlineQuestionEditor from "../components/InlineQuestionEditor";
import AiGenerateModal, {
  AiGenerateButton,
} from "../components/AiGenerateModal";
import BindingsTab from "../components/BindingsTab";
import AnswersTab from "../components/AnswersTab";
import ResultsTab from "../components/ResultsTab";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Test Detail sahifasi (V3 markaziy sahifa) - 4 tab.
 * URL: /tests/:id?tab=questions|bindings|answers|results
 */
const TestDetailPage = () => {
  const { id: testId } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || TEST_TABS.QUESTIONS;

  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => testsAPI.getOne(testId).then((res) => res.data.data),
  });

  if (testLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  if (!test) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Test topilmadi</p>
      </Card>
    );
  }

  const setTab = (newTab) => setParams({ tab: newTab });

  const tabIcons = {
    [TEST_TABS.QUESTIONS]: ClipboardList,
    [TEST_TABS.BINDINGS]: Link2,
    [TEST_TABS.ANSWERS]: CheckSquare,
    [TEST_TABS.RESULTS]: Award,
  };

  return (
    <div className="space-y-5">
      <Header test={test} />

      {/* Tab navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        {Object.values(TEST_TABS).map((t) => {
          const Icon = tabIcons[t];
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon size={16} />
              {TEST_TAB_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === TEST_TABS.QUESTIONS && <QuestionsTab test={test} />}
      {tab === TEST_TABS.BINDINGS && <BindingsTab test={test} />}
      {tab === TEST_TABS.ANSWERS && <AnswersTab test={test} />}
      {tab === TEST_TABS.RESULTS && <ResultsTab test={test} />}
    </div>
  );
};

/**
 * Sahifa boshi: orqaga + nom + sozlamalar preview + tahrirlash tugmasi.
 * V3: ClassAssignmentChips va TestSettingsPopover olib tashlandi.
 */
const Header = ({ test }) => {
  return (
    <div className="flex items-start gap-3 flex-wrap">
      <Link to="/tests">
        <Button variant="outline" size="sm" className="size-9 p-0">
          <ArrowLeft size={18} />
        </Button>
      </Link>

      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold text-gray-900 truncate">
          {test.title}
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          {test.questionCount} savol · {test.timeLimitMinutes} daqiqa
        </p>
      </div>

      <Link to={`/tests/${test._id}/edit`}>
        <Button variant="outline" className="gap-2">
          <Edit size={16} />
          Tahrirlash
        </Button>
      </Link>
    </div>
  );
};

/**
 * Tab 1: Savollar - inline editor list + AI generatsiya.
 */
const QuestionsTab = ({ test }) => {
  const [showNew, setShowNew] = useState(false);
  // Saqlangach yangi bo'sh savolni ochiq qoldirish ("Saqla va keyingisi")
  const [keepAdding, setKeepAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["test-questions", test._id],
    queryFn: () =>
      testQuestionsAPI.getAll(test._id).then((res) => res.data.data),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => testQuestionsAPI.deleteAll(test._id),
    onSuccess: (res) => {
      const deleted = res.data?.data?.deleted ?? 0;
      queryClient.invalidateQueries({ queryKey: ["test-questions", test._id] });
      toast.success(`${deleted} ta savol o'chirildi`);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "O'chirilmadi"),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  const isEmpty = questions.length === 0 && !showNew;

  return (
    <div className="space-y-4">
      {/* AI modal (Redux orqali ochiladi) */}
      <AiGenerateModal />

      {/* Progress + harakat paneli */}
      <QuestionsProgress test={test} count={questions.length} />

      {/* Bo'sh holat */}
      {isEmpty && (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ListChecks size={40} className="text-gray-300" />
            <p className="mt-3 text-gray-600">
              Hozircha savollar yo'q. Qo'lda qo'shing yoki AI yordamida tez
              generatsiya qiling.
            </p>
            <div className="flex flex-col gap-3 mt-5 sm:flex-row">
              <Button onClick={() => setShowNew(true)} className="gap-2">
                <Plus size={16} />
                Yangi savol
              </Button>
              <AiGenerateButton testId={test._id} />
            </div>
          </div>
        </Card>
      )}

      {questions.map((q) => (
        <InlineQuestionEditor key={q._id} question={q} testId={test._id} />
      ))}

      {showNew && (
        <InlineQuestionEditor
          question={null}
          testId={test._id}
          defaultOpen
          keepAdding={keepAdding}
          onKeepAddingChange={setKeepAdding}
          onSaved={() => {
            if (!keepAdding) setShowNew(false);
          }}
          onCancel={() => setShowNew(false)}
        />
      )}

      {/* Pastki harakat paneli (bo'sh bo'lmaganda) */}
      {!isEmpty && questions.length > 0 && !showNew && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowNew(true)}
              className="gap-2 flex-1"
            >
              <Plus size={16} />
              Yangi savol
            </Button>
            <AiGenerateButton testId={test._id} className="flex-1" />
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              if (
                window.confirm(
                  "Barcha savollarni o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.",
                )
              ) {
                deleteAllMutation.mutate();
              }
            }}
            disabled={deleteAllMutation.isPending}
            className="gap-2 w-full text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            {deleteAllMutation.isPending
              ? "O'chirilmoqda..."
              : "Barcha savollarni o'chirish"}
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Savollar soni progressi (vizual bar + ogohlantirish).
 */
const QuestionsProgress = ({ test, count }) => {
  const target = test.questionCount || 0;
  const percent =
    target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
  const isEnough = count >= target;

  return (
    <Card className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700">
          Savollar: {count} / {target}
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            isEnough ? "text-green-600" : "text-amber-600",
          )}
        >
          {isEnough ? "Yetarli" : `Yana ${target - count} ta kerak`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isEnough ? "bg-green-500" : "bg-blue-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {!isEnough && count > 0 && (
        <p className="text-xs text-gray-500">
          Biriktiruvni e'lon qilish uchun kamida {target} ta savol kerak.
        </p>
      )}
    </Card>
  );
};

export default TestDetailPage;
