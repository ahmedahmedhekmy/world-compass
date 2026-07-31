import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { continents } from "@/data/countries";

interface MediaRow {
  id: string;
  title: string;
  alt_text: string | null;
  url: string;
}

/** Travel inspiration gallery: admin-managed media, with the continent artwork as fallback. */
export function InspirationGallery() {
  const { data } = useQuery({
    queryKey: ["media", "gallery"],
    staleTime: 300_000,
    queryFn: async (): Promise<MediaRow[]> => {
      const { data } = await supabase
        .from("media_assets")
        .select("id, title, alt_text, url")
        .eq("collection", "gallery")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .limit(8);
      return (data ?? []) as MediaRow[];
    },
  });

  const items: MediaRow[] =
    data && data.length > 0
      ? data
      : continents.slice(0, 6).map((c) => ({ id: c.slug, title: c.ar, alt_text: c.ar, url: c.image }));

  return (
    <section className="surface-deep py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-widest opacity-70">إلهام</span>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">معرض إلهام السفر</h2>
          <p className="mt-3 text-balance-ar text-sm opacity-80">
            لقطات من وجهات حول العالم لتساعدك على اختيار رحلتك القادمة.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((m, i) => (
            <figure
              key={m.id}
              className={
                "overflow-hidden rounded-3xl border border-white/10 " +
                (i % 5 === 0 ? "col-span-2 row-span-1" : "")
              }
            >
              <img
                src={m.url}
                alt={m.alt_text ?? m.title}
                loading="lazy"
                decoding="async"
                className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-52"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
