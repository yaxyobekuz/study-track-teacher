// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DEVICE_KIND_META, sessionActivity } from "../data/sessions.data";

/**
 * BITTA SEANS QATORI — Telegram "Qurilmalar" ro'yxatidagi kabi: qurilma,
 * panel va IP, oxirgi faollik. O'ng tomonda ixtiyoriy amal (yakunlash).
 *
 * @param {object} props
 * @param {object} props.session - `GET /auth/sessions` elementi
 * @param {boolean} [props.showBranch=false] - filial nomini ko'rsatish
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className]
 */
const SessionRow = ({ session, showBranch = false, action = null, className = "" }) => {
  const meta = DEVICE_KIND_META[session.deviceKind] ?? DEVICE_KIND_META.unknown;
  const Icon = meta.icon;
  const activity = sessionActivity(session);

  const details = [
    session.channelLabel,
    session.ip,
    showBranch ? session.branchName : null,
  ].filter(Boolean);

  return (
    <div
      className={cn("flex items-center gap-3 py-3", className)}
      title={`Kirgan: ${session.createdLabel}`}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          meta.className,
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">
          {session.device}
          {session.deviceTag && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {session.deviceTag}
            </span>
          )}
        </p>

        {/* Qirqilmaydi, qatorga o'tadi: tor ekranda IP — qurilmani tanib
            olishning asosiy belgisi, "127.0..." bo'lib qolmasin */}
        {details.length > 0 && (
          <p className="break-words text-sm text-gray-500">{details.join(" · ")}</p>
        )}

        <p
          className={cn(
            "text-xs",
            activity.online ? "text-green-600" : "text-gray-400",
          )}
        >
          {activity.text}
        </p>
      </div>

      {action}
    </div>
  );
};

export default SessionRow;
