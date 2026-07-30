import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Globe, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/explore", label: "استكشف العالم" },
  { to: "/countries", label: "الدول" },
  { to: "/guides", label: "أدلة السفر" },
  { to: "/offers", label: "عروض الأسبوع" },
  { to: "/calculator", label: "احسب تكلفة رحلتك" },
  { to: "/plan", label: "خطط رحلتك" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

const languages = ["العربية", "English", "Français", "Español", "Deutsch"];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("العربية");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl surface-deep">
            <Compass className="size-5" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-extrabold">Travel Smart Budget</span>
            <span className="block truncate text-[11px] text-muted-foreground">سافر بذكاء</span>
          </span>
        </Link>

        <nav className="hidden justify-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <label className="hidden items-center gap-1 rounded-full border border-border px-2 py-1.5 text-xs sm:flex">
            <Globe className="size-3.5 text-muted-foreground" />
            <span className="sr-only">اختر اللغة</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-xs outline-none"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <Button asChild size="sm" variant="hero" className="hidden sm:inline-flex">
            <Link to="/calculator">احسب ميزانيتك</Link>
          </Button>
          <button
            className="grid size-10 place-items-center rounded-xl border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div className={cn("lg:hidden", open ? "block" : "hidden")}>
        <nav className="container-page grid gap-1 border-t border-border/60 py-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary"
              activeProps={{ className: "bg-secondary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild variant="hero" className="mt-2">
            <Link to="/calculator" onClick={() => setOpen(false)}>
              احسب تكلفة رحلتي
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
