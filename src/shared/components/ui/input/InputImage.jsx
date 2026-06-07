// React
import { useEffect, useId, useMemo, useRef, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ImagePlus, X, RefreshCw } from "lucide-react";

// Components
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/shared/components/shadcn/field";

// Utils
import { cn } from "@/shared/utils/cn";
import { inputBaseClasses } from "./Input";

/**
 * @typedef {Object} ImageItem
 * @property {string} id - Beqaror lokal identifikator.
 * @property {File} [file] - Yangi tanlangan fayl (mavjud bo'lsa).
 * @property {string} [url] - Serverdagi mavjud rasm URL (preview uchun).
 * @property {string} [originalName] - Mavjud rasm nomi.
 */

let _seq = 0;
const nextId = () => `img-${Date.now()}-${_seq++}`;

const ACCEPTED = "image/*";
const MAX_SIZE_MB = 20;

/**
 * Faylni tekshirib normallashtirilgan ImageItem ga aylantiradi.
 * @param {File} file - Tanlangan fayl.
 * @returns {ImageItem|null} Yaroqli bo'lsa item, aks holda null.
 */
const fileToItem = (file) => {
  if (!file || !file.type.startsWith("image/")) {
    toast.error("Faqat rasm fayllari qabul qilinadi");
    return null;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    toast.error(`Rasm hajmi juda katta. Maksimal ${MAX_SIZE_MB}MB.`);
    return null;
  }
  return { id: nextId(), file, originalName: file.name };
};

/**
 * Bitta rasm preview kartasi (thumbnail + nom + o'chirish/qayta yuklash).
 */
const ImagePreview = ({ item, disabled, onRemove, onReplace }) => {
  // Yangi fayl uchun blob URL - render paytida hosil qilinadi
  const objectUrl = useMemo(
    () => (item.file ? URL.createObjectURL(item.file) : null),
    [item.file],
  );

  // Komponent unmount/fayl o'zgarganda blob URL ni tozalaymiz
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl = objectUrl || item.url;
  const name = item.originalName || "Yuklangan rasm";

  return (
    // Butun karta bosilganda boshqa rasm tanlanadi (almashtirish)
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onReplace()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onReplace();
        }
      }}
      title="Boshqa rasm tanlash uchun bosing"
      className={cn(
        "flex items-center gap-2 p-1.5 rounded-lg border border-input bg-white transition-colors",
        disabled
          ? "opacity-60"
          : "cursor-pointer hover:border-primary hover:bg-gray-50",
      )}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={name}
          className="size-10 rounded object-cover border shrink-0"
        />
      ) : (
        <div className="size-10 rounded bg-gray-100 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{name}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <RefreshCw size={11} />
          Almashtirish uchun bosing
        </p>
      </div>

      {/* O'chirish (karta bosilishini to'xtatadi) */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="O'chirish"
        className="text-red-600 hover:bg-red-50 size-7 flex items-center justify-center rounded shrink-0 disabled:opacity-50"
      >
        <X size={14} />
      </button>
    </div>
  );
};

/**
 * Qayta foydalaniladigan rasm yuklash komponenti.
 *
 * Imkoniyatlar:
 * - Bir yoki bir nechta rasm (multiple).
 * - Preview (thumbnail).
 * - Clipboarddan paste (Ctrl+V) - fokus komponent ichida bo'lganda.
 * - Drag & drop.
 * - Qayta yuklash (almashtirish) va o'chirish.
 * - Bo'sh holatda balandligi odatiy Input bilan bir xil (h-10).
 *
 * Controlled: `value` - ImageItem massivi, `onChange(nextItems)`.
 *
 * @param {Object} props
 * @param {ImageItem[]} [props.value=[]] - Joriy rasmlar.
 * @param {(items: ImageItem[]) => void} props.onChange - O'zgarish callbacki.
 * @param {string} [props.label] - Maydon yorlig'i.
 * @param {string} [props.description] - Yordamchi matn.
 * @param {boolean} [props.required] - Majburiy belgisi.
 * @param {boolean} [props.disabled] - O'chirilgan holat.
 * @param {boolean} [props.multiple=false] - Bir nechta rasmga ruxsat.
 * @param {number} [props.maxFiles=10] - Multiple rejimida maksimal son.
 * @param {string} [props.className] - Tashqi konteyner klasslari.
 * @returns {JSX.Element}
 */
