import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";

export const Route = createFileRoute("/admin/requests")({
  component: AdminRequests,
});

const STATUSES = ["new", "in_progress", "done", "archived"] as const;

function AdminRequests() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const [trips, bookings, messages] = await Promise.all([
        supabase.from("trip_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("booking_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("messages").select("*").order("created_at", { ascending: false }),
      ]);
      return { trips: trips.data ?? [], bookings: bookings.data ?? [], messages: messages.data ?? [] };
    },
  });

  async function setStatus(
    table: "trip_requests" | "booking_requests" | "messages",
    id: string,
    status: string,
  ) {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) return toast.error("تعذّر التحديث");
    toast.success("تم التحديث");
    qc.invalidateQueries({ queryKey: ["admin-requests"] });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">طلبات التخطيط والحجز</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(data?.trips ?? []).length === 0}
            onClick={() => downloadCsv("trip-requests", data?.trips ?? [])}
          >
            تصدير طلبات التخطيط
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(data?.bookings ?? []).length === 0}
            onClick={() => downloadCsv("booking-requests", data?.bookings ?? [])}
          >
            تصدير طلبات الحجز
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(data?.messages ?? []).length === 0}
            onClick={() => downloadCsv("messages", data?.messages ?? [])}
          >
            تصدير الرسائل
          </Button>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold">طلبات التقدير والتخطيط</h2>
      <div className="mt-3 grid gap-3">
        {(data?.trips ?? []).map((t) => (
          <article key={t.id} className="rounded-3xl border border-border p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">
                  {t.full_name} · {t.kind === "planning" ? "تخطيط مخصص" : "تقدير ميزانية"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.email} {t.phone ? `· ${t.phone}` : ""}
                </p>
              </div>
              <StatusSelect value={t.status} onChange={(v) => setStatus("trip_requests", t.id, v)} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {[t.departure_country, t.destination_country, t.start_date, t.end_date]
                .filter(Boolean)
                .join(" · ")}{" "}
              · {t.adults} بالغ / {t.children} طفل
            </p>
            {t.notes && <p className="mt-2 whitespace-pre-line text-xs">{t.notes}</p>}
          </article>
        ))}
        {(data?.trips ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold">طلبات الحجز على العروض</h2>
      <div className="mt-3 grid gap-3">
        {(data?.bookings ?? []).map((b) => (
          <article key={b.id} className="rounded-3xl border border-border p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">
                  {b.full_name} · {b.offer_title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.email} {b.phone ? `· ${b.phone}` : ""} · {b.travellers} مسافر
                </p>
              </div>
              <StatusSelect value={b.status} onChange={(v) => setStatus("booking_requests", b.id, v)} />
            </div>
            {b.special_requests && <p className="mt-2 text-xs">{b.special_requests}</p>}
          </article>
        ))}
        {(data?.bookings ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد طلبات حجز بعد.</p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold">رسائل التواصل</h2>
      <div className="mt-3 grid gap-3">
        {(data?.messages ?? []).map((m) => (
          <article key={m.id} className="rounded-3xl border border-border p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">
                  {m.full_name} · {m.subject ?? "بدون عنوان"}
                </p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <StatusSelect value={m.status} onChange={(v) => setStatus("messages", m.id, v)} />
            </div>
            <p className="mt-2 whitespace-pre-line text-xs">{m.body}</p>
          </article>
        ))}
        {(data?.messages ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
        )}
      </div>
    </>
  );
}

function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
