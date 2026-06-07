// React
import { useRef, useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { Sparkles, Upload, X, Image as ImageIcon } from "lucide-react";

// API
import { testAiAPI } from "../api/tests.api";

// Data
import {
  AI_SOURCE_TABS,
  AI_SOURCE_TAB_LABELS,
  AI_DIFFICULTY_OPTIONS,
  AI_DEFAULTS,
  AI_ACCEPTED_FILES,
  AI_MAX_FILES,
  QUESTION_TYPE_OPTIONS,
} from "../data/testDefaults.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Tabs from "@/shared/components/ui/Tabs";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";

// Utils
import { cn } from "@/shared/utils/cn";

// Manba tablari (shared Tabs uchun)
const SOURCE_TAB_ITEMS = Object.values(AI_SOURCE_TABS).map((value) => ({
  value,
  label: AI_SOURCE_TAB_LABELS[value],
}));

const MODAL_NAME = "aiGenerate";

/**
 * AI bilan savol generatsiya qilish modali.
 * `openModal("aiGenerate", { testId })` orqali ochiladi.
 */
const AiGenerateModal = () => (
  <ModalWrapper
    name={MODAL_NAME}
    title="AI bilan savol generatsiya qilish"
    description="Mavzu yozing yoki rasm yuklang - AI savollarni avtomatik tuzadi."
    className="max-w-lg"
  >
    <Content />
  </ModalWrapper>
);

const Content = ({ close, isLoading, setIsLoading, testId }) => {
  const queryClient = useQueryClient();

  const [source, setSource] = useState(AI_SOURCE_TABS.PROMPT);
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(AI_DEFAULTS.COUNT);
  const [difficulty, setDifficulty] = useState(AI_DEFAULTS.DIFFICULTY);
  const [type, setType] = useState(AI_DEFAULTS.TYPE);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("source", source);
      formData.append("prompt", prompt);
      formData.append("count", String(count));
      formData.append("difficulty", difficulty);
      formData.append("type", type);
      if (source === AI_SOURCE_TABS.IMAGES) {
        files.forEach((f) => formData.append("files", f));
      }
      return testAiAPI.generate(testId, formData);
    },
    onMutate: () => setIsLoading(true),
    onSuccess: (res) => {
      const created = res.data?.data?.created ?? 0;
      queryClient.invalidateQueries({ queryKey: ["test-questions", testId] });
      toast.success(`${created} ta savol qo'shildi`);
      // Avval loadingni o'chiramiz, keyingi frame'da modal yopiladi
      // (ModalWrapper close guard'i isLoading=false bo'lishini kutadi)
      setIsLoading(false);
      requestAnimationFrame(() => close?.({ generatedAt: Date.now() }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Generatsiya qilinmadi");
      setIsLoading(false);
    },
  });

  const addFiles = (incoming) => {
    const list = Array.from(incoming || []);
    if (list.length === 0) return;
    setFiles((prev) => {
      const merged = [...prev, ...list];
      if (merged.length > AI_MAX_FILES) {
        toast.warning(`Ko'pi bilan ${AI_MAX_FILES} ta fayl yuklash mumkin`);
      }
      return merged.slice(0, AI_MAX_FILES);
    });
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (source === AI_SOURCE_TABS.PROMPT && !prompt.trim()) {
      toast.error("Mavzu yoki ko'rsatma kiriting");
      return;
    }
    if (source === AI_SOURCE_TABS.IMAGES && files.length === 0) {
      toast.error("Kamida bitta rasm yuklang");
      return;
    }
    mutation.mutate();
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit} className="gap-4">
      {/* Manba tablari */}
      <Tabs
        value={source}
        items={SOURCE_TAB_ITEMS}
        onValueChange={setSource}
        listClassName="w-full"
        triggerClassName="flex-1"
      />

      {/* Prompt / mavzu maydoni */}
      <InputField
        type="textarea"
        name="prompt"
        value={prompt}
        disabled={isLoading}
        required={source === AI_SOURCE_TABS.PROMPT}
        label={
          source === AI_SOURCE_TABS.PROMPT
            ? "Mavzu / ko'rsatma"
            : "Qo'shimcha ko'rsatma (ixtiyoriy)"
        }
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          source === AI_SOURCE_TABS.PROMPT
            ? "Masalan: 7-sinf biologiya, hujayra tuzilishi"
            : "Masalan: faqat asosiy tushunchalar bo'yicha savol tuz"
        }
        inputClassName="min-h-24"
      />

      {/* Rasm yuklash zonasi */}
      {source === AI_SOURCE_TABS.IMAGES && (
        <div className="space-y-2">
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
            )}
          >
            <Upload className="mx-auto h-9 w-9 text-gray-400 mb-2" strokeWidth={1.5} />
            <p className="text-sm text-gray-600">
              Rasmlarni bu yerga tashlang yoki{" "}
              <span className="font-medium text-blue-600">tanlash uchun bosing</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rasm · ko'pi bilan {AI_MAX_FILES} ta
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={AI_ACCEPTED_FILES}
            onChange={handleFileChange}
            className="hidden"
          />

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, index) => {
                return (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border"
                  >
                    <ImageIcon size={16} className="text-blue-600 shrink-0" />
                    <span className="text-sm text-gray-800 flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:bg-red-50 size-6 flex items-center justify-center rounded shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Sozlamalar: son, qiyinlik, tur */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InputField
          type="number"
          name="count"
          label="Savollar soni"
          min={AI_DEFAULTS.MIN_COUNT}
          max={AI_DEFAULTS.MAX_COUNT}
          value={count}
          disabled={isLoading}
          onChange={(e) => setCount(Number(e.target.value))}
        />
        <SelectField
          name="difficulty"
          label="Qiyinlik"
          value={difficulty}
          disabled={isLoading}
          onChange={(v) => setDifficulty(v)}
          options={AI_DIFFICULTY_OPTIONS}
          triggerClassName="w-full"
        />
        <SelectField
          name="type"
          label="Savol turi"
          value={type}
          disabled={isLoading}
          onChange={(v) => setType(v)}
          options={QUESTION_TYPE_OPTIONS}
          triggerClassName="w-full"
        />
      </div>

      {/* Tugmalar */}
      <div className="flex flex-col-reverse gap-3 w-full pt-2 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => close?.()}
          disabled={isLoading}
          className="w-full xs:w-auto"
        >
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full gap-2 xs:w-auto"
        >
          <Sparkles size={16} />
          {isLoading ? "Generatsiya qilinmoqda..." : "Generatsiya qilish"}
        </Button>
      </div>
    </InputGroup>
  );
};

/**
 * Modalni ochuvchi tugma. `testId` bilan chaqiriladi.
 */
export const AiGenerateButton = ({ testId, className }) => {
  const { openModal } = useModal();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => openModal(MODAL_NAME, { testId })}
      className={cn(
        "gap-2 border-blue-200 text-blue-700 hover:bg-blue-50",
        className,
      )}
    >
      <Sparkles size={16} />
      AI bilan generatsiya
    </Button>
  );
};

export default AiGenerateModal;
