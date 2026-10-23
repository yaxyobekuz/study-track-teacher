// React
import { useState } from "react";

// Icons
import { MessageSquarePlus } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";

// Data
import {
  MARK_STATUS_OPTIONS,
  MARK_SELECTED_COLORS,
} from "../data/studentAttendance.data";

/**
 * Bitta o'quvchi qatori — telefon ekraniga mo'ljallangan karta.
 *
 * ⚠️ IZOH IXTIYORIY va HAR QANDAY holatda yoziladi (server qoidasi bilan
 * AYNI): "Sababli" tanlanganda ham majburiy maydon so'ralmaydi. Shuning
 * uchun maydon tugma bilan ochiladi — ro'yxat uzun bo'lib ketmasligi uchun,
 * lekin yozilgan izoh HAR DOIM ko'rinadi.
 *
 * ⚠️ O'ZGARGAN qator fon rangi bilan belgilanadi: o'qituvchi "Saqlash"
 * bosishdan oldin aynan nima o'zgarganini ko'rishi kerak.
 *
 * @param {object} props
 * @param {{student: object, markedBy: object|null, attendance: object|null}} props.row
 * @param {number} props.index - ro'yxatdagi tartib raqami
 * @param {{status: string|null, note: string}} props.mark
 * @param {boolean} props.changed
 * @param {boolean} props.disabled
 * @param {Function} props.onStatusChange - (status) => void
 * @param {Function} props.onNoteChange - (note) => void
 */
const StudentMarkRow = ({
  row,
  index,
  mark = {},
  changed = false,
  disabled = false,
  onStatusChange,
  onNoteChange,
}) => {
  const note = mark.note || "";
  const [noteOpen, setNoteOpen] = useState(false);
  const showNote = noteOpen || note.trim().length > 0;

  const { student, markedBy, attendance } = row;

  return (
    <div
      className={cn(
        "space-y-2.5 border-t border-gray-100 p-3 first:border-t-0 xs:p-4",
        changed && "bg-amber-50/60",
      )}
    >
      {/* Ism + kim belgilagani */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900">
            <span className="mr-1.5 text-gray-400">{index}.</span>
            {student.lastName} {student.firstName}
          </p>

          {/* Kim belgilagani — boshqaning qarori jim qolmasin */}
          {markedBy && (
            <p className="mt-0.5 text-xs text-gray-500">
              {attendance?.autoMarked
                ? "Avtomat belgilangan"
                : markedBy.isMe
                  ? "Siz belgilagansiz"
                  : `${markedBy.name} belgilagan`}
            </p>
          )}
          {!markedBy && attendance?.autoMarked && (
            <p className="mt-0.5 text-xs text-gray-500">Avtomat belgilangan</p>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          className="size-9 shrink-0"
          title="Izoh (ixtiyoriy)"
          onClick={() => setNoteOpen((open) => !open)}
        >
          <MessageSquarePlus strokeWidth={1.5} />
        </Button>
      </div>

      {/* Holat tugmalari */}
      <div className="grid grid-cols-4 gap-1.5">
        {MARK_STATUS_OPTIONS.map((opt) => {
          const selected = mark.status === opt.value;

          return (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                "px-1 text-xs xs:text-sm",
                selected &&
                  cn(MARK_SELECTED_COLORS[opt.value], "border-transparent shadow-sm"),
              )}
            >
              {opt.short}
            </Button>
          );
        })}
      </div>

      {/* Izoh */}
      {showNote && (
        <Input
          value={note}
          maxLength={300}
          disabled={disabled}
          placeholder="Izoh (ixtiyoriy)"
          className="h-9"
          onChange={(e) => onNoteChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default StudentMarkRow;
