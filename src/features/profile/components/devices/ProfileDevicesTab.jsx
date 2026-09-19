// Icons
import { Laptop, ShieldCheck } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/form/button";
import SessionRow from "@/features/auth/components/SessionRow";
import TerminateSessionModal from "./TerminateSessionModal";
import TerminateOtherSessionsModal from "./TerminateOtherSessionsModal";

// Data & queries
import { spansBranches } from "@/features/auth/data/sessions.data";
import { profileQueries } from "../../queries/profile.queries";

/**
 * QURILMALARIM — Telegram "Qurilmalar" ko'rinishi.
 *
 * Tepada SHU qurilma va "boshqa hammasini yakunlash", pastda qolgan ochiq
 * seanslar — har birini alohida yakunlash mumkin. O'qituvchida bir vaqtda
 * ko'pi bilan 4 ta seans (server `limit`): to'lgan bo'lsa, yangi qurilmadan
 * kirishda shu ro'yxatdan birini yakunlash so'raladi.
 *
 * ⚠️ Joriy seans bu yerdan yakunlanmaydi — u "Chiqish" tugmasi.
 */
const ProfileDevicesTab = () => {
  const { openModal } = useModal();
  const { data, isLoading, isError } = useQuery(profileQueries.sessions());

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  if (isError) {
    return (
      <Card className="text-center">
        <p className="text-sm text-red-500">Qurilmalar ro'yxatini yuklab bo'lmadi</p>
      </Card>
    );
  }

  const { limit, total, current, others } = data;
  const showBranch = spansBranches([current, ...others].filter(Boolean));

  return (
    <div className="space-y-4">
      {/* Shu qurilma */}
      <Card title="Shu qurilma" icon={<ShieldCheck className="size-5 text-green-600" />}>
        {current ? (
          <SessionRow session={current} showBranch={showBranch} />
        ) : (
          // Eski (seanssiz) token — qayta kirilgach shu yerda ko'rinadi
          <p className="mt-3 text-sm text-gray-500">
            Shu qurilmaning seansi aniqlanmadi. Qaytadan tizimga kirsangiz, u shu
            yerda ko'rinadi.
          </p>
        )}

        {limit != null && (
          <p className="mt-1 text-sm text-gray-500">
            Bir vaqtda ko'pi bilan <b className="text-gray-900">{limit} ta</b>{" "}
            qurilmadan kirish mumkin — hozir{" "}
            <b className={total >= limit ? "text-amber-600" : "text-gray-900"}>
              {total} tasi
            </b>{" "}
            band.
          </p>
        )}

        {others.length > 0 && (
          <Button
            type="button"
            variant="neutral"
            onClick={() =>
              openModal("terminateOtherSessions", { count: others.length })
            }
            className="mt-4 w-full px-4 text-red-600 xs:w-auto"
          >
            Boshqa barcha seanslarni yakunlash
          </Button>
        )}

        <p className="mt-3 text-xs text-gray-400">
          Shu qurilmadan chiqish uchun menyudagi "Chiqish" tugmasidan foydalaning.
        </p>
      </Card>

      {/* Boshqa qurilmalar */}
      <Card
        title={`Faol seanslar${others.length ? ` (${others.length})` : ""}`}
        icon={<Laptop className="size-5 text-gray-500" />}
      >
        {others.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="Boshqa qurilmalarda ochiq seans yo'q"
            description="Hisobingizga faqat shu qurilmadan kirilgan."
            className="py-8"
          />
        ) : (
          <div className="mt-1 divide-y divide-gray-100">
            {others.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                showBranch={showBranch}
                action={
                  <Button
                    size="sm"
                    type="button"
                    variant="neutral"
                    onClick={() => openModal("terminateSession", { session })}
                    className="shrink-0 px-3 text-sm text-red-600"
                  >
                    Yakunlash
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </Card>

      <TerminateSessionModal />
      <TerminateOtherSessionsModal />
    </div>
  );
};

export default ProfileDevicesTab;
