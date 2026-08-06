import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    links: [{ rel: "canonical", href: "/privacy" }],
    meta: [
      { title: "سياسة الخصوصية | Travel Smart Budget" },
      {
        name: "description",
        content: "كيف نجمع بياناتك ونستخدمها ونحميها داخل منصة Travel Smart Budget.",
      },
      { property: "og:title", content: "سياسة الخصوصية | Travel Smart Budget" },
      { property: "og:description", content: "شرح واضح لسياسة الخصوصية وملفات تعريف الارتباط." },
    ],
  }),
  component: () => (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">سياسة الخصوصية</h1>
      <div className="mt-6 grid gap-4 text-sm leading-8 text-muted-foreground">
        <h2 className="text-lg font-bold text-foreground">البيانات التي نجمعها</h2>
        <p>
          نجمع البيانات التي ترسلها طوعًا عبر النماذج (الاسم، البريد، الهاتف، تفاصيل الرحلة)،
          وبيانات استخدام عامة مثل نوع الجهاز والمتصفح ومصدر الزيارة والدولة التقريبية.
        </p>
        <h2 className="text-lg font-bold text-foreground">ما لا نجمعه</h2>
        <p>لا نجمع موقعك الجغرافي الدقيق (GPS)، ولا نخزّن بيانات بطاقتك البنكية على خوادمنا.</p>
        <h2 className="text-lg font-bold text-foreground">استخدام البيانات</h2>
        <p>
          نستخدم بياناتك لتقديم التقديرات والخدمات المطلوبة، للتواصل معك بخصوص طلبك، ولتحسين
          المحتوى.
        </p>
        <h2 className="text-lg font-bold text-foreground">ملفات تعريف الارتباط</h2>
        <p>
          قد نستخدم ملفات تعريف ارتباط أساسية وتحليلية. عند تفعيل الإعلانات مستقبلًا، سيتم عرض آلية
          موافقة مناسبة حسب المتطلبات القانونية في بلدك.
        </p>
        <h2 className="text-lg font-bold text-foreground">حقوقك</h2>
        <p>
          يمكنك طلب الاطلاع على بياناتك أو حذفها بمراسلتنا على{" "}
          <a className="text-primary underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
      </div>
    </section>
  ),
});
