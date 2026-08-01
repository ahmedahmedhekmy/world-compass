import { ShieldCheck, Tag, RefreshCw, Smartphone, Compass, ListChecks } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

const ICONS = [ShieldCheck, Tag, RefreshCw, Smartphone, Compass, ListChecks];

/** Trust badges. Labels are editable from the dashboard settings. */
export function TrustBadges({ compact = false }: { compact?: boolean }) {
  const { trust } = useSiteSettings();
  const badges = trust.badges;

  return (
    <ul
      className={
        compact
          ? "flex flex-wrap justify-center gap-2 text-xs"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {badges.map((b, i) => {
        const Icon = ICONS[i % ICONS.length]!;
        return (
          <li
            key={b}
            className={
              compact
                ? "inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground"
                : "flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold"
            }
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            <span>{b}</span>
          </li>
        );
      })}
    </ul>
  );
}
