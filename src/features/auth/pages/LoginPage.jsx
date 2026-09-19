// React
import { useEffect } from "react";

// Toast
import { toast } from "sonner";

// Lottie
import Lottie from "lottie-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { useNavigate } from "react-router-dom";

// Icons
import { logoIcon } from "@/shared/assets/icons";

// API
import { authAPI } from "@/features/auth/api/auth.api";
import { AUTH_NOTICE_KEY } from "@/shared/api/http";

// Lib
import { saveSession } from "@/features/auth/lib/session";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useObjectState from "@/shared/hooks/useObjectState";

// Animations
import { lockWithKeyEmojiAnimation } from "@/shared/assets/animations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import MainBackgroundPatterns from "@/shared/components/bg/MainBackgroundPatterns";
import SessionLimitModal from "@/features/auth/components/SessionLimitModal";

const LoginPage = () => {
  // Seans boshqa qurilmadan ("Qurilmalar") yoki admin tomonidan yakunlangan
  // bo'lsa, odam nega login sahifasiga tushib qolganini bilishi kerak
  useEffect(() => {
    try {
      const notice = sessionStorage.getItem(AUTH_NOTICE_KEY);
      if (notice) {
        sessionStorage.removeItem(AUTH_NOTICE_KEY);
        toast.warning(notice);
      }
    } catch {
      // xotira yopiq — xabarsiz
    }
  }, []);

  return (
    <div className="flex flex-row-reverse w-full h-svh">
      {/* Form */}
      <div
        className={cn(
          "flex items-center justify-center size-full relative z-10 bg-white/50 backdrop-blur px-5 transition-transform duration-500 md:w-1/2",
        )}
      >
        <LoginForm />
      </div>

      {/* Animation Data */}
      <div
        className={cn(
          "hidden items-center justify-center w-1/2 h-full transition-transform duration-500 md:flex",
        )}
      >
        <Lottie
          animationData={lockWithKeyEmojiAnimation}
          className="size-64 animate__animated animate__fadeIn"
        />
      </div>

      {/* Background Patterns */}
      <MainBackgroundPatterns />

      <SessionLimitModal />
    </div>
  );
};

const LoginForm = ({}) => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const { username, password, setField, isLoading } = useObjectState({
    step: 1,
    username: "",
    password: "",
    isLoading: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setField("isLoading", true);

    const data = { username, password: password?.trim() };

    authAPI
      .login(data)
      .then((response) => {
        saveSession(response.data.data.token);
        navigate("/dashboard");
      })
      .catch((error) => {
        // Qurilmalar limiti (o'qituvchi — 4 ta): parol to'g'ri, lekin
        // boshqa qurilmalardan birini yakunlash kerak. Ro'yxat va tiket
        // server javobida — oyna shu yerda ochiladi.
        const details = error.response?.data?.details;
        if (error.response?.status === 409 && details?.reason === "session_limit") {
          openModal("sessionLimit", details);
          return;
        }

        toast.error(
          error.response?.data?.message || "Tizimga kirishda xatolik",
        );
      })
      .finally(() => setField("isLoading", false));
  };

  return (
    <div className="max-w-md w-full animate__animated animate__fadeIn">
      {/* Header */}
      <div className="text-center mb-8 space-y-3.5">
        {/* Title */}
        <h2 className="flex items-center justify-center gap-3.5 text-lg font-medium text-center md:gap-5 md:text-xl">
          <img
            width={32}
            height={32}
            src={logoIcon}
            className="size-8"
            alt="MBSI Logo icon"
          />

          <span>Qaytganingiz bilan!</span>
        </h2>

        {/* Description */}
        <p className="text-gray-600 mt-2">
          Tizimga kirish uchun ma'lumotlaringizni kiriting.
        </p>
      </div>

      {/* Form */}
      <InputGroup as="form" onSubmit={handleSubmit}>
        <InputField
          required
          id="username"
          name="username"
          value={username}
          autoComplete="username"
          label="Foydalanuvchi nomi"
          placeholder="Faqat raqamlar va harflar"
          onChange={(e) =>
            setField("username", e.target.value.trim().toLowerCase())
          }
        />

        <InputField
          required
          id="password"
          label="O'ron"
          type="password"
          name="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setField("password", e.target.value.trim())}
        />

        {/* Action buttons */}
        <Button disabled={isLoading}>Tizimga kirish{isLoading && "..."}</Button>
      </InputGroup>
    </div>
  );
};

export default LoginPage;
