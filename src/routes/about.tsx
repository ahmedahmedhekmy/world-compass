import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | Travel Smart Budget" },
      {
        name: "description",
        content:
          "Travel Smart Budget منصة سفر عالمية تساعدك على اكتشاف الوجهات وفهم متطلبات السفر وحساب ميزانية رحلتك كاملة.",
      },
      { property: "og:title", content: "من نحن | Travel Smart Budget" },
      { property: "og:description", content: "قصتنا ورسالتنا في مساعدة المسافرين على السفر بذكاء." },
    ],
  }),
  component: () => (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">من نحن</h1>
      <div className="mt-6 grid gap-5 text-sm leading-8 text-muted-foreground">
        <p>
          Travel Smart Budget منصة سفر عالمية تهدف إلى تبسيط أصعب جزء في السفر: معرفة أين تذهب،
          وكم تحتاج، وكيف تستعد. نبدأ دائمًا بالمعلومة المجانية المفيدة، ثم نقدّم أدوات وخدمات
          اختيارية لمن يريد التعمق أكثر.
        </p>
        <p>
          نغطي اليوم عشرات الدول مع أولوية لأوروبا، والبنية مصممة لتغطية دول العالم تدريجيًا مع
          محتوى أصلي لكل دولة.
        </p>
        <h2 className="text-xl font-extrabold text-foreground">مبادئنا</h2>
        <ul className="grid gap-2">
          <li>الشفافية: كل رقم نعرضه تقديري ونقول ذلك بوضوح.</li>
          <li>القيمة أولًا: معلومات مجانية حقيقية قبل أي عرض مدفوع.</li>
          <li>الاحترام: لا ضغط بيعي ولا وعود لا يمكن ضمانها.</li>
        </ul>
        <p>
          للتواصل:{" "}
          <a className="text-primary underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
      </div>
    </section>
  ),
});
