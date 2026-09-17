// React
import { useRef, useState } from "react";

// Icons
import { CheckCircle2, Circle, FileText, Film, ImageIcon, UploadCloud, X } from "lucide-react";

// Data
import { FILE_TYPE_LABELS, buildSubmitAccept } from "../data/tasks.data";

const iconFor = (file) =>
  file.type.startsWith("image/") ? ImageIcon : file.type.startsWith("video/") ? Film : FileText;

const DEFAULT_RULES = {
  minFiles: 1,
  maxFiles: 5,
  requireNote: false,
  minNoteLength: 0,
  fileTypes: ["image", "video", "document"],
};

/**
 * Topshiriqni yakunlash formasi. Qoidalar serverdan (`task.submissionRules`)
 * keladi va shu yerda "nazorat ro'yxati" bo'lib ko'rinadi: har bir shart
 * bajarilganda yashil belgi yonadi, hammasi yonmaguncha tugma faol emas.
 * Server baribir qayta tekshiradi.
 *
 * ⚠️ Kamida 1 ta fayl — biznes qoidasi: faylsiz ishni topshirib bo'lmaydi.
 *
 * @param {object} props
 * @param {object} [props.rules]
 * @param {boolean} props.isPending
 * @param {(formData: FormData, reset: () => void) => void} props.onSubmit
 * @param {() => void} props.onCancel
 */
const TaskSubmitForm = ({ rules: incoming, isPending, onSubmit, onCancel }) => {
  const rules = { ...DEFAULT_RULES, ...(incoming || {}) };
  const inputRef = useRef(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);

  const noteLength = note.trim().length;
  const checks = [
    {
      key: "files",
      ok: files.length >= rules.minFiles,
      text:
        rules.minFiles === 1
          ? "Kamida 1 ta fayl yuklang (rasm, hujjat yoki video)"
          : `Kamida ${rules.minFiles} ta fayl yuklang`,
    },
    ...(rules.requireNote || rules.minNoteLength > 0
      ? [
          {
            key: "note",
            ok: rules.requireNote
              ? noteLength >= Math.max(1, rules.minNoteLength)
              : noteLength === 0 || noteLength >= rules.minNoteLength,
            text:
              rules.minNoteLength > 0
                ? `Izoh kamida ${rules.minNoteLength} ta belgi (${noteLength}/${rules.minNoteLength})`
                : "Nima qilganingizni qisqacha yozing",
          },
        ]
      : []),
  ];
  const ready = checks.every((c) => c.ok);

  const addFiles = (list) =>
    setFiles((prev) => [...prev, ...Array.from(list || [])].slice(0, rules.maxFiles));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ready) return;
    const formData = new FormData();
    if (note.trim()) formData.append("note", note.trim());
    files.forEach((file) => formData.append("files", file));
    onSubmit(formData, () => {
      setNote("");
      setFiles([]);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Fayllar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            Bajarilgan ish fayllari <span className="text-blue-600">*</span>
          </p>
          <span className="text-xs text-gray-400">
            {files.length}/{rules.maxFiles}
          </span>
        </div>

        <button
          type="button"
          disabled={files.length >= rules.maxFiles}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-4 py-5 text-center active:bg-blue-50 disabled:opacity-50"
        >
          <UploadCloud className="size-7 text-blue-500" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-700">
            {files.length >= rules.maxFiles ? "Fayllar soni to'ldi" : "Fayl tanlash"}
          </span>
          <span className="text-xs text-gray-500">
            {rules.fileTypes.map((t) => FILE_TYPE_LABELS[t]).join(", ")}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept={buildSubmitAccept(rules.fileTypes)}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {files.map((file, index) => {
              const Icon = iconFor(file);
              return (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2 text-sm"
                >
                  <Icon className="size-4 shrink-0 text-gray-400" />
                  <span className="min-w-0 flex-1 truncate text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="Olib tashlash"
                    className="rounded p-1 text-gray-400 active:bg-gray-200"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Izoh */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Izoh{" "}
          {rules.requireNote ? (
            <span className="text-blue-600">*</span>
          ) : (
            <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span>
          )}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Nima qildingiz? Qisqacha yozing..."
          className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Nazorat ro'yxati */}
      <ul className="space-y-1.5 rounded-xl bg-gray-50 p-3">
        {checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-xs">
            {c.ok ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="size-4 shrink-0 text-gray-300" />
            )}
            <span className={c.ok ? "text-emerald-700" : "text-gray-600"}>{c.text}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm text-gray-600"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={!ready || isPending}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Yuborilmoqda..." : "Tekshiruvga yuborish"}
        </button>
      </div>
    </form>
  );
};

export default TaskSubmitForm;
