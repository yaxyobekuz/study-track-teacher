// Components
import Card from "@/shared/components/ui/Card";
import TestForm from "../components/TestForm";

/**
 * Yangi test sahifasi (V3 - mavsumdan mustaqil).
 */
const CreateTestPage = () => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Yangi test</h1>
        <p className="text-gray-600 mt-1">
          Test "tayyorlanmoqda" holatida yaratiladi. Yaratilgach savollar
          qo'shasiz va keyinroq mavsumga biriktirasiz.
        </p>
      </div>

      <Card>
        <TestForm />
      </Card>
    </div>
  );
};

export default CreateTestPage;
