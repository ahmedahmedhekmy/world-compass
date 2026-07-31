import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** Visual breadcrumbs. Pair with breadcrumbJsonLd() in the route head for structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار التصفح" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link to="/" className="hover:text-foreground">
            الرئيسية
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronLeft className="size-3 shrink-0 opacity-60 rtl:rotate-0" />
            {item.href ? (
              <a href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "الرئيسية", item: "/" }, ...items].map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}
