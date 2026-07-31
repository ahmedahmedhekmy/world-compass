import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | Travel Smart Budget" },
      { name: "description", content: "لوحة إدارة المحتوى والطلبات والعروض والأسعار." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "لوحة التحكم" },
      { property: "og:description", content: "إدارة المنصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "نظرة عامة", exact: true },
  { to: "/admin/analytics", label: "التحليلات" },
  { to: "/admin/orders", label: "الطلبات" },
  { to: "/admin/customers", label: "العملاء" },
  { to: "/admin/requests", label: "طلبات التخطيط والحجز" },
  { to: "/admin/offers", label: "العروض" },
  { to: "/admin/countries", label: "الدول" },
  { to: "/admin/guides", label: "الأدلة" },
  { to: "/admin/media", label: "الوسائط" },
  { to: "/admin/settings", label: "الأسعار والإعدادات" },
] as const;


function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="container-page py-24 text-center">جارٍ التحميل…</div>;

  if (!isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">هذه الصفحة مخصصة لفريق الإدارة</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-12 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-border p-4 lg:sticky lg:top-24">
        <p className="px-2 text-xs text-muted-foreground">لوحة التحكم</p>
        <nav className="mt-3 grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              activeProps={{ className: "bg-secondary font-bold" }}
              className="rounded-xl px-3 py-2 text-sm"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
