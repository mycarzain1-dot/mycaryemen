import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/* ============ Server-side admin auth (token-based) ============ */

const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function getAdminPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error("Server misconfigured: ADMIN_PASSWORD not set");
  return pwd;
}

function getSessionSecret(): string {
  // Derive from service-role key (server-only, already provisioned by Lovable Cloud).
  const s = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Server misconfigured: no session secret available");
  return s;
}

function signToken(payload: { exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getSessionSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

function verifyToken(token: string | undefined | null): void {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    throw new Error("غير مصرح");
  }
  const [body, sig] = token.split(".");
  const expected = createHmac("sha256", getSessionSecret()).update(body).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("غير مصرح");
  }
  let payload: { exp?: number };
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    throw new Error("غير مصرح");
  }
  if (!payload.exp || Date.now() > payload.exp) {
    throw new Error("انتهت الجلسة، الرجاء تسجيل الدخول مجدداً");
  }
}

// Back-compat: server fns still receive a `password` field, but it's actually
// the session token issued by `adminLogin`. The client never sees the real password.
function assertAdmin(token: string) {
  verifyToken(token);
}

/* ============ Admin login ============ */

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const expected = getAdminPassword();
    const a = Buffer.from(data.password);
    const b = Buffer.from(expected);
    // Constant-time compare (pad to avoid length leak)
    const maxLen = Math.max(a.length, b.length);
    const ap = Buffer.concat([a, Buffer.alloc(maxLen - a.length)]);
    const bp = Buffer.concat([b, Buffer.alloc(maxLen - b.length)]);
    if (a.length !== b.length || !timingSafeEqual(ap, bp)) {
      throw new Error("كلمة المرور غير صحيحة");
    }
    const token = signToken({ exp: Date.now() + SESSION_TTL_MS });
    return { token };
  });

/* ============ Orders (public create, admin list/update) ============ */

const cartItemSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  price: z.number().min(0),
  qty: z.number().int().min(1).max(999),
  image: z.string().optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      customer_name: z.string().trim().min(2).max(100),
      phone: z.string().trim().min(6).max(30),
      address: z.string().trim().max(500).optional().nullable(),
      items: z.array(cartItemSchema).min(1).max(50),
      wallet_id: z.string().uuid().optional().nullable(),
      wallet_name: z.string().max(100).optional().nullable(),
      payment_ref: z.string().trim().max(100).optional().nullable(),
      notes: z.string().trim().max(1000).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    // Server-trusted prices — fetch from DB, never trust client-supplied prices.
    const productIds = data.items.map((i) => i.id);
    const { data: dbProducts, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price, images")
      .in("id", productIds);
    if (pErr) {
      console.error("[createOrder] product lookup error:", pErr);
      throw new Error("تعذّر إنشاء الطلب، الرجاء المحاولة لاحقاً");
    }
    const priceMap = new Map((dbProducts ?? []).map((p) => [p.id, p]));

    const trustedItems = data.items.map((i) => {
      const p = priceMap.get(i.id);
      if (!p) throw new Error("منتج غير متوفر، الرجاء تحديث السلة");
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        qty: i.qty,
        image: (p.images && p.images[0]) || i.image,
      };
    });
    const subtotal = trustedItems.reduce((s, i) => s + i.price * i.qty, 0);

    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        address: data.address ?? null,
        items: trustedItems,
        subtotal,
        total: subtotal,
        wallet_id: data.wallet_id ?? null,
        wallet_name: data.wallet_name ?? null,
        payment_ref: data.payment_ref ?? null,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[createOrder] DB error:", error);
      throw new Error("تعذّر إنشاء الطلب، الرجاء المحاولة لاحقاً");
    }
    return { id: row!.id };
  });

export const listOrders = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    return rows ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().uuid(),
      status: z.enum(["new", "confirmed", "shipped", "delivered", "cancelled"]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { error } = await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    return { ok: true };
  });

/* ============ Generic helpers ============ */

const TABLES = ["products", "categories", "service_categories", "packages", "wallets", "site_content"] as const;

export const adminDelete = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      table: z.enum(TABLES),
      id: z.string(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const col = data.table === "site_content" ? "key" : "id";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from(data.table) as any).delete().eq(col, data.id);
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    return { ok: true };
  });

/* ============ Products ============ */

