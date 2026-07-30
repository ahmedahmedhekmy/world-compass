import { Link } from "@tanstack/react-router";
import { Mail, Instagram, Youtube, Music2 } from "lucide-react";
import { site } from "@/config/site";

const groups = [
  {
    title: "استكشف",
    links: [
      { to: "/countries", label: "الدول" },
      { to: "/explore", label: "القارات" },
      { to: "/guides", label: "أدلة السفر" },
      { to: "/offers", label: "عروض الأسبوع" },
    ],
  },
  {
    title: "الخدمات",
    links: [
      { to: "/calculator", label: "حاسبة تكلفة الرحلة" },
      { to: "/plan", label: "تخطيط رحلة مخصص" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { to: "/about", label: "من نحن" },
      { to: "/contact", label: "تواصل معنا" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { to: "/privacy", label: "سياسة الخصوصية" },
      { to: "/terms", label: "شروط الخدمة" },
      { to: "/disclaimer", label: "إخلاء مسؤولية السفر" },
      { to: "/refund", label: "سياسة الاسترجاع" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 surface-deep">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <div className="max-w-sm">
          <h2 className="text-lg font-extrabold">Travel Smart Budget</h2>
          <p className="mt-3 text-sm leading-7 opacity-80">
            منصة سفر عالمية تساعدك على اكتشاف الوجهات، فهم متطلبات السفر، وحساب ميزانية رحلتك كاملة
            قبل أن تحجز.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
          >
            <Mail className="size-4" />
            {site.email}
          </a>
          <div className="mt-4 flex gap-2">
            {[Music2, Instagram, Youtube].map((Icon, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-xl border border-white/20"
                aria-hidden
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-sm font-bold">{g.title}</h3>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs opacity-70">
          <span>© {new Date().getFullYear()} Travel Smart Budget. جميع الحقوق محفوظة.</span>
          <span>جميع التقديرات المعروضة على الموقع تقديرية وليست أسعارًا نهائية.</span>
        </div>
      </div>
    </footer>
  );
}
