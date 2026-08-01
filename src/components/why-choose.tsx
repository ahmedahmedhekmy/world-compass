import { Check, X } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

/** "Without vs With Travel Smart Budget" comparison. Rows are editable from the dashboard. */
export function WhyChoose() {
  const { comparison } = useSiteSettings();

  return (
    <section className="container-page py-16">
      <h2 className="text-2xl font-black sm:text-3xl">لماذا Travel Smart Budget؟</h2>
      <p className="mt-3 max-w-2xl text-balance-ar text-sm text-muted-foreground">
        الفرق بين التحضير المبعثر والتحضير المنظّم يظهر في وقتك وميزانيتك.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border p-6">
          <h3 className="text-sm font-bold text-muted-foreground">بدون Travel Smart Budget</h3>
          <ul className="mt-4 grid gap-3">
            {comparison.rows.map((r) => (
              <li key={r.without} className="flex items-start gap-3 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                <span className="text-muted-foreground">{r.without}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl surface-deep p-6">
          <h3 className="text-sm font-bold opacity-80">مع Travel Smart Budget</h3>
          <ul className="mt-4 grid gap-3">
            {comparison.rows.map((r) => (
              <li key={r.with} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="opacity-90">{r.with}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
