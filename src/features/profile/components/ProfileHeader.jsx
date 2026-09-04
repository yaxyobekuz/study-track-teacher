// Icons
import { MapPin } from "lucide-react";

// Helpers & data
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { getInitials, getRoleBadgeClass } from "../data/profile.data";

/**
 * Profil sarlavhasi: kim ekani, roli va qaysi filialda ishlashi.
 *
 * Filial yorlig'i ATAYLAB: dars jadvali ham, oylik ham aynan shu filialga
 * tegishli — bir necha filialda ishlaydigan xodim qaysi filialning
 * raqamini ko'rayotganini bilishi kerak.
 */
const ProfileHeader = ({ user }) => {
  const fullName =
    user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-600">
        {getInitials(user)}
      </span>

      <div className="min-w-0">
        <h1 className="page-title">{fullName}</h1>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">@{user.username}</span>

          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(user.role)}`}
          >
            {getRoleLabel(user.role)}
          </span>

          {user.branch?.name && (
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              <MapPin className="size-3" strokeWidth={1.5} />
              {user.branch.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
