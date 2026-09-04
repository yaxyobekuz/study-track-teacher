// Layouts
import DashboardLayout from "@/shared/layouts/DashboardLayout";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";

// Pages - Auth
import LoginPage from "@/features/auth/pages/LoginPage";

// Pages - Dashboard
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// Pages - Grades
import GradesPage from "@/features/grades/pages/GradesPage";
import AddGradePage from "@/features/grades/pages/AddGradePage";

// Pages - Schedules
import SchedulesPage from "@/features/schedules/pages/SchedulesPage";

// Pages - Messages
import TeacherMessagesPage from "@/features/messages/pages/TeacherMessagesPage";

// Pages - Tasks
import MyTasksPage from "@/features/tasks/pages/MyTasksPage";
import TaskDetailPage from "@/features/tasks/pages/TaskDetailPage";

// Pages - Penalties
import CreatePenaltyPage from "@/features/penalties/pages/CreatePenaltyPage";
import MyPenaltiesPage from "@/features/penalties/pages/MyPenaltiesPage";
import GivenPenaltiesPage from "@/features/penalties/pages/GivenPenaltiesPage";

// Pages - Attendance
import AttendancePage from "@/features/attendance/pages/AttendancePage";
import MyAttendancePage from "@/features/attendance/pages/MyAttendancePage";

// Pages - Tests
import TestsPage from "@/features/tests/pages/TestsPage";
import CreateTestPage from "@/features/tests/pages/CreateTestPage";
import TestDetailPage from "@/features/tests/pages/TestDetailPage";
import EditTestPage from "@/features/tests/pages/EditTestPage";
import SessionAnswersPage from "@/features/tests/pages/SessionAnswersPage";

// Pages - Season Rewards
import SeasonsListPage from "@/features/tests/pages/SeasonsListPage";
import SeasonRewardsPage from "@/features/tests/pages/SeasonRewardsPage";

// Pages - Profile
import ProfilePage from "@/features/profile/pages/ProfilePage";

// Pages - Inventar (moddiy-texnik baza) — ruxsat bilan ochiladi
import InventoryLayout from "@/features/inventory/layouts/InventoryLayout";
import InventoryIndex from "@/features/inventory/layouts/InventoryIndex";
import InventoryOverviewPage from "@/features/inventory/pages/OverviewPage";
import InventoryStockPage from "@/features/inventory/pages/StockPage";
import InventoryChecksPage from "@/features/inventory/pages/ChecksPage";
import InventoryCheckDetailPage from "@/features/inventory/pages/CheckDetailPage";
import InventoryDamagesPage from "@/features/inventory/pages/DamagesPage";
import InventoryDebtorsPage from "@/features/inventory/pages/DebtorsPage";
import InventoryCatalogPage from "@/features/inventory/pages/CatalogPage";
import InventorySettingsPage from "@/features/inventory/pages/SettingsPage";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

const Routes = () => {
  return (
    <RoutesWrapper>
      {/* Guest only routes */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Grades */}
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/add-grade" element={<AddGradePage />} />

          {/* Schedules */}
          <Route path="/schedules" element={<SchedulesPage />} />

          {/* Messages */}
          <Route path="/messages" element={<TeacherMessagesPage />} />
          <Route path="/my-messages" element={<TeacherMessagesPage />} />

          {/* Tasks */}
          <Route path="/tasks" element={<MyTasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

          {/* Penalties */}
          <Route path="/penalties/create" element={<CreatePenaltyPage />} />
          <Route path="/penalties/my" element={<MyPenaltiesPage />} />
          <Route path="/penalties/given" element={<GivenPenaltiesPage />} />

          {/* Attendance */}
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/my" element={<MyAttendancePage />} />

          {/* Tests */}
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/tests/create" element={<CreateTestPage />} />
          <Route path="/tests/:id" element={<TestDetailPage />} />
          <Route path="/tests/:id/edit" element={<EditTestPage />} />
          <Route
            path="/tests/:id/answers/:resultId"
            element={<SessionAnswersPage />}
          />

          {/* Seasons & rewards */}
          <Route path="/seasons" element={<SeasonsListPage />} />
          <Route path="/seasons/:id/rewards" element={<SeasonRewardsPage />} />

          {/* Profile — o'z ma'lumotlarim, dars jadvalim, oyligim */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* INVENTAR — admin panel bergan ruxsat bilan ochiladi
              (`PermissionGuard` yo'lni, `Can` esa tugmalarni tekshiradi).
              Admin paneldagi bilan bir xil shakl: bitta sahifa, ichida tablar. */}
          <Route path="/inventory" element={<InventoryLayout />}>
            {/* Ruxsati bor birinchi tab — monitoring-only xodim ham kiradi */}
            <Route index element={<InventoryIndex />} />
            <Route path="overview" element={<InventoryOverviewPage />} />
            <Route path="checks" element={<InventoryChecksPage />} />
            {/* Varaq — tab ichida, chunki u ham monitoring oqimining qismi */}
            <Route path="checks/:id" element={<InventoryCheckDetailPage />} />
            <Route path="damages" element={<InventoryDamagesPage />} />
            <Route path="debtors" element={<InventoryDebtorsPage />} />
            <Route path="stock" element={<InventoryStockPage />} />
            <Route path="catalog" element={<InventoryCatalogPage />} />
            <Route path="settings" element={<InventorySettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
