import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { countryBySlug } from "@/data/countries";

export const Route = createFileRoute("/library/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `دليلي: ${params.slug} | Travel Smart Budget` },
      { name: "description", content: "محتوى الدليل المشترى الخاص بك." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "دليلي" },
      { property: "og:description", content: "محتوى الدليل المشترى." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibraryGuide,
  notFoundComponent: () => <div className="container-page py-24 text-center">الدليل غير متاح.</div>,
});

interface Section {
  title: string;
  body: string;
}

function LibraryGuide() {
  const { slug } = Route.useParams();
  const { user, loading } = useAuth();
  const [guide, setGuide] = useState<{ title: string; sections: Section[]; pdf_url: string | null } | null>(
    null,
  );
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const country = countryBySlug(slug);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setState("denied");
      return;
    }
    supabase
      .from("guides")
      .select("title, sections, pdf_url")
      .eq("country_slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setState("denied");
          return;
        }
        setGuide({
          title: data.title,
          sections: (data.sections as unknown as Section[]) ?? [],
          pdf_url: data.pdf_url,
        });
        setState("ready");
      });
  }, [slug, user, loading]);

  if (state === "loading") return <div className="container-page py-24 text-center">جارٍ التحميل…</div>;

  if (state === "denied") {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">هذا الدليل غير مفعّل في حسابك</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          يظهر محتوى الدليل هنا بعد تأكيد عملية الشراء.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/auth" className="text-primary underline">
            تسجيل الدخول
          </Link>
          <Link to="/guides" className="text-primary underline">
            كل الأدلة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">{guide?.title ?? `دليل ${country?.ar ?? slug}`}</h1>
      {guide?.pdf_url && (
        <a className="mt-3 inline-block text-sm text-primary underline" href={guide.pdf_url}>
          تحميل نسخة PDF
        </a>
      )}
      <div className="mt-8 grid gap-8">
        {guide?.sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-extrabold">{s.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted-foreground">{s.body}</p>
          </section>
        ))}
        {guide?.sections.length === 0 && (
          <p className="text-sm text-muted-foreground">يجري تحديث محتوى هذا الدليل حاليًا.</p>
        )}
      </div>
    </article>
  );
}

export const notFoundGuide = notFound;
