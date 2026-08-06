import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CountryCard } from "@/components/country-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { continents, countries } from "@/data/countries";

export const Route = createFileRoute("/countries/")({
  head: () => ({
    links: [{ rel: "canonical", href: "/countries" }],
    meta: [
      { title: "دليل الدول | Travel Smart Budget" },
      {
        name: "description",
        content: "ابحث عن أي دولة، تعرّف على معلومات السفر الأساسية، واطّلع على دليلها الكامل.",
      },
      { property: "og:title", content: "دليل الدول | Travel Smart Budget" },
      { property: "og:description", content: "اكتشف الدول وابحث حسب القارة والاسم." },
    ],
  }),
  component: CountriesIndex,
});

const PAGE = 12;

function CountriesIndex() {
  const [q, setQ] = useState("");
  const [cont, setCont] = useState<string>("all");
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const term = q.trim();
    return countries
      .filter((c) => (cont === "all" ? true : c.continent === cont))
      .filter((c) => (term ? c.ar.includes(term) || c.en.toLowerCase().includes(term.toLowerCase()) : true))
      .sort((a, b) => a.ar.localeCompare(b.ar, "ar"));
  }, [q, cont]);

  return (
    <>
      <section className="surface-deep py-14">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">الدول</h1>
          <p className="mt-3 max-w-2xl text-sm opacity-85">
            {countries.length} وجهة متاحة الآن، والقائمة تتوسع باستمرار.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="sticky top-[72px] z-30 -mx-5 border-b border-border bg-background/90 px-5 py-3 backdrop-blur">
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="ابحث عن دولة..."
              className="h-12 rounded-full ps-10"
              aria-label="ابحث عن دولة"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[{ slug: "all", ar: "الكل" }, ...continents].map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  setCont(c.slug);
                  setLimit(PAGE);
                }}
                className={
                  "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors " +
                  (cont === c.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground")
                }
              >
                {c.ar}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            لا توجد نتائج مطابقة. جرّب اسمًا آخر.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.slice(0, limit).map((c) => (
              <CountryCard key={c.slug} country={c} />
            ))}
          </div>
        )}

        {limit < list.length && (
          <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
              عرض المزيد ({list.length - limit})
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
