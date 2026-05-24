import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Crown, MapPin, Wrench, Zap } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "VIP — خدمة الفريق المتنقل — MY CAR" },
      { name: "description", content: "فريق MY CAR المتنقل يصلك أينما كنت في صنعاء — كراج كامل + إضاءة + كهرباء." },
      { property: "og:title", content: "VIP — خدمة الفريق المتنقل — MY CAR" },
      { property: "og:description", content: "فريق MY CAR المتنقل يصلك أينما كنت في صنعاء — كراج كامل + إضاءة + كهرباء." },
      { property: "og:url", content: "https://mycaryemen.lovable.app/vip" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: VipPage,
});

function VipPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `طلب خدمة VIP المتنقلة\nالاسم: ${name}\nالجوال: ${phone}\nالموقع: ${location}\nالتفاصيل: ${details}`;
    window.open(whatsappLink(msg), "_blank");
  };

  return (
    <Shell>
      <section className="relative bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Crown className="w-12 h-12 text-[var(--color-gold)] mx-auto" />
          <h1 className="text-3xl md:text-5xl font-black mt-3 text-[var(--color-gold)]">خدمة VIP المتنقلة</h1>
          <p className="text-lg mt-3">فريقنا الكامل يصلك أينما كنت — صنعاء فقط</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { Icon: Wrench, t: "كراج متكامل", d: "جميع أدوات الصيانة معنا في الموقع" },
            { Icon: Zap, t: "إضاءة وكهرباء", d: "نظام إضاءة محمول لخدمة ليلية مثالية" },
            { Icon: MapPin, t: "نصلك في صنعاء", d: "أي منطقة داخل صنعاء — اتصل واحجز" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="card-clean p-5">
              <Icon className="w-7 h-7 text-[var(--color-gold)]" />
              <h3 className="font-bold mt-3">{t}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">{d}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="card-clean p-6 mt-8">
          <h2 className="text-xl font-bold">احجز خدمة VIP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" className="border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]" />
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" className="border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)]" />
            <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="الموقع في صنعاء" className="border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)] md:col-span-2" />
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="تفاصيل الخدمة المطلوبة" rows={3} className="border border-[var(--color-hairline)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-gold)] md:col-span-2" />
          </div>
          <button type="submit" className="btn-gold mt-4">إرسال الطلب عبر واتساب</button>
        </form>
      </div>
    </Shell>
  );
}