const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.number().min(0),
  old_price: z.number().min(0).optional().nullable(),
  images: z.array(z.string()).max(10).default([]),
  category_id: z.string().uuid().optional().nullable(),
  is_bestseller: z.boolean().optional(),
  in_stock: z.boolean().optional(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().uuid().optional().nullable(),
      data: productSchema,
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(data.data).eq("id", data.id);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    } else {
      const { error } = await supabaseAdmin.from("products").insert(data.data);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    }
    return { ok: true };
  });

/* ============ Categories ============ */

const categorySchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/i),
  name: z.string().trim().min(1).max(100),
  icon: z.string().trim().max(500).optional().nullable(),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const saveCategory = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().uuid().optional().nullable(),
      data: categorySchema,
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.id) {
      const { error } = await supabaseAdmin.from("categories").update(data.data).eq("id", data.id);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    } else {
      const { error } = await supabaseAdmin.from("categories").insert(data.data);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    }
    return { ok: true };
  });

/* ============ Services ============ */

const serviceSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/i),
  name: z.string().trim().min(1).max(100),
  short_desc: z.string().trim().max(300).optional().nullable(),
  long_desc: z.string().trim().max(5000).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const saveService = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().uuid().optional().nullable(),
      data: serviceSchema,
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.id) {
      const { error } = await supabaseAdmin.from("service_categories").update(data.data).eq("id", data.id);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    } else {
      const { error } = await supabaseAdmin.from("service_categories").insert(data.data);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    }
    return { ok: true };
  });

/* ============ Wallets ============ */

const walletSchema = z.object({
  name: z.string().trim().min(1).max(100),
  account_number: z.string().trim().min(1).max(50),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const saveWallet = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().uuid().optional().nullable(),
      data: walletSchema,
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.id) {
      const { error } = await supabaseAdmin.from("wallets").update(data.data).eq("id", data.id);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    } else {
      const { error } = await supabaseAdmin.from("wallets").insert(data.data);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    }
    return { ok: true };
  });

/* ============ Packages ============ */

const packageSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.string().trim().min(1).max(50),
  old_price: z.string().trim().max(50).optional().nullable(),
  features: z.array(z.string().max(200)).max(20).default([]),
  badge: z.string().trim().max(50).optional().nullable(),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const savePackage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().uuid().optional().nullable(),
      data: packageSchema,
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    if (data.id) {
      const { error } = await supabaseAdmin.from("packages").update(data.data).eq("id", data.id);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    } else {
      const { error } = await supabaseAdmin.from("packages").insert(data.data);
      if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    }
    return { ok: true };
  });

/* ============ Site Content (key/value) ============ */

const RESERVED_CONTENT_KEYS = new Set(["coupons"]);

export const saveContent = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      key: z.string().trim().min(1).max(80),
      value: z.unknown(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    // Coupons must never be stored in publicly-readable site_content.
    if (RESERVED_CONTENT_KEYS.has(data.key)) {
      throw new Error("هذا المفتاح محجوز ولا يمكن تخزينه هنا");
    }
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ key: data.key, value: data.value as never }, { onConflict: "key" });
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    return { ok: true };
  });

/* ============ Image Upload (base64) — strict MIME + extension allowlist ============ */

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const ALLOWED_IMAGE_EXTS = /\.(jpe?g|png|webp|gif|avif)$/i;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      filename: z.string().trim().min(1).max(150),
      contentType: z.string().trim().min(1).max(100),
      base64: z.string().min(1).max(8_000_000), // ~6 MB encoded cap
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);

    // Strict MIME allowlist — block HTML/SVG/JS uploads to the public bucket.
    if (!ALLOWED_IMAGE_TYPES.has(data.contentType.toLowerCase())) {
      throw new Error("نوع الملف غير مسموح به. الصور فقط (JPEG/PNG/WEBP/GIF/AVIF).");
    }
    if (!ALLOWED_IMAGE_EXTS.test(data.filename)) {
      throw new Error("امتداد الملف غير مسموح به.");
    }

    const buffer = Buffer.from(data.base64, "base64");
    if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
      throw new Error("حجم الملف غير صالح (الحد الأقصى 5MB).");
    }

    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/${Date.now()}-${safe}`;
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(path, buffer, { contentType: data.contentType.toLowerCase(), upsert: false });
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(path);
    return { url: pub.publicUrl, path };
  });
