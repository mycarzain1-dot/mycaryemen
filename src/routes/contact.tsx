import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { SALES_PHONE, WHATSAPP_NUMBER, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "اتصل بنا — MY CAR" },
      { name: "description", content: "تواصل مع ماي كار في صنعاء - حدة - شارع صفر - جوار مستشفى إسراء. أوقات العمل السبت-الخميس 9ص-11م." },
      { property: "og:title", content: "اتصل بنا — MY CAR" },
      { property: "og:description", content: "تواصل مع ماي كار في صنعاء - حدة - شارع صفر - جوار مستشفى إسراء. أوقات العمل السبت-الخميس 9ص-11م." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/contact" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `رسالة من ${name} (${phone}):\n${message}`;
    window.open(whatsappLink(msg), "_blank");
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-black">اتصل بنا</h1>
        <p className="text-[var(--color-ink-soft)] mt-2">نحن هنا لخدمتك — تواصل معنا بالطريقة التي تناسبك.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-4">
            <InfoRow Icon={Phone} title="الهاتف">
              <a href={`tel:${SALES_PHONE}`} className="hover:text-[var(--color-gold)]">{SALES_PHONE}</a>
            </InfoRow>
            <InfoRow Icon={MessageCircle} title="واتساب">
              <a href={whatsappLink("مرحباً")} className="hover:text-[var(--color-gold)]">{WHATSAPP_NUMBER.replace("967","")}</a>
            </InfoRow>
            <InfoRow Icon={MapPin} title="العنوان">
              صنعاء - حدة - شارع صفر - جوار مستشفى إسراء
            </InfoRow>
            <InfoRow Icon={Clock} title="أوقات العمل">
              السبت - الخميس: 9 صباحاً - 11 مساءً<br />الجمعة: إجازة
            </InfoRow>
          </div>

          <form onSubmit={submit} className="card-clean p-6">
            <h2 className="text-xl font-bold">أرسل رسالة</h2>
            <div className="space-y-3 mt-4">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]" />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]" />
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="رسالتك" rows={4} className="w-full border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]" />
            </div>
            <button type="submit" className="btn-gold mt-4 w-full">إرسال عبر واتساب</button>
          </form>
        </div>
      </div>
    </Shell>
  );
}

function InfoRow({ Icon, title, children }: { Icon: typeof Phone; title: string; children: React.ReactNode }) {
  return (
    <div className="card-clean p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[var(--color-gold)]" />
      </div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">{children}</p>
      </div>
    </div>
  );
}
