// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";

// Data
import {
  MARK_STATUS_OPTIONS,
  MARK_SELECTED_COLORS,
} from "../data/studentAttendance.data";

/**
 * "Barchasini belgilash" + saqlash.
 *
 * ⚠️ Ommaviy tugma faqat KO'RINIB TURGAN qatorlarga qo'llanadi (qidiruv
 * bilan qisqartirilgan ro'yxat ham shu tugmaga bo'ysunadi), aks holda
 * "4 ta o'quvchi ko'rinib turgan" ekranda butun sinf belgilanib ketardi.
 *
 * @param {Function} onBulk - (status) => void
 * @param {number} dirtyCount - saqlanadigan o'zgarishlar soni
 * @param {Function} onSave
 * @param {boolean} isSaving
 * @param {boolean} disabled - maktabda emas / kun yopiq
 */
const MarkToolbar = ({
  onBulk,
  dirtyCount = 0,
  onSave,
  isSaving = false,
  disabled = false,
}) => (
  <div className="space-y-3 rounded-2xl bg-white p-3 xs:p-4">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Barchasini:</span>

      {MARK_STATUS_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onBulk(opt.value)}
          className={cn(MARK_SELECTED_COLORS[opt.value], "border-transparent")}
        >
          {opt.short}
        </Button>
      ))}
    </div>

    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500">
        {dirtyCount > 0 ? `${dirtyCount} ta o'zgarish` : "O'zgarish yo'q"}
      </span>

      <Button
        type="button"
        className="min-w-28"
        disabled={disabled || dirtyCount === 0 || isSaving}
        onClick={onSave}
      >
        {isSaving ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </div>
  </div>
);

export default MarkToolbar;