const InputImage = ({
  value = [],
  onChange,
  label = "",
  description = "",
  required = false,
  disabled = false,
  multiple = false,
  maxFiles = 10,
  className = "",
}) => {
  const id = useId();
  const fileInputRef = useRef(null);
  const zoneRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  // "Qayta yuklash" bosilganda almashtiriladigan item id (null = yangi qo'shish)
  const replaceTargetRef = useRef(null);

  const items = Array.isArray(value) ? value : [];

  const emit = (next) => onChange?.(next);

  const addItems = (incomingFiles) => {
    const list = Array.from(incomingFiles || []);
    if (list.length === 0) return;

    const newItems = list.map(fileToItem).filter(Boolean);
    if (newItems.length === 0) return;

    // Almashtirish rejimi (bitta itemni boshqasiga)
    if (replaceTargetRef.current) {
      const targetId = replaceTargetRef.current;
      replaceTargetRef.current = null;
      emit(items.map((it) => (it.id === targetId ? newItems[0] : it)));
      return;
    }

    if (!multiple) {
      emit([newItems[0]]);
      return;
    }

    const merged = [...items, ...newItems];
    if (merged.length > maxFiles) {
      toast.warning(`Ko'pi bilan ${maxFiles} ta rasm yuklash mumkin`);
    }
    emit(merged.slice(0, maxFiles));
  };

  const handleFileChange = (e) => {
    addItems(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openPicker = (replaceId = null) => {
    if (disabled) return;
    replaceTargetRef.current = replaceId;
    fileInputRef.current?.click();
  };

  const removeItem = (itemId) => {
    emit(items.filter((it) => it.id !== itemId));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const imageFiles = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    addItems(imageFiles);
  };

  // Clipboarddan paste (Ctrl+V) - zona ichida fokus bo'lganda
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const onPaste = (e) => {
      if (disabled) return;
      const files = Array.from(e.clipboardData?.files || []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) {
        e.preventDefault();
        addItems(files);
      }
    };

    zone.addEventListener("paste", onPaste);
    return () => zone.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, items, multiple, maxFiles]);

  const canAddMore = multiple ? items.length < maxFiles : items.length === 0;

  return (
    <Field data-disabled={disabled} className={className}>
      {label && (
        <FieldLabel htmlFor={id} className="max-w-max">
          {label}
          {required && <span className="text-primary"> *</span>}
        </FieldLabel>
      )}

      <div
        ref={zoneRef}
        tabIndex={-1}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className="space-y-2 outline-none"
      >
        {/* Preview ro'yxati */}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <ImagePreview
                key={item.id}
                item={item}
                disabled={disabled}
                onRemove={() => removeItem(item.id)}
                onReplace={() => openPicker(item.id)}
              />
            ))}
          </div>
        )}

        {/* Bo'sh / qo'shish zonasi - balandligi Input bilan bir xil (h-10) */}
        {canAddMore && (
          <button
            type="button"
            id={id}
            disabled={disabled}
            onClick={() => openPicker(null)}
            className={cn(
              inputBaseClasses,
              "items-center justify-center gap-2 text-sm text-gray-500 cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-blue-50 text-blue-700"
                : "hover:border-primary hover:bg-gray-50",
            )}
          >
            <ImagePlus size={16} />
            {isDragging
              ? "Rasmni shu yerga tashlang"
              : multiple && items.length > 0
                ? "Yana rasm qo'shish"
                : "Rasm yuklash yoki tashlang (Ctrl+V)"}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          multiple={multiple && !replaceTargetRef.current}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};

export default InputImage;
