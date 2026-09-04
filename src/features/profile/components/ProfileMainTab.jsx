// Toast
import { toast } from "sonner";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Mutations
import { useUpdateProfile } from "../queries/profile.mutations";

/**
 * ASOSIY — ism, login va parol.
 *
 * Admin panelidagi profil sahifasi bilan bir xil so'rov (`PUT /users/me`):
 * tekshiruvlar serverda (login bandligi, joriy parol), bu yerda faqat
 * foydalanuvchiga tushunarli xabar. Parol o'zgartirish ixtiyoriy — faqat
 * biror parol maydoni to'ldirilganda yuboriladi.
 *
 * Boshlang'ich qiymat `useObjectState` da BIR MARTA o'qiladi; profil
 * yangilanganda sahifa `key` bilan qayta quradi (`useEffect` sinxronlash
 * o'rniga).
 */
const ProfileMainTab = ({ user }) => {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    firstName,
    lastName,
    username,
    currentPassword,
    newPassword,
    confirmPassword,
    setField,
    setFields,
  } = useObjectState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
    };

    if (!payload.firstName) {
      return toast.error("Ism kiritilishi shart");
    }
    if (payload.username.length < 3) {
      return toast.error("Username kamida 3 ta belgidan iborat bo'lishi kerak");
    }

    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;

    if (wantsPasswordChange) {
      if (!currentPassword) {
        return toast.error("Joriy parolni kiriting");
      }
      if (!newPassword || newPassword.length < 6) {
        return toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      }
      if (newPassword !== confirmPassword) {
        return toast.error("Yangi parol va tasdiqlash mos kelmadi");
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    updateProfile(payload, {
      onSuccess: () => {
        setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Profil muvaffaqiyatli yangilandi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Shaxsiy ma'lumotlar */}
        <Card title="Shaxsiy ma'lumotlar" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              name="firstName"
              label="Ism"
              placeholder="Ism"
              required
              value={firstName}
              onChange={(e) => setField("firstName", e.target.value)}
            />

            <InputField
              name="lastName"
              label="Familiya"
              placeholder="Familiya"
              value={lastName}
              onChange={(e) => setField("lastName", e.target.value)}
            />
          </div>

          <InputField
            name="username"
            label="Username (login)"
            placeholder="username"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setField("username", e.target.value)}
          />
        </Card>

        {/* Parolni o'zgartirish */}
        <Card title="Parolni o'zgartirish" className="space-y-4">
          <p className="text-sm text-gray-500">
            Parolni o'zgartirmoqchi bo'lsangizgina to'ldiring.
          </p>

          <InputField
            type="password"
            name="currentPassword"
            label="Joriy parol"
            placeholder="••••••"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setField("currentPassword", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              type="password"
              name="newPassword"
              label="Yangi parol"
              placeholder="••••••"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setField("newPassword", e.target.value)}
            />

            <InputField
              type="password"
              name="confirmPassword"
              label="Yangi parolni tasdiqlang"
              placeholder="••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
            />
          </div>
        </Card>
      </div>

      <Button type="submit" disabled={isPending}>
        Saqlash{isPending && "..."}
      </Button>
    </form>
  );
};

export default ProfileMainTab;
