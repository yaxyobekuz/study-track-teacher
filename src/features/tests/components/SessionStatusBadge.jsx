// Data
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
} from "@/features/grading/data/resultStatuses.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Sessiya holati uchun rangli badge (Javoblar ro'yxati va detal sahifasida).
 */
const SessionStatusBadge = ({ status }) => (
  <span
    className={cn(
      "px-2 py-0.5 rounded-md text-xs font-medium",
      SESSION_STATUS_COLORS[status] || "bg-gray-100 text-gray-700",
    )}
  >
    {SESSION_STATUS_LABELS[status] || status}
  </span>
);

export default SessionStatusBadge;
