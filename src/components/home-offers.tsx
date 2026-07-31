import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/config/site";

interface OfferRow {
  id: string;
  title: string;
  destination: string | null;
  duration: string | null;
  starting_price_usd: number | null;
  image_url: string | null;
}

export function HomeOffers() {
  const { data } = useQuery({
    queryKey: ["home-offers"],
    staleTime: 60_000,
    queryFn: async (): Promise<OfferRow[]> => {
      const { data } = await supabase
        .from("offers")
        .select("id, title, destination, duration, starting_price_usd, image_url")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(3);
      return (data ?? []) as OfferRow[];
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="container-page py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-muted-foreground">عروض الأسبوع</span>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">عروض سفر مختارة هذا الأسبوع</h2>
        </div>
        <Button asChild variant="outline">
          <Link to="/offers">
            كل العروض <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((o) => (
          <Link
            key={o.id}
            to="/offers"
            className="group overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-lift"
          >
            {o.image_url && (
              <img
                src={o.image_url}
                alt={o.title}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="p-5">
              <h3 className="font-extrabold">{o.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {[o.destination, o.duration].filter(Boolean).join(" · ")}
              </p>
              {o.starting_price_usd !== null && (
                <p className="mt-3 text-sm font-black">
                  تبدأ من {formatUSD(Number(o.starting_price_usd))}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
