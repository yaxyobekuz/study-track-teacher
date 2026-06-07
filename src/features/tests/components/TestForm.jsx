// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Router
import { useNavigate } from "react-router-dom";

// API
import { testsAPI } from "../api/tests.api";

// Data
import { TEST_DEFAULTS } from "../data/testDefaults.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Test yaratish formasi (V3 - minimal).
 * Faqat 3 ta maydon: nom, savollar soni, vaqt.
 * Mavsum/fan/sinflar bu yerda yo'q - keyinroq Biriktirish tab orqali biriktiriladi.
 */
const TestForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(
    TEST_DEFAULTS.QUESTION_COUNT,
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    TEST_DEFAULTS.TIME_LIMIT_MINUTES,
  );

  const mutation = useMutation({
    mutationFn: (data) => testsAPI.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Test yaratildi");
      navigate(`/tests/${res.data.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        name="title"
        label="Test nomi"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Masalan: 1-chorak yakuniy"
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

      <p className="text-sm text-gray-500">
        Test yaratilgach uning sahifasida savollar qo'shasiz va mavsum +
        sinflarga biriktirasiz.
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/tests")}
          disabled={mutation.isPending}
        >
          Bekor qilish
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Yaratilmoqda..." : "Test yaratish"}
        </Button>
      </div>
    </form>
  );
};

export default TestForm;
