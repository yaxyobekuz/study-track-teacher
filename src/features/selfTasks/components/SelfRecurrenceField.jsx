// Icons
import { BellRing, Repeat } from "lucide-react";

// Components
import InputField from "@/shared/components/ui/input/InputField";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  MAX_LEAD_DAYS,
  TASK_FREQUENCIES,
  WEEKDAY_OPTIONS,
  describeRecurrence,
} from "../data/selfTasks.data";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const toggle = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/**
 * DOIMIY ISH QOIDASI — "har dushanba 09:00 da", "har 10 kunda bir".
 *
 * ⚠️ QOIDANING O'ZI ISH EMAS: undan server topshiriqlarni VAQTIDAN OLDIN
 * (`leadDays`) yozadi va aynan shu yozilish eslatma bo'ladi. Ikkinchi
 * eslatma mexanizmi yo'q.
 *
 * ⚠️ Hafta kunlari JS konvensiyasida (0 = yakshanba) — serverdagi
 * `taskSchedule.helpers.js` bilan AYNI.
 *
 * ⚠️ BITTA VAQT (admin paneldan farqi): telefon ekranida bir kunga ikki-uch
 * vaqtli jadval o'qilmas bo'lib qolardi. Server bir nechtasini qabul
 * qiladi va admin panelda qo'yilgani bu yerda ro'yxatda KO'RINADI.
 *
 * @param {{ value: object, onChange: (field: string, value: unknown) => void,
 *   disabled?: boolean }} props
 */
const SelfRecurrenceField = ({ value, onChange, disabled = false }) => {
  const { frequency } = value;

  return (
    <div className="space-y-3 rounded-xl bg-indigo-50/40 p-3 ring-1 ring-indigo-100">
      <div className="flex items-center gap-2">
        <Repeat className="size-4 text-indigo-600" />
        <p className="text-sm font-medium text-gray-800">Takrorlanish</p>
      </div>

      {/* Rejim */}
      <div className="grid gap-2 xs:grid-cols-3">
        {TASK_FREQUENCIES.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange("frequency", item.value)}
            className={cn(
              "rounded-xl border bg-white p-2.5 text-left transition-colors disabled:opacity-50",
              frequency === item.value
                ? "border-blue-500 bg-blue-50/60"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <span className="block text-sm font-medium text-gray-900">{item.label}</span>
            <span className="block text-xs leading-snug text-gray-500">{item.hint}</span>
          </button>
        ))}
      </div>

      {/* Haftalik — kunlar */}
      {frequency === "weekly" && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-600">
            Hafta kunlari <span className="text-blue-600">*</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_OPTIONS.map((day) => {
              const active = (value.weekdays || []).includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  disabled={disabled}
                  title={day.full}
                  onClick={() => onChange("weekdays", toggle(value.weekdays || [], day.value))}
                  className={cn(
                    "size-10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50",
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 ring-1 ring-gray-200",
                  )}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Kun oralig'i */}
      {frequency === "days" && (
        <InputField
          required
          min={1}
          max={365}
          type="number"
          label="Har necha kunda"
          value={value.intervalDays}
          disabled={disabled}
          className="xs:max-w-40"
          onChange={(e) => onChange("intervalDays", e.target.value)}
        />
      )}

      {/* Oylik */}
      {frequency === "months" && (
        <div className="space-y-2.5">
          <InputField
            required
            min={1}
            max={24}
            type="number"
            label="Har necha oyda"
            value={value.intervalMonths}
            disabled={disabled}
            className="xs:max-w-40"
            onChange={(e) => onChange("intervalMonths", e.target.value)}
          />
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-600">
              Oyning kunlari <span className="text-blue-600">*</span>
            </p>
            {/* ⚠️ Oyda yo'q kun (31-fevral) o'sha oyning OXIRGI kuniga
                suriladi — qoida jimgina tushib qolmasligi uchun (server
                `taskSchedule.helpers.js`) */}
            <div className="flex flex-wrap gap-1">
              {MONTH_DAYS.map((day) => {
                const active = (value.monthDays || []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange("monthDays", toggle(value.monthDays || [], day))}
                    className={cn(
                      "size-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-50",
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 ring-1 ring-gray-200",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vaqt */}
      <div className="grid gap-2 xs:grid-cols-2">
        <InputField
          type="time"
          label="Boshlanish (ixtiyoriy)"
          value={value.start}
          disabled={disabled}
          onChange={(e) => onChange("start", e.target.value)}
          description="Bo'sh qoldirilsa — faqat muddat"
        />
        <InputField
          required
          type="time"
          label="Tugash vaqti"
          value={value.due}
          disabled={disabled}
          onChange={(e) => onChange("due", e.target.value)}
          description="Haqiqiy muddat — shu vaqt"
        />
      </div>

      {/* Eslatma */}
      <InputField
        min={0}
        max={MAX_LEAD_DAYS}
        type="number"
        label="Necha kun oldin yozilsin"
        value={value.leadDays}
        disabled={disabled}
        className="xs:max-w-48"
        onChange={(e) => onChange("leadDays", e.target.value)}
        description="Ish shu kun oldin ro'yxatingizda paydo bo'ladi"
      />

      <p className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-xs text-gray-600 ring-1 ring-indigo-100">
        <BellRing className="mt-0.5 size-3.5 shrink-0 text-indigo-500" />
        <span>
          <b className="text-gray-900">{describeRecurrence(value)}</b> — ish ro'yxatingizda
          avtomatik paydo bo'ladi va shuning o'zi eslatma bo'ladi.
        </span>
      </p>
    </div>
  );
};

export default SelfRecurrenceField;
