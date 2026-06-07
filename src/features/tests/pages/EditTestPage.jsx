// React
import { useEffect, useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// Icons
import { ArrowLeft, Loader2 } from "lucide-react";

// API
import { testsAPI } from "../api/tests.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Test tahrirlash sahifasi (V3) — alohida sahifa, popover emas.
 * Tahrirlash: nom, savollar soni, vaqt.
 */
const EditTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: test, isLoading } = useQuery({
    queryKey: ["test", id],
    queryFn: () => testsAPI.getOne(id).then((res) => res.data.data),
  });

  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(30);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

  useEffect(() => {
    if (test) {
      setTitle(test.title || "");
      setQuestionCount(test.questionCount ?? 30);
      setTimeLimitMinutes(test.timeLimitMinutes ?? 30);
    }
  }, [test]);

  const mutation = useMutation({
    mutationFn: (data) => testsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test", id] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Test yangilandi");
      navigate(`/tests/${id}`);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Saqlanmadi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Test nomi kiritilmagan");
      return;
    }
    mutation.mutate({
      title: title.trim(),
      questionCount: Number(questionCount),
      timeLimitMinutes: Number(timeLimitMinutes),
    });
  };

  if (isLoading) {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/tests/${id}`}>
          <Button variant="outline" size="sm" className="size-9 p-0">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Testni tahrirlash
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            name="title"
            label="Test nomi"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Test nomi"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              type="number"
              name="questionCount"
              label="Savollar soni"
              required
              min={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              description="Har o'quvchiga tasodifiy tortiladigan savollar soni"
            />
            <InputField
              type="number"
              name="timeLimitMinutes"
              label="Vaqt (daqiqa)"
              required
              min={1}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t">
            <Link to={`/tests/${id}`}>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
              >
                Bekor qilish
              </Button>
            </Link>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Saqlash
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditTestPage;
