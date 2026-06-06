import { useRef, useState, useEffect } from "react";
import { ProductCard, type ProductCardProduct } from "./ProductCard";

export function ProductsCarousel({ products }: { products: ProductCardProduct[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) {
        setProgress(1);
        return;
      }
      // In RTL, scrollLeft is negative or positive depending on browser; normalize
      const sl = Math.abs(el.scrollLeft);
      setProgress(Math.min(1, Math.max(0, sl / max)));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products.length]);

  return (
    <div className="md:hidden">
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2"
      >
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-[45%] snap-start">
            <ProductCard p={p} />
          </div>
        ))}
      </div>
      <div className="mt-3 h-1 w-full bg-[var(--color-hairline)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-gold)] rounded-full transition-[width] duration-150"
          style={{ width: `${Math.max(15, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
