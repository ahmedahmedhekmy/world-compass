import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  country: string | null;
  rating: number;
  comment: string;
  photo_url: string | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`التقييم ${rating} من 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={
            "size-4 " + (n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40")
          }
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, name, country, rating, comment, photo_url")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      return (data ?? []) as Testimonial[];
    },
  });

  const items = data ?? [];
  if (isLoading) {
    return (
      <section className="container-page py-16">
        <h2 className="text-2xl font-black sm:text-3xl">آراء المسافرين</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl border border-border p-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="size-4 rounded bg-secondary" />
                ))}
              </div>
              <div className="mt-3 h-20 rounded bg-secondary" />
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <div className="size-10 rounded-full bg-secondary" />
                <div className="h-4 w-20 rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="container-page py-16">
      <h2 className="text-2xl font-black sm:text-3xl">آراء المسافرين</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => (
          <figure key={t.id} className="flex h-full flex-col rounded-3xl border border-border p-5">
            <Stars rating={t.rating} />
            <blockquote className="mt-3 flex-1 text-balance-ar text-sm text-muted-foreground">
              {t.comment}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              {t.photo_url ? (
                <img
                  src={t.photo_url}
                  alt=""
                  loading="lazy"
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold">
                  {t.name.slice(0, 1)}
                </span>
              )}
              <span className="text-sm">
                <span className="block font-bold">{t.name}</span>
                {t.country && (
                  <span className="block text-xs text-muted-foreground">{t.country}</span>
                )}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
