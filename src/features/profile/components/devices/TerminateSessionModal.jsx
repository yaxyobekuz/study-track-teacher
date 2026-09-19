// Toast
import { toast } from "sonner";

// Mutations
import { useTerminateSession } from "../../queries/profile.mutations";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/** Bitta qurilmadagi seansni yakunlashni tasdiqlash. Ma'lumot: `{ session }`. */
const TerminateSessionModal = () => (
  <ResponsiveModal name="terminateSession" title="Seansni yakunlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, session }) => {
  const { mutate: terminate } = useTerminateSession();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!session) return;
    setIsLoading(true);

    terminate(session.id, {
      onSuccess: (res) => {
        close();
        toast.success(res?.message || "Seans yakunlandi");
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
        <b className="text-gray-900">
          {session?.device}
          {session?.deviceTag ? ` ${session.deviceTag}` : ""}
        </b>{" "}
        ({session?.channelLabel}) qurilmasidagi seans yakunlanadi. U yerda
        qaytadan tizimga kirish kerak bo'ladi.
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

        <Button autoFocus variant="danger" disabled={isLoading} className="w-full xs:w-32">
          Yakunlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default TerminateSessionModal;
