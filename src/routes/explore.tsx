import { createFileRoute, Link } from "@tanstack/react-router";
import { continents, countriesByContinent } from "@/data/countries";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "استكشف العالم | Travel Smart Budget" },
      {
        name: "description",
        content: "تصفح قارات العالم واكتشف الدول المتاحة داخل منصة Travel Smart Budget.",
      },
      { property: "og:title", content: "استكشف العالم | Travel Smart Budget" },
      { property: "og:description", content: "ابدأ من القارة ثم اختر دولتك." },
    ],
  }),
  component: Explore,
});

function Explore() {
  return (
    <>
      <section className="surface-deep py-16">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">استكشف العالم</h1>
          <p className="mt-4 max-w-2xl text-balance-ar text-sm opacity-85">
            سبع قارات، ومئات الوجهات. اختر القارة لتصل إلى قائمة الدول، أو اذهب مباشرة إلى دليل
            الدول للبحث بالاسم.
          </p>
          <Link
            to="/countries"
            className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
          >
            البحث في كل الدول
          </Link>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {continents.map((c) => {
            const list = countriesByContinent(c.slug);
            return (
              <Link
                key={c.slug}
                to="/continents/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-[2rem] shadow-soft"
              >
                <img
                  src={c.image}
                  alt={c.ar}
                  loading="lazy"
                  width={1280}
                  height={853}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-6 bottom-5 text-on-dark">
                  <h2 className="text-2xl font-extrabold">{c.ar}</h2>
                  <p className="mt-1 line-clamp-2 text-xs opacity-85">{c.intro}</p>
                  <p className="mt-2 text-xs opacity-70">
                    {c.travelable ? `${list.length} دولة متاحة` : "معلومات جغرافية فقط"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
