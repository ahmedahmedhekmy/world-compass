import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CountryCard } from "@/components/country-card";
import { Input } from "@/components/ui/input";
import { continentBySlug, countriesByContinent, type ContinentSlug } from "@/data/countries";

export const Route = createFileRoute("/continents/$slug")({
  loader: ({ params }) => {
    const continent = continentBySlug(params.slug);
    if (!continent) throw notFound();
    return { continent };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "القارة غير متاحة" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.continent;
    const title = `السفر إلى ${c.ar} | وجهات ومعلومات`;
    return {
      links: [{ rel: "canonical", href: `/continents/${c.slug}` }],
      meta: [
        { title },
        { name: "description", content: c.intro },
        { property: "og:title", content: title },
        { property: "og:description", content: c.intro },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ContinentPage,
  errorComponent: () => <div className="container-page py-24 text-center">تعذّر التحميل.</div>,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">القارة غير موجودة</h1>
      <Link to="/explore" className="mt-4 inline-block text-primary underline">
        استكشف العالم
      </Link>
    </div>
  ),
});

function ContinentPage() {
  const { continent } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const all = countriesByContinent(continent.slug as ContinentSlug);
  const list = useMemo(
    () => all.filter((c) => (q ? c.ar.includes(q) || c.en.toLowerCase().includes(q.toLowerCase()) : true)),
    [all, q],
  );

  return (
    <>
      <section className="relative isolate">
        <img
          src={continent.image}
          alt={continent.ar}
          width={1280}
          height={853}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/40" />
        <div className="container-page flex min-h-[50svh] flex-col justify-end pb-12 pt-24 text-on-dark">
          <h1 className="text-3xl font-black sm:text-5xl">{continent.ar}</h1>
          <p className="mt-3 max-w-2xl text-balance-ar text-sm opacity-90">{continent.intro}</p>
        </div>
      </section>

      <section className="container-page py-12">
        {continent.travelable ? (
          <>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`ابحث داخل ${continent.ar}...`}
              className="h-12 max-w-md rounded-full"
              aria-label="بحث"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((c) => (
                <CountryCard key={c.slug} country={c} />
              ))}
            </div>
            {list.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">لا توجد نتائج.</p>
            )}
          </>
        ) : (
          <div className="rounded-3xl bg-secondary p-8 text-sm leading-8 text-muted-foreground">
            أنتاركتيكا مدرجة لأغراض جغرافية فقط، ولا نقدّم لها أدلة سفر تجارية أو تقديرات تكلفة
            اعتيادية. الرحلات إليها تتم عبر شركات استكشاف متخصصة وبتصاريح خاصة.
          </div>
        )}
      </section>
    </>
  );
}
