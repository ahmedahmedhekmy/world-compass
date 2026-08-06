import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { countries } from "@/data/countries";
import { site, formatUSD } from "@/config/site";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    links: [{ rel: "canonical", href: "/guides" }],
    meta: [
      { title: "أدلة السفر | دليل كامل لكل دولة — Travel Smart Budget" },
      {
        name: "description",
        content: `دليل سفر واحد متكامل لكل دولة بسعر موحد ${site.guidePriceUSD} دولار: التأشيرة، الوصول، الإقامة، المواصلات، خطط الأيام وقوائم التحضير.`,
      },
      { property: "og:title", content: "أدلة السفر | Travel Smart Budget" },
      { property: "og:description", content: "دليل عملي كامل لكل دولة، من الألف إلى الياء." },
    ],
  }),
  component: GuidesIndex,
});

const PAGE = 16;

function GuidesIndex() {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const list = useMemo(
    () =>
      countries
        .filter((c) => c.guideAvailable)
        .filter((c) => (q ? c.ar.includes(q) || c.en.toLowerCase().includes(q.toLowerCase()) : true)),
    [q],
  );

  return (
    <>
      <section className="surface-deep py-16">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">أدلة السفر</h1>
          <p className="mt-4 max-w-2xl text-balance-ar text-sm opacity-85">
            لكل دولة دليل واحد كامل — لا نسخ أساسية ومتقدمة. سعر موحد{" "}
            {formatUSD(site.guidePriceUSD)} لكل دليل.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="ابحث عن دليل دولة..."
          className="h-12 max-w-md rounded-full"
          aria-label="ابحث عن دليل"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.slice(0, limit).map((c) => (
            <Link
              key={c.slug}
              to="/guides/$slug"
              params={{ slug: c.slug }}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lift"
            >
              <div>
                <span className="text-3xl">{c.flag}</span>
                <h2 className="mt-3 font-extrabold">دليل السفر إلى {c.ar}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {c.tagline}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-extrabold">{formatUSD(site.guidePriceUSD)}</span>
                <span className="text-primary">اعرف التفاصيل</span>
              </div>
            </Link>
          ))}
        </div>
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
