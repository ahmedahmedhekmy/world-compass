import { createFileRoute } from "@tanstack/react-router";
import { DISCLAIMER_MAIN, DISCLAIMER_RANGE, INSURANCE_NOTE } from "@/lib/estimator";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    links: [{ rel: "canonical", href: "/disclaimer" }],
    meta: [
      { title: "إخلاء مسؤولية السفر | Travel Smart Budget" },
      {
        name: "description",
        content:
          "توضيح طبيعة التقديرات والمعلومات المعروضة على Travel Smart Budget وحدود مسؤوليتنا.",
      },
      { property: "og:title", content: "إخلاء مسؤولية السفر" },
      { property: "og:description", content: "التقديرات ليست أسعارًا نهائية — اقرأ التفاصيل." },
    ],
  }),
  component: () => (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">إخلاء مسؤولية السفر</h1>
      <div className="mt-6 grid gap-4 text-sm leading-8 text-muted-foreground">
        <p>{DISCLAIMER_MAIN}</p>
        <p>{DISCLAIMER_RANGE}</p>
        <ul className="grid gap-2">
          <li>التقديرات ليست أسعارًا نهائية وقد تتغير في أي وقت.</li>
          <li>معلومات التأشيرة قد تتغير؛ تحقق دائمًا من الجهات الحكومية الرسمية.</li>
          <li>لا نضمن الموافقة على التأشيرة بأي شكل.</li>
          <li>لا نضمن توافر رحلات الطيران أو الفنادق أو أسعارها.</li>
          <li>المصاريف الشخصية تقديرية وتختلف من مسافر لآخر.</li>
          <li>خدمات التخطيط المدفوعة محكومة بنطاق الخدمة المتفق عليه.</li>
          <li>التأمين: {INSURANCE_NOTE}</li>
        </ul>
      </div>
    </section>
  ),
});
