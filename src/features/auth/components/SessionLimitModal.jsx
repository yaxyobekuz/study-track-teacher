// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Router
import { useNavigate } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Mutations
import { useResolveSessionLimit } from "../queries/auth.mutations";

// Lib
import { saveSession } from "../lib/session";

// Data
import { spansBranches } from "../data/sessions.data";

// Components
import SessionRow from "./SessionRow";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * QURILMALAR LIMITI TO'LGAN — login javobi 409 (`session_limit`).
 *
 * Odam tizimga hali KIRMAGAN, shuning uchun "Qurilmalar" sahifasini ocha
 * olmaydi — ro'yxat shu yerda ko'rsatiladi va bittasini (yoki hammasini)
 * yakunlagan zahoti kirish davom etadi. Parol qayta so'ralmaydi: server
 * 5 daqiqalik tiket bergan (`details.ticket`).
 *
 * Oyna ma'lumoti — server `details`: `{ limit, sessions, ticket }`.
 */
const SessionLimitModal = () => (
  <ResponsiveModal
    name="sessionLimit"
    title="Qurilmalar limiti to'lgan"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, limit, sessions = [], ticket }) => {
  const navigate = useNavigate();
  const { updateModalData } = useModal();
  const { mutate: resolveLimit } = useResolveSessionLimit();

  // Qaysi tugma bosilgani — faqat o'sha tugmada "..." ko'rinsin
  const [pending, setPending] = useState(null);
  const showBranch = spansBranches(sessions);

  const submit = (payload, key) => {
    setIsLoading(true);
    setPending(key);

    resolveLimit(
      { ticket, ...payload },
      {
        onSuccess: (data) => {
          saveSession(data.token);
          setIsLoading(false);
          close();
          navigate("/dashboard");
        },
        onError: (error) => {
          const response = error.response?.data;

          // Shu lahzada boshqa qurilma kirib olgan — yangilangan ro'yxat
          if (response?.details?.reason === "session_limit") {
            updateModalData("sessionLimit", response.details);
            toast.error(response.message);
            return;
          }

          toast.error(response?.message || "Xatolik yuz berdi");

          // Tiket eskirgan — oyna foydasiz, parolni qayta kiritish kerak
          if (error.response?.status === 400) {
            setIsLoading(false);
            close();
          }
        },
        onSettled: () => {
          setIsLoading(false);
          setPending(null);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Hisobingizga bir vaqtda ko'pi bilan <b>{limit} ta</b> qurilmadan kirish
        mumkin. Shu qurilmada davom etish uchun quyidagi qurilmalardan birini
        yakunlang — u yerda qaytadan kirish kerak bo'ladi.
      </p>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 px-3">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            showBranch={showBranch}
            action={
              <Button
                size="sm"
                type="button"
                variant="neutral"
                disabled={isLoading}
                className="shrink-0 px-3 text-sm text-red-600"
                onClick={() => submit({ sessionIds: [session.id] }, session.id)}
              >
                Yakunlash{pending === session.id && "..."}
              </Button>
            }
          />
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="neutral"
          disabled={isLoading}
          onClick={() => close()}
          className="w-full px-4 xs:w-auto"
        >
          Bekor qilish
        </Button>

        <Button
          type="button"
          variant="danger"
          disabled={isLoading}
          onClick={() => submit({ all: true }, "all")}
          className="w-full px-4 xs:w-auto"
        >
          Hammasini yakunlash va kirish{pending === "all" && "..."}
        </Button>
      </div>
    </div>
  );
};

export default SessionLimitModal;
