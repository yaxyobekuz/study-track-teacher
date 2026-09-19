// Toast
import { toast } from "sonner";

// Mutations
import { useTerminateOtherSessions } from "../../queries/profile.mutations";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Shu qurilmadan boshqa hamma seanslarni yakunlashni tasdiqlash
 * (Telegram "Boshqa seanslarni yakunlash"). Ma'lumot: `{ count }`.
 */
const TerminateOtherSessionsModal = () => (
  <ResponsiveModal name="terminateOtherSessions" title="Boshqa seanslarni yakunlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, count }) => {
  const { mutate: terminateOthers } = useTerminateOtherSessions();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    terminateOthers(undefined, {
      onSuccess: (res) => {
        close();
        toast.success(res?.message || "Seanslar yakunlandi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Shu qurilmadan tashqari <b className="text-gray-900">{count} ta</b>{" "}
        qurilmadagi seans yakunlanadi. Ularda qaytadan tizimga kirish kerak
        bo'ladi.
      </p>

      <div className="flex flex-col-reverse gap-3.5 w-full xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={() => close()}
          variant="neutral"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus variant="danger" disabled={isLoading} className="w-full xs:w-40">
          Hammasini yakunlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default TerminateOtherSessionsModal;
