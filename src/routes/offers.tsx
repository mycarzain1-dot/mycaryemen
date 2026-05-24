import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { getPackages } from "@/lib/catalog.functions";
import { Tag, Clock } from "lucide-react";

const packagesQO = queryOptions({ queryKey: ["packages"], queryFn: () => getPackages() });

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "العروض — MY CAR" },
      { name: "description", content: "بكجات وعروض حصرية على خدمات ومنتجات MY CAR — استفد قبل انتهاء العرض." },
      { property: "og:title", content: "العروض — MY CAR" },
      { property: "og:description", content: "بكجات وعروض حصرية على خدمات ومنتجات MY CAR — استفد قبل انتهاء العرض." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/offers" },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(packagesQO),
  component: OffersPage,
});

function OffersPage() {
  const { data: packages } = useSuspenseQuery(packagesQO);
  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-black">العروض الحصرية</h1>
        <p className="text-[var(--color-ink-soft)] mt-2">بكجات بأسعار خاصة وكوبونات خصم.</p>

        <Countdown />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {packages.map((p) => (
            <div key={p.id} className="card-clean p-6 relative">
              {p.badge && (
                <span className="absolute top-3 left-3 bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-bold px-3 py-1 rounded-full">
                  {p.badge}
                </span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">{p.description}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-ink-soft)]">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><span className="text-[var(--color-gold)]">✓</span> {f}</li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="price text-2xl">{p.price}</span>
                {p.old_price && <span className="text-[var(--color-ink-soft)] line-through text-sm">{p.old_price}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-black">كوبونات الخصم</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Coupon code="MYCAR10" desc="خصم 10% على جميع المنتجات" />
            <Coupon code="VIP20" desc="خصم 20% على بكج VIP" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Coupon({ code, desc }: { code: string; desc: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="card-clean p-5 flex items-center gap-3 text-right"
    >
      <Tag className="w-6 h-6 text-[var(--color-gold)]" />
      <div className="flex-1">
        <div className="text-lg font-black tracking-wider text-[var(--color-gold)]">{code}</div>
        <div className="text-sm text-[var(--color-ink-soft)]">{desc}</div>
      </div>
      <span className="text-xs text-[var(--color-ink-soft)]">{copied ? "تم النسخ ✓" : "انسخ"}</span>
    </button>
  );
}

function Countdown() {
  const target = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return (
    <div className="card-clean p-4 mt-6 flex items-center gap-3 bg-[var(--color-surface)]">
      <Clock className="w-5 h-5 text-[var(--color-gold)]" />
      <span className="text-sm">العرض ينتهي خلال:</span>
      <div className="flex gap-2 mr-auto font-black text-[var(--color-gold)]">
        <span>{d}ي</span>:<span>{String(h).padStart(2, "0")}</span>:<span>{String(m).padStart(2, "0")}</span>:<span>{String(s).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
