// React
import { useEffect, useRef, useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { ChevronDown, ChevronUp, Trash2, Plus, Loader2 } from "lucide-react";

// API
import { testQuestionsAPI } from "../api/tests.api";

// Data
import {
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_COLORS,
} from "../data/testDefaults.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import Input from "@/shared/components/ui/input/Input";
import InputField from "@/shared/components/ui/input/InputField";
import InputImage from "@/shared/components/ui/input/InputImage";
import SelectField from "@/shared/components/ui/select/SelectField";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Server attachment'ini InputImage item massiviga aylantiradi (0 yoki 1 ta).
 * @param {{url?: string, originalName?: string}|null} image - Server rasmi.
 * @returns {Array} InputImage item massivi.
 */
function imageToItems(image) {
  if (!image?.url) return [];
  return [
    {
      id: image.key || image.url,
      url: image.url,
      originalName: image.originalName,
    },
  ];
}

/**
 * InputImage item massividan FormData uchun ma'lumotni ajratadi.
 * @param {Array} items - InputImage item massivi.
 * @param {object|null} originalImage - Boshlang'ich server rasmi (mavjud bo'lsa).
 * @returns {{file: File|null, keepExisting: object|null, removed: boolean}}
 */
function extractImageState(items, originalImage) {
  const item = items?.[0];
  if (!item) {
    // Boshida rasm bor edi-yu, endi yo'q - o'chirilgan
    return { file: null, keepExisting: null, removed: Boolean(originalImage) };
  }
  if (item.file) {
    return { file: item.file, keepExisting: null, removed: false };
  }
  // Mavjud server rasmi saqlanadi
  return { file: null, keepExisting: originalImage || null, removed: false };
}

const InlineQuestionEditor = ({
  question,
  testId,
  defaultOpen = false,
  onSaved,
  onDeleted,
  onCancel,
  keepAdding = false,
  onKeepAddingChange,
}) => {
  const isNew = !question?._id;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(defaultOpen || isNew);
  const [type, setType] = useState(question?.type || "standard");
  const [text, setText] = useState(question?.text || "");
  const [points, setPoints] = useState(question?.points ?? 1);
  const [options, setOptions] = useState(
    question?.options?.length > 0
      ? question.options.map((o) => ({
          _id: o._id,
          text: o.text || "",
          isCorrect: Boolean(o.isCorrect),
          // Rasm InputImage item massivi sifatida (0 yoki 1 ta)
          imageItems: imageToItems(o.image),
          // Boshlang'ich server rasmi (saqlash uchun keepExisting)
          _originalImage: o.image || null,
        }))
      : [
          { text: "", isCorrect: true, imageItems: [], _originalImage: null },
          { text: "", isCorrect: false, imageItems: [], _originalImage: null },
        ],
  );
  // Savol rasmi - InputImage item massivi (single rejim)
  const [questionImageItems, setQuestionImageItems] = useState(
    imageToItems(question?.image),
  );
  const optionsContainerRef = useRef(null);

  // Saqlash mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      const files = [];
      const imageMap = { options: {} };

      formData.append("type", type);
      formData.append("text", text);
      formData.append("points", String(points));

      // Savol rasmi
      const qImg = extractImageState(questionImageItems, question?.image);
      if (qImg.file) {
        files.push(qImg.file);
        imageMap.question = files.length - 1;
      }
      if (qImg.removed) {
        formData.append("removeQuestionImage", "true");
      }

      // Variantlar (standard turida)
      if (type === "standard") {
        const optionsPayload = options.map((opt, idx) => {
          const optImg = extractImageState(opt.imageItems, opt._originalImage);
          if (optImg.file) {
            files.push(optImg.file);
            imageMap.options[idx] = files.length - 1;
          }
          return {
            text: opt.text,
            isCorrect: opt.isCorrect,
            // Eski rasm saqlanishi uchun yuborish (yangi fayl yo'q bo'lsa)
            image: optImg.keepExisting,
          };
        });
        formData.append("options", JSON.stringify(optionsPayload));
      }

      formData.append("imageMap", JSON.stringify(imageMap));
      files.forEach((f) => formData.append("images", f));

      return isNew
        ? testQuestionsAPI.create(testId, formData)
        : testQuestionsAPI.update(question._id, formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
      toast.success(isNew ? "Savol qo'shildi" : "Savol yangilandi");
      if (isNew) {
        // "Saqla va keyingisi" yoqilgan bo'lsa - formani tozalab ochiq qoldiramiz
        if (keepAdding) resetForm();
        onSaved?.(res.data.data);
      } else {
        setIsOpen(false);
        onSaved?.(res.data.data);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Saqlanmadi");
    },
  });

  // O'chirish mutation
  const deleteMutation = useMutation({
    mutationFn: () => testQuestionsAPI.delete(question._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
      toast.success("Savol o'chirildi");
      onDeleted?.();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "O'chirishda xatolik"),
  });

  // Variant boshqaruvi
  const addOption = () => {
    if (options.length >= 99) return;
    setOptions([
      ...options,
      { text: "", isCorrect: false, imageItems: [], _originalImage: null },
    ]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      toast.warning("Kamida 2 ta variant bo'lishi kerak");
      return;
    }
    const next = options.filter((_, i) => i !== index);
    // Agar to'g'rini o'chirgan bo'lsa, birinchini to'g'ri qilish
    if (options[index].isCorrect && next.length > 0) {
      next[0].isCorrect = true;
    }
    setOptions(next);
  };

  const updateOption = (index, patch) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    );
  };

  const setCorrect = (index) => {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, isCorrect: i === index })),
    );
  };

  // "Saqla va keyingisi" - formani yangi bo'sh savolga tiklash
  const resetForm = () => {
    setText("");
    setPoints(1);
    setQuestionImageItems([]);
    setOptions([
      { text: "", isCorrect: true, imageItems: [], _originalImage: null },
      { text: "", isCorrect: false, imageItems: [], _originalImage: null },
    ]);
  };

  // Variant inputida Enter - keyingi variantga o'tish yoki yangi variant qo'shish
  const onOptionEnter = (index) => {
    if (index === options.length - 1) {
      if (options.length < 99) addOption();
    }
    // Keyingi variant inputiga fokus (DOM yangilangach), shu editor ichida
    requestAnimationFrame(() => {
      const inputs = optionsContainerRef.current?.querySelectorAll(
        "[data-option-input]",
      );
      inputs?.[index + 1]?.focus();
    });
  };

  // Yopilgan holat preview
  if (!isOpen && !isNew) {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-white rounded-xl border cursor-pointer hover:border-blue-300 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-sm font-semibold text-gray-500 w-8 shrink-0">
          {question.order}.
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-gray-900 break-words line-clamp-2">
            {question.text || (
              <span className="text-gray-400 italic">(rasmli savol)</span>
            )}
          </p>
        </div>

        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium shrink-0",
            QUESTION_TYPE_COLORS[question.type],
          )}
        >
          {QUESTION_TYPE_LABELS[question.type]}
        </span>

        <span className="text-sm font-medium text-gray-700 shrink-0">
          {question.points} ball
        </span>

        <ChevronDown size={20} className="text-gray-400 shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border-2 border-blue-200 space-y-4">
      {/* Yuqori panel */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isNew && (
            <span className="text-sm font-semibold text-gray-500">
              {question.order}-savol
            </span>
          )}
          {isNew && (
            <span className="text-sm font-semibold text-blue-600">
              Yangi savol
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Savolni o'chirishni xohlaysizmi?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="size-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md"
            >
              <Trash2 size={16} />
            </button>
          )}
          {!isNew && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="size-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"
            >
              <ChevronUp size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tur va ball */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SelectField
          name="type"
          label="Savol turi"
          value={type}
          onChange={(v) => setType(v)}
          options={QUESTION_TYPE_OPTIONS}
          triggerClassName="w-full"
        />
        <InputField
          type="number"
          name="points"
          label="Ball"
          min={0}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
      </div>

      {/* Savol matni */}
      <InputField
        type="textarea"
        name="text"
        label="Savol matni"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Savol matnini kiriting..."
        inputClassName="min-h-24"
      />

      {/* Savol rasmi */}
      <InputImage
        label="Savol rasmi (ixtiyoriy)"
        value={questionImageItems}
        onChange={setQuestionImageItems}
      />

      {/* Variantlar (faqat standard) */}
      {type === "standard" && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Javob variantlari ({options.length} ta)
          </label>

          <div className="space-y-2" ref={optionsContainerRef}>
            {options.map((opt, idx) => (
              <OptionRow
                key={idx}
                index={idx}
                option={opt}
                onTextChange={(text) => updateOption(idx, { text })}
                onEnter={() => onOptionEnter(idx)}
                onImageChange={(imageItems) =>
                  updateOption(idx, { imageItems })
                }
                onSetCorrect={() => setCorrect(idx)}
                onDelete={() => removeOption(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Saqlash tugmalari */}
      <div className="flex flex-col gap-3 pt-2 border-t sm:flex-row sm:items-center sm:justify-between">
        {/* "Saqla va keyingisi" - faqat yangi savol uchun */}
        {isNew && onKeepAddingChange ? (
          <label
            htmlFor="keepAdding"
            className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none"
          >
            <Switch
              id="keepAdding"
              checked={keepAdding}
              onChange={onKeepAddingChange}
            />
            Saqlab, yana savol qo'shaman
          </label>
        ) : (
          <span />
        )}

        <div className="flex gap-4">
          {type === "standard" && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addOption}
              disabled={options.length >= 99 || saveMutation.isPending}
            >
              <Plus />
              Variant qo'shish
            </Button>
          )}

          {isNew && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
              disabled={saveMutation.isPending}
            >
              Bekor qilish
            </Button>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {isNew ? "Qo'shish" : "Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const OptionRow = ({
  index,
  option,
  onTextChange,
  onEnter,
  onImageChange,
  onSetCorrect,
  onDelete,
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg border",
        option.isCorrect
          ? "border-green-400 bg-green-50"
          : "border-gray-200 bg-white",
      )}
    >
      {/* To'g'ri radio */}
      <button
        type="button"
        onClick={onSetCorrect}
        title="Bu variant to'g'ri"
        className={cn(
          "size-6 shrink-0 mt-1.5 rounded-full border-2 flex items-center justify-center",
          option.isCorrect
            ? "border-green-500 bg-green-500"
            : "border-gray-300 hover:border-green-400",
        )}
      >
        {option.isCorrect && <div className="size-2 rounded-full bg-white" />}
      </button>

      <span className="text-sm font-semibold text-gray-600 mt-1.5 w-5 shrink-0">
        {String.fromCharCode(65 + index)}.
      </span>

      <div className="flex-1 space-y-2 min-w-0">
        <Input
          type="text"
          value={option.text}
          data-option-input=""
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
          placeholder="Variant matni"
        />

        <InputImage value={option.imageItems} onChange={onImageChange} />
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="size-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default InlineQuestionEditor;
