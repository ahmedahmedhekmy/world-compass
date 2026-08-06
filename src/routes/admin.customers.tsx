import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/config/site";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

interface OrderRow {
  email: string;
  full_name: string | null;
  amount_usd: number;
  status: string;
  product_type: string;
  country_slug: string | null;
  created_at: string;
}

function AdminCustomers() {
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [orders, subs] = await Promise.all([
        supabase
          .from("orders")
          .select("email, full_name, amount_usd, status, product_type, country_slug, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("newsletter_subscribers")
          .select("email, language, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      return { orders: (orders.data ?? []) as OrderRow[], subs: subs.data ?? [] };
    },
  });

  const byEmail = new Map<
    string,
    { name: string | null; orders: number; paid: number; spend: number; last: string; guides: string[] }
  >();
  for (const o of data?.orders ?? []) {
    const entry = byEmail.get(o.email) ?? {
      name: o.full_name,
      orders: 0,
      paid: 0,
      spend: 0,
      last: o.created_at,
      guides: [],
    };
    entry.orders += 1;
    if (o.status === "paid") {
      entry.paid += 1;
      entry.spend += Number(o.amount_usd);
      if (o.product_type === "guide" && o.country_slug) entry.guides.push(o.country_slug);
    }
    entry.name = entry.name ?? o.full_name;
    byEmail.set(o.email, entry);
  }
  const customers = [...byEmail.entries()].sort((a, b) => b[1].spend - a[1].spend);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">العملاء</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={customers.length === 0}
            onClick={() =>
              downloadCsv(
                "customers",
                customers.map(([email, v]) => ({
                  email,
                  name: v.name,
                  orders: v.orders,
                  paid_orders: v.paid,
                  total_spend_usd: v.spend,
                  guides: v.guides.join(" | "),
                  last_order: v.last,
                })),
              )
            }
          >
            تصدير العملاء
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(data?.subs ?? []).length === 0}
            onClick={() => downloadCsv("newsletter", data?.subs ?? [])}
          >
            تصدير النشرة
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {customers.length} عميل · {data?.subs.length ?? 0} مشترك في النشرة
      </p>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-border">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead className="bg-secondary text-xs">
            <tr>
              <th className="p-3 text-start">العميل</th>
              <th className="p-3 text-start">الطلبات</th>
              <th className="p-3 text-start">المدفوعة</th>
              <th className="p-3 text-start">الإنفاق</th>
              <th className="p-3 text-start">الأدلة المملوكة</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(([email, c]) => (
              <tr key={email} className="border-t border-border">
                <td className="p-3">
                  <span className="block font-semibold">{c.name ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                </td>
                <td className="p-3">{c.orders}</td>
                <td className="p-3">{c.paid}</td>
                <td className="p-3 font-bold">{formatUSD(c.spend)}</td>
                <td className="p-3 text-xs">{c.guides.join("، ") || "—"}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={5}>
                  لا يوجد عملاء بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-bold">مشتركو النشرة</h2>
      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {(data?.subs ?? []).map((s) => (
          <li key={s.email} className="flex justify-between rounded-xl bg-secondary px-3 py-2">
            <span className="truncate">{s.email}</span>
            <span className="text-xs text-muted-foreground">{s.language}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
