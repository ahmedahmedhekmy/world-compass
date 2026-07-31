import { ShieldCheck, Lock, RefreshCw, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { useLang } from "@/lib/i18n";

const TRUST = [
  { icon: ShieldCheck, title: "شفافية كاملة", body: "كل الأرقام تقديرية ونقولها بوضوح، بدون وعود مضللة." },
  { icon: Lock, title: "بياناتك محمية", body: "لا نبيع بياناتك، ونستخدمها فقط للتواصل معك بخصوص طلبك." },
  { icon: RefreshCw, title: "تحديث مستمر", body: "الأدلة تُحدَّث دوريًا ويظهر تاريخ آخر تحديث لكل دليل." },
  { icon: Mail, title: "دعم حقيقي", body: "نرد على رسائلك عبر البريد خلال وقت قصير." },
];

export function TrustAndNewsletter() {
  const { t } = useLang();

  return (
    <>
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">لماذا يثق بنا المسافرون؟</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-2xl surface-deep">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container-page grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold">{t("news.title")}</h2>
            <p className="mt-3 text-balance-ar text-sm text-muted-foreground">{t("news.desc")}</p>
          </div>
          <div className="flex md:justify-end">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}
