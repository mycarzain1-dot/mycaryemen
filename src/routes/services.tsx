import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { getServiceCategories } from "@/lib/catalog.functions";

const servicesQO = queryOptions({ queryKey: ["services"], queryFn: () => getServiceCategories() });

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "الخدمات — MY CAR" },
      { name: "description", content: "خدمات احترافية للعناية بسيارتك: PPF، نانو سيراميك، تنجيد، سمكرة ورش، كهرباء، واكسسوارات." },
      { property: "og:title", content: "الخدمات — MY CAR" },
      { property: "og:description", content: "خدمات احترافية للعناية بسيارتك: PPF، نانو سيراميك، تنجيد، سمكرة ورش، كهرباء، واكسسوارات." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/services" },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQO),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQO);
  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-black">خدماتنا الاحترافية</h1>
        <p className="text-[var(--color-ink-soft)] mt-2">11 خدمة متكاملة لراحتك — تنفذها أيدي خبراء.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {services.map((s) => (
            <Link
              key={s.id}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="card-clean p-5 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-gold)] font-black text-lg">
                {String(s.sort_order).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-bold mt-3">{s.name}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1 flex-1">{s.short_desc}</p>
              <span className="text-sm text-[var(--color-gold)] font-semibold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                التفاصيل <ArrowLeft className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
