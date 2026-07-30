import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/config/site";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [orders, trips, bookings, messages, events] = await Promise.all([
        supabase.from("orders").select("amount_usd, status, product_type, created_at"),
        supabase.from("trip_requests").select("id, status, created_at"),
        supabase.from("booking_requests").select("id, status"),
        supabase.from("messages").select("id, status"),
        supabase.from("analytics_events").select("event, country_slug, created_at").limit(1000),
      ]);
      return {
        orders: orders.data ?? [],
        trips: trips.data ?? [],
        bookings: bookings.data ?? [],
        messages: messages.data ?? [],
        events: events.data ?? [],
      };
    },
  });

  const orders = data?.orders ?? [];
  const revenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount_usd), 0);

  const topCountries = Object.entries(
    (data?.events ?? []).reduce<Record<string, number>>((acc, e) => {
      if (e.country_slug) acc[e.country_slug] = (acc[e.country_slug] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <>
      <h1 className="text-2xl font-extrabold">نظرة عامة</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="الإيرادات المؤكدة" value={formatUSD(revenue)} />
        <Stat label="إجمالي الطلبات" value={String(orders.length)} />
        <Stat
          label="طلبات تخطيط/تقدير"
          value={String(data?.trips.length ?? 0)}
          hint={`${(data?.trips ?? []).filter((t) => t.status === "new").length} جديدة`}
        />
        <Stat
          label="طلبات الحجز"
          value={String(data?.bookings.length ?? 0)}
          hint={`${(data?.bookings ?? []).filter((b) => b.status === "new").length} جديدة`}
        />
      </div>

      <h2 className="mt-10 text-lg font-bold">أكثر الدول مشاهدة</h2>
      <div className="mt-3 rounded-3xl border border-border p-5">
        {topCountries.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد بيانات زيارات بعد.</p>
        ) : (
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {topCountries.map(([slug, count]) => (
              <li key={slug} className="flex justify-between rounded-xl bg-secondary px-3 py-2">
                <span>{slug}</span>
                <span className="font-bold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold">رسائل التواصل</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {(data?.messages ?? []).filter((m) => m.status === "new").length} رسالة جديدة بانتظار الرد.
      </p>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
