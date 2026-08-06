import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    links: [{ rel: "canonical", href: "/terms" }],
    meta: [
      { title: "شروط الخدمة | Travel Smart Budget" },
      {
        name: "description",
        content: "شروط استخدام منصة Travel Smart Budget والمنتجات الرقمية وخدمات التخطيط.",
      },
      { property: "og:title", content: "شروط الخدمة | Travel Smart Budget" },
      { property: "og:description", content: "الشروط التي تحكم استخدامك للمنصة وخدماتها." },
    ],
  }),
  component: () => (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">شروط الخدمة</h1>
      <div className="mt-6 grid gap-4 text-sm leading-8 text-muted-foreground">
        <h2 className="text-lg font-bold text-foreground">طبيعة الخدمة</h2>
        <p>
          نقدّم محتوى معلوماتيًا وأدلة سفر رقمية وخدمات تخطيط استشارية. لسنا وكالة سفر ولا نصدر
          تأشيرات ولا نبيع تذاكر أو حجوزات.
        </p>
        <h2 className="text-lg font-bold text-foreground">المنتجات الرقمية</h2>
        <p>
          دليل السفر منتج رقمي يُمنح الوصول إليه بعد إتمام الدفع بنجاح. في حال فشل الدفع لا يُنشأ
          طلب مدفوع ويمكنك إعادة المحاولة.
        </p>
        <h2 className="text-lg font-bold text-foreground">خدمة التخطيط المخصص</h2>
        <p>
          تخضع الخدمة لنطاق متفق عليه مسبقًا. أي طلبات خارج النطاق قد تتطلب رسومًا إضافية أو قد
          تُرفض.
        </p>
        <h2 className="text-lg font-bold text-foreground">الأسعار</h2>
        <p>
          الأسعار المعروضة قد تتغير. السعر المعتمد هو المعروض وقت إتمام الطلب. جميع تقديرات تكلفة
          الرحلة تقديرية وليست أسعارًا نهائية.
        </p>
        <h2 className="text-lg font-bold text-foreground">حدود المسؤولية</h2>
        <p>
          لا نتحمل مسؤولية أي خسارة ناتجة عن قرارات سفر مبنية على تقديرات أو معلومات عامة. المستخدم
          مسؤول عن التحقق من المصادر الرسمية.
        </p>
      </div>
    </section>
  ),
});
