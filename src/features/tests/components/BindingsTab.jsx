// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Link2, Plus } from "lucide-react";

// API
import { testBindingsAPI } from "../api/tests.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import BindingForm from "./BindingForm";
import BindingRow from "./BindingRow";

/**
 * Tab "Biriktirish" - testning biriktiruvlari ro'yxati va yangi qo'shish.
 */
const BindingsTab = ({ test }) => {
  const [showNew, setShowNew] = useState(false);

  const { data: bindings = [], isLoading } = useQuery({
    queryKey: ["test-bindings", test.id],
    queryFn: () =>
      testBindingsAPI.getForTest(test.id).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bindings.length === 0 && !showNew && (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Link2 size={40} className="text-gray-300" />
            <p className="mt-3 text-gray-600">
              Hozircha biriktiruv yo'q. Testni mavsum + fan + sinflarga
              biriktiring.
            </p>
            <Button onClick={() => setShowNew(true)} className="gap-2 mt-4">
              <Plus size={16} />
              Yangi biriktiruv
            </Button>
          </div>
        </Card>
      )}

      {bindings.map((b) => (
        <BindingRow key={b.id} binding={b} testId={test.id} />
      ))}

      {showNew && (
        <Card>
          <BindingForm
            testId={test.id}
            onSaved={() => setShowNew(false)}
            onCancel={() => setShowNew(false)}
          />
        </Card>
      )}

      {!showNew && bindings.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setShowNew(true)}
          className="gap-2 w-full"
        >
          <Plus size={16} />
          Yangi biriktiruv
        </Button>
      )}
    </div>
  );
};

export default BindingsTab;
