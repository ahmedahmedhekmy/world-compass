import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/config/site";

export const Route = createFileRoute("/refund")({
  head: () => ({
    links: [{ rel: "canonical", href: "/refund" }],
    meta: [
      { title: "سياسة الاسترجاع | Travel Smart Budget" },
      {
        name: "description",
        content:
          "سياسة الاسترجاع الخاصة بالأدلة الرقمية وخدمة التخطيط المخصصة في Travel Smart Budget.",
      },
      { property: "og:title", content: "سياسة الاسترجاع" },
      { property: "og:description", content: "شروط الاسترجاع للمنتجات الرقمية وخدمات التخطيط." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">سياسة الاسترجاع</h1>
      <div className="mt-6 grid gap-5 text-sm leading-8 text-muted-foreground">
        <p>
          الأدلة الرقمية منتجات تُسلَّم فورًا بعد تأكيد الدفع، لذلك لا تُسترجع قيمتها بعد فتح
          المحتوى، باستثناء وجود خطأ تقني يمنع الوصول إلى الدليل ولم نتمكن من حلّه.
        </p>
        <p>
          خدمة التخطيط المخصصة: يمكن إلغاء الطلب واسترجاع رسوم البدء كاملة قبل بدء العمل على خطتك.
          بعد تسليم المسودة الأولى تصبح الرسوم غير قابلة للاسترجاع لأنها تغطي وقت العمل الفعلي.
        </p>
        <p>
          لا نبيع تذاكر طيران ولا حجوزات فنادق ولا تأشيرات، وبالتالي لا تشمل هذه السياسة أي مبالغ
          تدفعها لمزوّدي خدمات خارجيين.
        </p>
        <p>
          لطلب استرجاع، راسلنا على{" "}
          <a className="text-primary underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          مع رقم الطلب خلال 14 يومًا من تاريخ الشراء.
        </p>
      </div>
      <Link to="/terms" className="mt-8 inline-block text-sm text-primary underline">
        الشروط والأحكام
      </Link>
    </section>
  );
}
