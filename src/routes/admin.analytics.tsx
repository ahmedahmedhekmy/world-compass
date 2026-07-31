import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/config/site";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

interface EventRow {
  event: string;
  path: string | null;
  country_slug: string | null;
  referrer_source: string | null;
  device_type: string | null;
  created_at: string;
}

function tally(rows: EventRow[], key: keyof EventRow, limit = 8) {
  return Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      const value = row[key];
      if (typeof value === "string" && value) acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function Panel({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-3xl border border-border p-5">
      <h3 className="text-sm font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">لا توجد بيانات بعد.</p>
      ) : (
        <ul className="mt-3 grid gap-2 text-sm">
          {rows.map(([label, count]) => (
            <li key={label} className="flex justify-between rounded-xl bg-secondary px-3 py-2">
              <span className="truncate">{label}</span>
              <span className="font-bold">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [events, orders] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("event, path, country_slug, referrer_source, device_type, created_at")
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase.from("orders").select("amount_usd, status, product_type, country_slug, created_at"),
      ]);
      return {
        events: (events.data ?? []) as EventRow[],
        orders: orders.data ?? [],
      };
    },
  });

  const events = data?.events ?? [];
  const orders = data?.orders ?? [];
  const pageViews = events.filter((e) => e.event === "page_view");
  const checkoutStarts = events.filter((e) => e.event === "checkout_start").length;
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((s, o) => s + Number(o.amount_usd), 0);
  const guideSales = paid.filter((o) => o.product_type === "guide").length;
  const conversion = pageViews.length ? ((orders.length / pageViews.length) * 100).toFixed(2) : "0.00";

  return (
    <>
      <h1 className="text-2xl font-extrabold">التحليلات</h1>
      <p className="mt-2 text-sm text-muted-foreground">مصادر الزيارات، الوجهات الأكثر طلبًا، ومسار التحويل.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="مشاهدات الصفحات" value={String(pageViews.length)} />
        <Stat label="بدء عمليات الشراء" value={String(checkoutStarts)} />
        <Stat label="مبيعات الأدلة" value={String(guideSales)} />
        <Stat label="الإيرادات المؤكدة" value={formatUSD(revenue)} />
      </div>

      <div className="mt-4 rounded-3xl border border-border p-5 text-sm">
        <span className="text-xs text-muted-foreground">معدل التحويل (طلبات ÷ مشاهدات)</span>
        <p className="mt-1 text-2xl font-black">{conversion}%</p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title="مصادر الزيارات" rows={tally(pageViews, "referrer_source")} />
        <Panel title="الأجهزة" rows={tally(pageViews, "device_type", 4)} />
        <Panel title="أكثر الدول طلبًا" rows={tally(pageViews, "country_slug")} />
        <Panel title="أكثر الصفحات زيارة" rows={tally(pageViews, "path", 10)} />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
