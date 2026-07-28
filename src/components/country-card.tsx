import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { Country } from "@/data/countries";
import { continentImage, continentName } from "@/data/countries";

export function CountryCard({ country, priority }: { country: Country; priority?: boolean }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-card shadow-soft transition-transform duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={continentImage(country.continent)}
          alt={`صور من ${country.ar}`}
          loading={priority ? undefined : "lazy"}
          width={1280}
          height={853}
          className="size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2 text-on-dark">
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">
              <span className="me-1">{country.flag}</span>
              {country.ar}
            </p>
            <p className="truncate text-xs opacity-80">{continentName(country.continent)}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 min-h-11 text-sm leading-6 text-muted-foreground">
          {country.tagline}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/countries/$slug"
            params={{ slug: country.slug }}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground"
          >
            اكتشف الدولة <ArrowLeft className="size-3.5" />
          </Link>
          {country.guideAvailable && (
            <Link
              to="/guides/$slug"
              params={{ slug: country.slug }}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold"
            >
              دليل السفر الكامل
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
