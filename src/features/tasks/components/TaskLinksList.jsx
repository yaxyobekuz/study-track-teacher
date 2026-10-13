// Icons
import { ExternalLink, Link2 } from "lucide-react";

/**
 * Topshiriqqa biriktirilgan havolalar.
 *
 * ⚠️ IKKI QAVAT HIMOYA: server faqat http(s) ni saqlaydi, bu yerda esa
 * chizishdan OLDIN yana bir marta tekshiriladi — `javascript:` havolasi
 * bosiladigan element bo'lib chiqmasligi kerak.
 *
 * `rel="noopener noreferrer"` majburiy: aks holda ochilgan sahifa
 * `window.opener` orqali panelni boshqara olardi.
 *
 * @param {{ links?: Array<{url: string, label?: string}> }} props
 */
const TaskLinksList = ({ links = [] }) => {
  const safe = links.filter((link) => {
    try {
      return ["http:", "https:"].includes(new URL(link.url).protocol);
    } catch {
      return false;
    }
  });

  if (safe.length === 0) return null;

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-500">
        <Link2 className="size-3.5" />
        Havolalar ({safe.length})
      </p>
      <ul className="space-y-1.5">
        {safe.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-blue-50/60 px-3 py-2 text-sm active:bg-blue-100"
            >
              <ExternalLink className="size-4 shrink-0 text-blue-500" />
              <span className="min-w-0 flex-1 truncate font-medium text-blue-700">
                {link.label || link.url}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskLinksList;
