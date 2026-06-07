// React
import { useMemo, useState, useEffect } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { X, Loader2 } from "lucide-react";

// API
import { testBindingsAPI } from "../api/tests.api";
import { testSeasonsAPI } from "@/features/test-seasons/api/testSeasons.api";
import { teacherAssignmentsAPI } from "@/features/assignments/api/teacherAssignments.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Biriktiruv (yaratish/tahrirlash) inline form.
 *
 * @param {object} props
 * @param {string} props.testId - test ID (yangi yaratish uchun)
 * @param {object|null} props.binding - mavjud biriktiruv (tahrirlash uchun)
 * @param {Function} props.onSaved - saqlangach
 * @param {Function} props.onCancel - bekor qilish
 */
const BindingForm = ({ testId, binding = null, onSaved, onCancel }) => {
  const isEdit = Boolean(binding?._id);
  const queryClient = useQueryClient();

  const [season, setSeason] = useState(binding?.season?._id || binding?.season || "");
  const [subject, setSubject] = useState(binding?.subject?._id || binding?.subject || "");
  const [classIds, setClassIds] = useState(
    (binding?.classes || []).map((c) => c._id?.toString() || c.toString()),
  );

  // Faol mavsumlar
  const { data: seasons = [] } = useQuery({
    queryKey: ["test-seasons", "active"],
    queryFn: () => testSeasonsAPI.getActive().then((res) => res.data.data),
  });

  // O'qituvchining biriktiruvlari (sinflar va fanlarni filterlash uchun)
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments", "my", season],
    queryFn: () =>
      teacherAssignmentsAPI
        .getMy({ season })
        .then((res) => res.data.data),
    enabled: Boolean(season),
  });

  // Mavsumdagi fanlar (unique)
  const subjectOptions = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      if (a.subject && !map.has(a.subject._id)) {
        map.set(a.subject._id, {
          label: a.subject.name,
          value: a.subject._id,
        });
      }
    }
    return [...map.values()];
  }, [assignments]);

  // Tanlangan fanga mos sinflar
  const availableClasses = useMemo(() => {
    if (!subject) return [];
    const map = new Map();
    for (const a of assignments) {
      if (
        a.subject?._id?.toString() === subject?.toString() &&
        a.class &&
        !map.has(a.class._id)
      ) {
        map.set(a.class._id.toString(), {
          _id: a.class._id.toString(),
          name: a.class.name,
        });
      }
    }
    return [...map.values()];
  }, [assignments, subject]);

  // Fan o'zgartirilganda mos kelmaydigan sinflarni tozalash
  useEffect(() => {
    if (subject) {
      setClassIds((ids) =>
        ids.filter((id) => availableClasses.some((c) => c._id === id)),
      );
    }
  }, [subject, availableClasses]);

  const seasonOptions = seasons.map((s) => ({ label: s.name, value: s._id }));

  const toggleClass = (id) => {
    setClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { season, subject, classes: classIds };
      return isEdit
        ? testBindingsAPI.update(binding._id, payload)
        : testBindingsAPI.create(testId, payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["test-bindings", testId] });
      toast.success(isEdit ? "Biriktiruv yangilandi" : "Biriktiruv yaratildi");
      onSaved?.(res.data.data);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Saqlanmadi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!season) return toast.error("Mavsum tanlanmagan");
    if (!subject) return toast.error("Fan tanlanmagan");
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SelectField
          name="season"
          label="Mavsum"
          required
          value={season}
          onChange={(v) => {
            setSeason(v);
            setSubject("");
            setClassIds([]);
          }}
          options={seasonOptions}
          placeholder="Mavsumni tanlang"
          triggerClassName="w-full"
          disabled={isEdit && binding?.status !== "draft"}
        />
        <SelectField
          name="subject"
          label="Fan"
          required
          value={subject}
          onChange={(v) => setSubject(v)}
          options={subjectOptions}
          placeholder={season ? "Fanni tanlang" : "Avval mavsum"}
          triggerClassName="w-full"
          disabled={!season || (isEdit && binding?.status !== "draft")}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Sinflar ({classIds.length} tanlangan)
        </label>
        {!subject ? (
          <p className="text-sm text-gray-500">Avval fan tanlang</p>
        ) : availableClasses.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ushbu mavsum va fan bo'yicha sinflar biriktirilmagan
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableClasses.map((c) => {
              const isSelected = classIds.includes(c._id);
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => toggleClass(c._id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300",
                  )}
                >
                  {c.name}
                  {isSelected && <X size={12} className="inline ml-1.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Bekor qilish
        </Button>
        <Button type="submit" disabled={mutation.isPending} className="gap-2">
          {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Saqlash" : "Yaratish"}
        </Button>
      </div>
    </form>
  );
};

export default BindingForm;
