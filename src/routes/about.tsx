import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout/Shell";
import { Target, Heart, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — MY CAR" },
      { name: "description", content: "ماي كار - مركز متكامل للعناية بالسيارات في صنعاء يقدم خدمات احترافية وقطع وإكسسوارات أصلية." },
      { property: "og:title", content: "من نحن — MY CAR" },
      { property: "og:description", content: "ماي كار - مركز متكامل للعناية بالسيارات في صنعاء يقدم خدمات احترافية وقطع وإكسسوارات أصلية." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/about" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-black">من نحن</h1>
        <p className="text-[var(--color-ink-soft)] mt-4 leading-loose">
          <span className="font-bold text-[var(--color-gold)]">MY CAR</span> هو مركز متكامل للعناية بالسيارات في صنعاء، نقدّم تجربة فاخرة تجمع بين متجر إلكتروني واسع وخدمات احترافية تنفذها أيدي خبراء. هدفنا أن تحصل سيارتك على أفضل العناية في مكان واحد، بجودة عالمية وأسعار تنافسية.
        </p>
        <p className="text-[var(--color-ink-soft)] mt-4 leading-loose">
          من حماية الطلاء بأفلام PPF والنانو سيراميك، إلى التنجيد الفاخر، وتطوير الكشافات، والسمكرة والرش، وقطع الغيار الأصلية، والاكسسوارات المميزة — كل ذلك تحت سقف واحد.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {[
            { Icon: Target, t: "رسالتنا", d: "تقديم خدمة استثنائية تضع سيارتك في أيدٍ موثوقة." },
            { Icon: Heart, t: "قيمنا", d: "الجودة، الأمانة، والاحترافية في كل تفصيل." },
            { Icon: Users, t: "فريقنا", d: "بقيادة المدير العام احمد النود — فنيون معتمدون." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="card-clean p-5">
              <Icon className="w-7 h-7 text-[var(--color-gold)]" />
              <h3 className="font-bold mt-3">{t}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
