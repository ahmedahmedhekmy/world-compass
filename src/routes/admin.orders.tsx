import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/config/site";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "paid", "cancelled", "refunded"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  cancelled: "ملغي",
  refunded: "مسترجع",
};

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error("تعذّر تحديث الطلب");
    toast.success("تم تحديث حالة الطلب");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">الطلبات</h1>
        <Button
          variant="outline"
          size="sm"
          disabled={(orders ?? []).length === 0}
          onClick={() => downloadCsv("orders", orders ?? [])}
        >
          تصدير CSV
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-border">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3">الرقم</th>
              <th className="p-3">العميل</th>
              <th className="p-3">المنتج</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="p-3 font-mono text-xs">{o.reference}</td>
                <td className="p-3">
                  {o.full_name}
                  <div className="text-xs text-muted-foreground">{o.email}</div>
                </td>
                <td className="p-3">
                  {o.product_type === "guide" ? "دليل" : "تخطيط"}
                  {o.country_slug ? ` · ${o.country_slug}` : ""}
                </td>
                <td className="p-3">{formatUSD(Number(o.amount_usd))}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    o.status === "paid" ? "bg-green-100 text-green-800" :
                    o.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    o.status === "cancelled" ? "bg-gray-100 text-gray-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  لا توجد طلبات بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })}
      >
        تحديث
      </Button>
    </>
  );
}
