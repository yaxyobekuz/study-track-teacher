// Router
import { useSearchParams } from "react-router-dom";

// Components
import Card from "@/shared/components/ui/Card";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ProfileHeader from "../components/ProfileHeader";
import ProfileMainTab from "../components/ProfileMainTab";
import ProfilePayrollTab from "../components/ProfilePayrollTab";
import ProfileWorkloadTab from "../components/ProfileWorkloadTab";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// Data
import { PROFILE_TABS, resolveTab } from "../data/profile.data";

/**
 * PROFIL — xodim o'zi haqidagi ma'lumotni ko'radi va tahrirlaydi.
 *
 * Uch tab: Asosiy (ism, login, parol), Dars jadvali (faqat o'qituvchida)
 * va Oylik. Oxirgi ikkitasi admin paneldagi xodim kartasining aynan
 * o'zi — lekin bu yerda faqat O'ZINIKI: so'rovlar tokendagi odam bo'yicha
 * ishlaydi, ruxsat kaliti kerak emas.
 *
 * Tab URL'da (`?tab=payroll`): sahifani ochiq tab bilan link qilib
 * yuborish mumkin va brauzerning "orqaga" tugmasi tab bo'yicha ishlaydi.
 */
const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  if (loading || !user) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  // Bu rolga ma'nosiz tab umuman ko'rinmaydi — bo'sh sahifa ochilishidan
  // ko'ra tabning o'zi bo'lmagani tushunarliroq.
  const tabs = PROFILE_TABS.filter(
    (tab) => !tab.roles || tab.roles.includes(user.role),
  );
  const tab = resolveTab(tabs, searchParams.get("tab"));

  const setTab = (value) =>
    setSearchParams(
      (prev) => {
        if (value === tabs[0].value) prev.delete("tab");
        else prev.set("tab", value);
        return prev;
      },
      { replace: true },
    );

  return (
    <div className="space-y-4">
      <ProfileHeader user={user} />

      {/* TabsList o'zi gorizontal scroll qiladi — tor ekranda ham sig'adi */}
      <TabsButtons
        value={tab}
        onChange={setTab}
        items={tabs}
        listClassName="hidden-scrollbar"
      />

      {/* `key` — profil yangilangach forma boshlang'ich qiymatni qayta o'qiydi */}
      {tab === "main" && (
        <ProfileMainTab key={user.updatedAt ?? user.id} user={user} />
      )}

      {tab === "workload" && <ProfileWorkloadTab />}

      {tab === "payroll" && <ProfilePayrollTab />}
    </div>
  );
};

export default ProfilePage;
