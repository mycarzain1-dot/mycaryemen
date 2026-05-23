import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "السلة — MY CAR" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQty, remove, count } = useCart();
  const navigate = useNavigate();

  if (count === 0) {
    return (
      <Shell>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-[var(--color-gold)] mx-auto" />
          <h1 className="text-2xl font-black mt-4">السلة فارغة</h1>
          <p className="text-[var(--color-ink-soft)] mt-2">تصفح المتجر وأضف منتجاتك المفضلة.</p>
          <Link to="/shop" className="btn-gold mt-6 inline-flex">تسوّق الآن</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-black">سلة المشتريات ({count})</h1>

        <ul className="mt-6 space-y-3">
          {items.map((i) => (
            <li key={i.id} className="card-clean p-3 flex gap-3 items-center">
              {i.image ? (
                <img src={i.image} alt={i.name} className="w-20 h-20 rounded-lg object-cover bg-[var(--color-surface)]" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-[var(--color-surface)]" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm line-clamp-2">{i.name}</h3>
                <p className="text-[var(--color-gold)] font-black mt-1">{(i.price * i.qty).toLocaleString()} ر.ي</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => setQty(i.id, i.qty - 1)} className="w-7 h-7 rounded-full border border-[var(--color-hairline)] flex items-center justify-center" aria-label="نقص">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-bold">{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} className="w-7 h-7 rounded-full border border-[var(--color-hairline)] flex items-center justify-center" aria-label="زيادة">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => remove(i.id)} className="mr-auto p-1.5 text-red-600" aria-label="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="card-clean p-5 mt-6 sticky bottom-20 md:static">
          <div className="flex items-center justify-between text-lg">
            <span className="font-bold">الإجمالي</span>
            <span className="text-[var(--color-gold)] font-black text-2xl">{total.toLocaleString()} ر.ي</span>
          </div>
          <button onClick={() => navigate({ to: "/checkout" })} className="btn-gold w-full mt-4">
            متابعة الدفع
          </button>
          <Link to="/shop" className="btn-outline w-full mt-2 justify-center">إضافة المزيد</Link>
        </div>
      </div>
    </Shell>
  );
}
