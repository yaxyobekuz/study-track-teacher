// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * QURILMALAR LIMITI TO'LGAN — login javobi 409 (`session_limit`).
 *
 * ⚠️ FAQAT XABAR. Boshqa qurilmalar ro'yxati (qurilma, IP, vaqt) va ularni
 * yakunlash tugmalari bu yerda YO'Q: login oynasidagi odam hisob egasi
 * ekani isbotlanmagan — parolni bilgan begona odam egasining seanslarini
 * yopib, o'zi kirib olardi. Joy bo'shatish — allaqachon kirgan qurilmadan
 * (Profil → Qurilmalar) yoki administrator orqali.
 *
 * Oyna ma'lumoti — server `details`: `{ limit }`.
 */
const SessionLimitModal = () => (
  <ResponsiveModal name="sessionLimit" title="Qurilmalar limiti to'lgan">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, limit }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-600">
      Siz <b>{limit} ta</b> qurilmadan kirib bo'lgansiz. Yangi qurilmadan kirish
      uchun avval boshqa qurilmalaringizdan birida tizimdan chiqing yoki
      administratorga murojaat qiling.
    </p>

    <div className="flex justify-end">
      <Button
        type="button"
        onClick={() => close()}
        className="w-full px-4 xs:w-auto"
      >
        Tushunarli
      </Button>
    </div>
  </div>
);

export default SessionLimitModal;
