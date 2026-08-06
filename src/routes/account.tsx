import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/config/site";
import { countryBySlug } from "@/data/countries";
import { useFavorites, readRecentCountries } from "@/lib/favorites";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي | Travel Smart Budget" },
      { name: "description", content: "طلباتك والأدلة التي اشتريتها في مكان واحد." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "حسابي" },
      { property: "og:description", content: "طلباتك والأدلة المشتراة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, reference, product_type, country_slug, amount_usd, status, created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return <div className="container-page py-24 text-center">جارٍ التحميل…</div>;

  const paidGuides = (orders ?? []).filter(
    (o) => o.product_type === "guide" && o.status === "paid" && o.country_slug,
  );

  return (
    <section className="container-page py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">حسابي</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/admin">لوحة التحكم</Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => signOut()}>
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <ProfileEditor userId={user.id} />

      <h2 className="mt-10 text-lg font-bold">أدلتي</h2>
      {paidGuides.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          لا توجد أدلة مفعّلة بعد. بعد تأكيد الدفع سيظهر الدليل هنا مباشرة.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {paidGuides.map((o) => (
            <li key={o.id} className="rounded-2xl border border-border px-4 py-3 text-sm">
              <Link to="/library/$slug" params={{ slug: o.country_slug! }} className="font-bold text-primary">
                فتح دليل {o.country_slug}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SavedDestinations />

      <h2 className="mt-10 text-lg font-bold">طلباتي</h2>
      <div className="mt-3 overflow-x-auto rounded-3xl border border-border">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3">رقم الطلب</th>
              <th className="p-3">المنتج</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{o.reference}</td>
                <td className="p-3">{o.product_type === "guide" ? "دليل سفر" : "خدمة تخطيط"}</td>
                <td className="p-3">{formatUSD(Number(o.amount_usd))}</td>
                <td className="p-3">{statusAr(o.status)}</td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={4}>
                  لا توجد طلبات بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CountryGrid({ slugs }: { slugs: string[] }) {
  return (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slugs.map((slug) => {
        const c = countryBySlug(slug);
        return (
          <li key={slug}>
            <Link
              to="/countries/$slug"
              params={{ slug }}
              className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary"
            >
              <span aria-hidden className="text-xl">
                {c?.flag ?? "🌍"}
              </span>
              <span className="font-semibold">{c?.ar ?? slug}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SavedDestinations() {
  const { slugs } = useFavorites();
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => setRecent(readRecentCountries()), []);
  const recentOnly = recent.filter((s) => !slugs.includes(s));

  return (
    <>
      <h2 className="mt-10 text-lg font-bold">وجهاتي المفضّلة</h2>
      {slugs.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          لم تحفظ وجهات بعد. اضغط على أيقونة القلب في صفحة أي دولة لحفظها هنا.
        </p>
      ) : (
        <CountryGrid slugs={slugs} />
      )}

      <h2 className="mt-10 text-lg font-bold">شاهدتها مؤخرًا</h2>
      {recentOnly.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          ستظهر هنا آخر الوجهات التي تصفّحتها على هذا الجهاز.
        </p>
      ) : (
        <CountryGrid slugs={recentOnly.slice(0, 6)} />
      )}
    </>
  );
}


export function statusAr(status: string) {
  return (
    { pending: "بانتظار الدفع", paid: "مدفوع", cancelled: "ملغي", refunded: "مسترجع" }[status] ?? status
  );
}
