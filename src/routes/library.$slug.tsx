import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { countryBySlug } from "@/data/countries";
import { getOwnedGuide } from "@/lib/guides.functions";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
  errorComponent: () => <div className="container-page py-24 text-center">تعذّر تحميل الدليل.</div>,
  notFoundComponent: () => <div className="container-page py-24 text-center">الدليل غير متاح.</div>,
});

function LibraryGuide() {
  const { slug } = Route.useParams();
  const { user, loading } = useAuth();
  const country = countryBySlug(slug);
  const fetchGuide = useServerFn(getOwnedGuide);

  const { data, isPending } = useQuery({
    queryKey: ["owned-guide", slug, user?.id],
    enabled: Boolean(user) && !loading,
    queryFn: () => fetchGuide({ data: { slug } }),
  });

  if (loading || (user && isPending)) {
    return <div className="container-page py-24 text-center">جارٍ التحميل…</div>;
  }

  if (!user || !data?.owned) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">هذا الدليل غير مفعّل في حسابك</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          يظهر محتوى الدليل هنا بعد تأكيد عملية الشراء.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          {!user && (
            <Link to="/auth" className="text-primary underline">
              تسجيل الدخول
            </Link>
          )}
          <Link to="/guides" className="text-primary underline">
            كل الأدلة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="container-page max-w-3xl py-16">
      <Breadcrumbs items={[{ label: "مكتبتي", href: "/account" }, { label: country?.ar ?? slug }]} />
      <h1 className="mt-4 text-3xl font-black">{data.title ?? `دليل ${country?.ar ?? slug}`}</h1>
      {data.last_updated && (
        <p className="mt-2 text-xs text-muted-foreground">آخر تحديث: {data.last_updated}</p>
      )}
      {data.pdf_url && (
        <a
          className="mt-3 inline-block text-sm text-primary underline"
          href={data.pdf_url}
          target="_blank"
          rel="noreferrer"
        >
          تحميل نسخة PDF
        </a>
      )}
      <div className="mt-8 grid gap-8">
        {data.sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-extrabold">{s.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted-foreground">{s.body}</p>
          </section>
        ))}
        {data.sections.length === 0 && (
          <p className="text-sm text-muted-foreground">يجري تحديث محتوى هذا الدليل حاليًا.</p>
        )}
      </div>
    </article>
  );
}
