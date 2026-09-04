// Utils
import { cn } from "../utils/cn";

// Router
import { Outlet } from "react-router-dom";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import usePathSegments from "../hooks/usePathSegments";

// Components
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/shadcn/sidebar";
import AppHeader from "@/shared/components/layout/AppHeader";
import AppSidebar from "@/shared/components/layout/AppSidebar";
import PermissionGuard from "@/shared/components/guards/PermissionGuard";

import SendMessageModal from "@/features/messages/components/SendMessageModal";
import MessageDetailsModal from "@/features/messages/components/MessageDetailsModal";
import CancelMessageModal from "@/features/messages/components/CancelMessageModal";

// Blocked page
import BlockedPage from "@/features/penalties/pages/BlockedPage";
import AppBottomNavbar from "../components/layout/AppBottomNavbar";

const DashboardLayout = () => {
  const { matchSegment, isHomePage } = usePathSegments();

  const allowedSegments = ["add-grade", "attendance", "tasks"];
  const isAllowedSegment = allowedSegments.some((seg) => matchSegment(seg));

  const { user } = useAuth();
  if (user?.penaltyPoints >= 12) return <BlockedPage />;

  return (
    <>
      {/* Main */}
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pb-24 md:pb-4 md:py-2">
            {/* Ruxsat bilan ochiladigan bo'limlarni (inventar) to'g'ridan-to'g'ri
                URL orqali kirishdan himoya qiladi; qolgan sahifalarga tegmaydi */}
            <PermissionGuard>
              <Outlet />
            </PermissionGuard>
          </div>

          <AppBottomNavbar
            className={cn(
              "transition-transform duration-300 md:hidden",
              isAllowedSegment || isHomePage
                ? "translate-y-0"
                : "translate-y-full",
            )}
          />
        </SidebarInset>
      </SidebarProvider>

      {/* Message Modals */}
      <SendMessageModal />
      <MessageDetailsModal />
      <CancelMessageModal />
    </>
  );
};

export default DashboardLayout;
