// Icons
import { Building2 } from "lucide-react";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// Sidebar
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/components/shadcn/sidebar";

/**
 * Joriy filial yorlig'i.
 *
 * O'qituvchi bitta filialda ishlaydi va uni ALMASHTIRA OLMAYDI (filial
 * tokenning ichida, imzolangan). Shuning uchun bu — bosilmaydigan yorliq:
 * ekrandagi hamma narsa qaysi filialga tegishli ekanini aytadi.
 */
const BranchLabel = () => {
  const { user } = useAuth();
  const branch = user?.branch;

  if (!branch) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={branch.name}
          className="cursor-default"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
            <Building2 size={16} strokeWidth={1.5} />
          </div>

          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-[11px] uppercase tracking-wide opacity-60">
              Filial
            </span>
            <span className="truncate text-sm font-medium">{branch.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default BranchLabel;
