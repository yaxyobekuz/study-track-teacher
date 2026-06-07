// React
import { useEffect, useState } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { Plus, Trash2, Save } from "lucide-react";

// API
import { testSeasonsAPI } from "@/features/test-seasons/api/testSeasons.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * O'qituvchi uchun sinf top-N tier konfiguratsiyasi.
 * O'qituvchi faqat biriktirilgan sinflar uchun darajani belgilashi mumkin.
 */
const ClassTiersInlineForm = ({ season, classId, className }) => {
  const queryClient = useQueryClient();
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const existing = (season.classTiers || []).filter(
      (ct) => (ct.class?._id?.toString() || ct.class?.toString()) === classId?.toString(),
    );
    setTiers(
      existing
        .map((t) => ({
          position: t.position,
          coinReward: t.coinReward,
        }))
        .sort((a, b) => a.position - b.position),
    );
  }, [season._id, season.classTiers, classId]);

  const addTier = () => {
    const nextPos =
      tiers.length === 0
        ? 1
        : Math.max(...tiers.map((t) => t.position)) + 1;
    setTiers([...tiers, { position: nextPos, coinReward: 0 }]);
  };

  const removeTier = (i) => setTiers(tiers.filter((_, idx) => idx !== i));

  const updateTier = (i, patch) =>
    setTiers(tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const mutation = useMutation({
    mutationFn: () => testSeasonsAPI.setClassTiers(season._id, classId, tiers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-season", season._id] });
      toast.success(`${className} uchun darajalar saqlandi`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Saqlanmadi"),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          {className} - o'rinlar uchun mukofotlar
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTier}
          className="gap-1.5"
        >
          <Plus size={14} />
          O'rin
        </Button>
      </div>

      {tiers.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          Bu sinf uchun daraja belgilanmagan
        </p>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
            >
              <InputField
                type="number"
                label="O'rin"
                min={1}
                value={tier.position}
                onChange={(e) =>
                  updateTier(i, { position: Number(e.target.value) })
                }
              />
              <InputField
                type="number"
                label="Coin"
                min={0}
                value={tier.coinReward}
                onChange={(e) =>
                  updateTier(i, { coinReward: Number(e.target.value) })
                }
              />
              <button
                type="button"
                onClick={() => removeTier(i)}
                className="size-9 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t">
        <Button
          type="button"
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="gap-1.5"
        >
          <Save size={14} />
          {mutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default ClassTiersInlineForm;
