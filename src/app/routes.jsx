// Layouts
import DashboardLayout from "@/shared/layouts/DashboardLayout";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";

// Pages — Auth
import LoginPage from "@/features/auth/pages/LoginPage";

// Pages — Dashboard
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// Pages — Grades
import GradesPage from "@/features/grades/pages/GradesPage";
import AddGradePage from "@/features/grades/pages/AddGradePage";

// Pages — Schedules
import SchedulesPage from "@/features/schedules/pages/SchedulesPage";

// Pages — Messages
import TeacherMessagesPage from "@/features/messages/pages/TeacherMessagesPage";

// Pages — Tasks
import MyTasksPage from "@/features/tasks/pages/MyTasksPage";
import TaskDetailPage from "@/features/tasks/pages/TaskDetailPage";

// Pages — Penalties
import CreatePenaltyPage from "@/features/penalties/pages/CreatePenaltyPage";
import MyPenaltiesPage from "@/features/penalties/pages/MyPenaltiesPage";
import GivenPenaltiesPage from "@/features/penalties/pages/GivenPenaltiesPage";

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
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
