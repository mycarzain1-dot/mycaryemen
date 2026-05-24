import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog.functions";
import { z } from "zod";

const catsQO = queryOptions({ queryKey: ["categories"], queryFn: () => getCategories() });
const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => getProducts() });

const searchSchema = z.object({ cat: z.string().optional() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "المتجر — MY CAR" },
      { name: "description", content: "تسوق منتجات العناية والاكسسوارات والكهربائيات لسيارتك بأفضل الأسعار." },
      { property: "og:title", content: "المتجر — MY CAR" },
      { property: "og:description", content: "تسوق منتجات العناية والاكسسوارات والكهربائيات لسيارتك بأفضل الأسعار." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/shop" },
      { property: "og:type", content: "website" },
    ],
  }),
  validateSearch: searchSchema,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQO);
    context.queryClient.ensureQueryData(productsQO);
  },
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const { data: cats } = useSuspenseQuery(catsQO);
  const { data: products } = useSuspenseQuery(productsQO);
  const [activeSlug, setActiveSlug] = useState<string | undefined>(search.cat);

  const activeId = cats.find((c) => c.slug === activeSlug)?.id;
  const filtered = activeId ? products.filter((p) => p.category_id === activeId) : products;

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-black">المتجر</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">{filtered.length} منتج متاح</p>

        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveSlug(undefined)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition ${
              !activeSlug ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]" : "bg-white border-[var(--color-hairline)] text-[var(--color-ink-soft)]"
            }`}
          >
            الكل
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveSlug(c.slug)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition ${
                activeSlug === c.slug ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-ink)]" : "bg-white border-[var(--color-hairline)] text-[var(--color-ink-soft)]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[var(--color-ink-soft)] py-12">لا توجد منتجات في هذا القسم بعد.</p>
        )}
      </div>
    </Shell>
  );
}
