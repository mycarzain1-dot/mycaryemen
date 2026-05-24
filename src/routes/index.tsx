import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Zap, Sparkles, Droplets, Wind, Sticker, Cog, Palette,
  ShieldCheck, Truck, Star, ArrowLeft, type LucideIcon,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProducts, getPackages } from "@/lib/catalog.functions";
import { heroImage } from "@/lib/asset-map";

const iconMap: Record<string, LucideIcon> = {
  Zap, Sparkles, Droplets, Wind, Sticker, Cog, Palette,
};

const catsQO = queryOptions({ queryKey: ["categories"], queryFn: () => getCategories() });
const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => getProducts() });
const packagesQO = queryOptions({ queryKey: ["packages"], queryFn: () => getPackages() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MY CAR — مركز متكامل للعناية بالسيارات" },
      { name: "description", content: "متجر إلكتروني وخدمات احترافية للسيارات: PPF، نانو سيراميك، اكسسوارات، منظفات وعطور." },
      { property: "og:title", content: "MY CAR — مركز متكامل للعناية بالسيارات" },
      { property: "og:description", content: "متجر إلكتروني وخدمات احترافية للسيارات: PPF، نانو سيراميك، اكسسوارات، منظفات وعطور." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQO);
    context.queryClient.ensureQueryData(productsQO);
    context.queryClient.ensureQueryData(packagesQO);
  },
  component: HomePage,
});

function HomePage() {
  const { data: categories } = useSuspenseQuery(catsQO);
  const { data: products } = useSuspenseQuery(productsQO);
  const { data: packages } = useSuspenseQuery(packagesQO);
  const bestSellers = products.filter((p) => p.is_bestseller).slice(0, 4);

  return (
    <Shell>
      {/* HERO */}
      <section className="relative w-full bg-black overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider text-[var(--color-gold)] drop-shadow-lg">
            MY CAR
          </h1>
          <p className="mt-3 text-base md:text-2xl font-semibold">مركز متكامل للعناية بالسيارات</p>
          <p className="mt-2 text-sm md:text-base text-gray-200 max-w-xl mx-auto">
            متجر فاخر وخدمات احترافية — كل ما تحتاجه سيارتك في مكان واحد.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-gold">تصفح المتجر <ArrowLeft className="w-4 h-4" /></Link>
            <Link to="/services" className="btn-outline !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
              خدماتنا
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY CIRCLES */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-2">
          {categories.map((c) => {
            const Icon = iconMap[c.icon ?? "Sparkles"] ?? Sparkles;
            return (
              <Link
                key={c.id}
                to="/shop"
                search={{ cat: c.slug } as never}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--color-surface)] border border-[var(--color-hairline)] flex items-center justify-center hover:border-[var(--color-gold)] transition">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-[var(--color-gold)]" />
                </div>
                <span className="text-xs md:text-sm text-[var(--color-ink)] font-semibold">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOT DEALS */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="🔥 العروض المميزة" subtitle="بكجات حصرية لفترة محدودة" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {packages.map((p) => (
            <Link
              key={p.id}
              to="/offers"
              className="card-clean group flex flex-col p-5 relative"
            >
              {p.badge && (
                <span className="absolute top-3 left-3 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold px-2 py-1 rounded-full">
                  {p.badge}
                </span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">{p.description}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-ink-soft)] flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[var(--color-gold)] mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="price text-xl">{p.price}</span>
                {p.old_price && <span className="text-xs text-[var(--color-ink-soft)] line-through">{p.old_price}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionTitle title="الأكثر مبيعاً" subtitle="منتجات يثق بها عملاؤنا" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/shop" className="btn-outline">عرض جميع المنتجات</Link>
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { Icon: ShieldCheck, title: "ضمان الجودة", text: "منتجات أصلية بأعلى المعايير" },
          { Icon: Truck, title: "خدمة منزلية VIP", text: "فريقنا يصلك أينما كنت في صنعاء" },
          { Icon: Star, title: "تقييم ممتاز", text: "آلاف العملاء يثقون بنا" },
        ].map(({ Icon, title, text }) => (
          <div key={title} className="card-clean p-5 flex items-start gap-3">
            <Icon className="w-7 h-7 text-[var(--color-gold)] shrink-0" />
            <div>
              <h4 className="font-bold">{title}</h4>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </Shell>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--color-ink-soft)] mt-1">{subtitle}</p>}
      </div>
      <div className="h-1 w-16 bg-[var(--color-gold)] rounded-full hidden md:block" />
    </div>
  );
}
