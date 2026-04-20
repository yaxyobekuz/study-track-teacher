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

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Animations
import { lockWithKeyEmojiAnimation } from "@/shared/assets/animations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import MainBackgroundPatterns from "@/shared/components/bg/MainBackgroundPatterns";

const LoginPage = () => {
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
    </div>
  );
};

const LoginForm = ({}) => {
  const navigate = useNavigate();

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
        // Save token to localStorage
        const { token } = response.data.data;
        localStorage.setItem("authToken", token);

        // Navigate to dashboard
        navigate("/dashboard");
      })
      .catch((error) => {
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
