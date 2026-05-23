import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { useCart } from "@/lib/cart";
import { getWallets } from "@/lib/catalog.functions";
import { createOrder } from "@/lib/admin.functions";
import { whatsappLink } from "@/lib/whatsapp";
import { Copy, Check, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "إتمام الطلب — MY CAR" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const navigate = useNavigate();
  const fetchWallets = useServerFn(getWallets);
  const submitOrder = useServerFn(createOrder);

  const { data: wallets = [] } = useQuery({ queryKey: ["wallets"], queryFn: () => fetchWallets() });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [walletId, setWalletId] = useState<string>("");
  const [paymentRef, setPaymentRef] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (count === 0 && typeof window !== "undefined") {
      const t = setTimeout(() => navigate({ to: "/shop" }), 1500);
      return () => clearTimeout(t);
    }
  }, [count, navigate]);

  if (count === 0) {
    return (
      <Shell>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-[var(--color-gold)] mx-auto" />
          <p className="mt-4">سلتك فارغة، يتم تحويلك للمتجر...</p>
        </div>
      </Shell>
    );
  }

  const wallet = wallets.find((w) => w.id === walletId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("الرجاء إدخال الاسم");
    if (phone.trim().length < 6) return setError("الرجاء إدخال رقم الهاتف");
    if (!walletId) return setError("الرجاء اختيار وسيلة الدفع");

    setSubmitting(true);
    try {
      await submitOrder({
        data: {
          customer_name: name.trim(),
          phone: phone.trim(),
          address: address.trim() || null,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
          wallet_id: walletId,
          wallet_name: wallet?.name ?? null,
          payment_ref: paymentRef.trim() || null,
          notes: notes.trim() || null,
        },
      });

      const lines = [
        "🛒 *طلب جديد من MY CAR*",
        `👤 الاسم: ${name}`,
        `📱 الهاتف: ${phone}`,
        address ? `📍 العنوان: ${address}` : "",
        "",
        "*المنتجات:*",
        ...items.map((i, idx) => `${idx + 1}. ${i.name} × ${i.qty} = ${(i.price * i.qty).toLocaleString()} ر.ي`),
        "",
        `💰 *الإجمالي: ${total.toLocaleString()} ر.ي*`,
        `💳 وسيلة الدفع: ${wallet?.name} (${wallet?.account_number})`,
        paymentRef ? `🧾 مرجع التحويل: ${paymentRef}` : "",
        notes ? `📝 ملاحظات: ${notes}` : "",
      ].filter(Boolean).join("\n");

      clear();
      window.location.href = whatsappLink(lines);
    } catch (err) {
      setError((err as Error).message || "تعذّر إرسال الطلب");
      setSubmitting(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-black">إتمام الطلب</h1>
        <p className="text-[var(--color-ink-soft)] mt-1 text-sm">املأ البيانات واختر المحفظة، سيتم إرسال الطلب لإدارة MY CAR عبر واتساب.</p>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="card-clean p-5 space-y-3">
            <h2 className="font-bold text-lg">بيانات التوصيل</h2>
            <input className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]"
              placeholder="الاسم الكامل *" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            <input className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]"
              placeholder="رقم الهاتف *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={30} />
            <input className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]"
              placeholder="العنوان (المدينة، الحي، الشارع)" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500} />
            <textarea className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]"
              placeholder="ملاحظات إضافية" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} />
          </div>

          <div className="card-clean p-5 space-y-3">
            <h2 className="font-bold text-lg">اختر وسيلة الدفع</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {wallets.map((w) => (
                <label key={w.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${walletId === w.id ? "border-[var(--color-gold)] bg-[var(--color-gold-soft)]" : "border-[var(--color-hairline)]"}`}>
                  <input type="radio" name="wallet" value={w.id} checked={walletId === w.id} onChange={(e) => setWalletId(e.target.value)} className="accent-[var(--color-gold)]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{w.name}</div>
                    <div className="text-xs text-[var(--color-ink-soft)] flex items-center gap-1">
                      <span dir="ltr">{w.account_number}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); copy(w.account_number); }} className="text-[var(--color-gold)]">
                        {copied === w.account_number ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {wallet && (
              <input className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]"
                placeholder="رقم/مرجع عملية التحويل (اختياري)" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} maxLength={100} />
            )}
          </div>

          <div className="card-clean p-5">
            <h2 className="font-bold text-lg mb-3">ملخص الطلب</h2>
            <ul className="text-sm space-y-2">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span className="truncate ml-2">{i.name} × {i.qty}</span>
                  <span className="font-bold whitespace-nowrap">{(i.price * i.qty).toLocaleString()} ر.ي</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--color-hairline)] mt-3 pt-3 flex justify-between text-lg">
              <span className="font-bold">الإجمالي</span>
              <span className="text-[var(--color-gold)] font-black">{total.toLocaleString()} ر.ي</span>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-gold w-full text-lg disabled:opacity-60">
            {submitting ? "جاري الإرسال..." : "تأكيد وإرسال عبر واتساب"}
          </button>
          <Link to="/cart" className="block text-center text-sm text-[var(--color-ink-soft)]">← العودة للسلة</Link>
        </form>
      </div>
    </Shell>
  );
}
