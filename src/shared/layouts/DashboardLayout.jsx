// React
import { useEffect } from "react";

// Router
import { Outlet } from "react-router-dom";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";
import { holidaysAPI } from "@/features/holidays/api/holidays.api";
import { subjectsAPI } from "@/features/subjects/api/subjects.api";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectStore from "@/shared/hooks/useObjectStore";

// Components
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/shadcn/sidebar";
import AppHeader from "@/shared/components/layout/AppHeader";
import AppSidebar from "@/shared/components/layout/AppSidebar";

import SendMessageModal from "@/features/messages/components/SendMessageModal";
import MessageDetailsModal from "@/features/messages/components/MessageDetailsModal";

// Blocked page
import BlockedPage from "@/features/penalties/pages/BlockedPage";

const DashboardLayout = () => {
  actions();

  const { user } = useAuth();

  if (user?.penaltyPoints >= 12) {
    return <BlockedPage />;
  }

  return (
    <>
      {/* Main */}
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 px-4 py-2">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Message Modals */}
      <SendMessageModal />
      <MessageDetailsModal />
    </>
  );
};

const actions = () => {
  const { user } = useAuth();

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore();

  const isOwner = user?.role === "owner";
  const classes = getCollectionData("classes");
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  const { addEntity, hasEntity } = useObjectStore("holidayCheck");

  // Initialize collection (pagination = false)
  useEffect(() => {
    if (!hasCollection("classes")) initialize(false, "classes");
    if (!hasCollection("subjects")) initialize(false, "subjects");
    if (!hasCollection("teachers")) initialize(false, "teachers");
  }, [initialize, hasCollection]);

  const fetchClasses = () => {
    setCollectionLoadingState(true, "classes");

    classesAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "classes");
      })
      .catch(() => {
        setCollectionErrorState(true, "classes");
      });
  };

  const fetchSubjects = () => {
    setCollectionLoadingState(true, "subjects");

    subjectsAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "subjects");
      })
      .catch(() => {
        setCollectionErrorState(true, "subjects");
      });
  };

  const fetchTeachers = () => {
    setCollectionLoadingState(true, "teachers");

    usersAPI
      .getAll({ role: "teacher", limit: 200 })
      .then((res) => {
        setCollection(res.data.data, null, "teachers");
      })
      .catch(() => {
        setCollectionErrorState(true, "teachers");
      });
  };

  const checkTodayHoliday = () => {
    holidaysAPI
      .checkToday()
      .then((res) => addEntity("today", res.data.data))
      .catch(() => {
        addEntity("today", { isHoliday: false, holiday: null });
      });
  };

  useEffect(() => {
    !classes?.length && fetchClasses();
    !subjects?.length && fetchSubjects();
    !teachers?.length && isOwner && fetchTeachers();
    if (!hasEntity("today")) checkTodayHoliday();
  }, [classes?.length, subjects?.length, teachers?.length]);
};

export default DashboardLayout;
