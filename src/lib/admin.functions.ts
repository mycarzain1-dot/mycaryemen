import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "zain20267731";

function assertAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) throw new Error("غير مصرح");
}

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
    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        address: data.address ?? null,
        items: data.items,
        subtotal,
        total: subtotal,
        wallet_id: data.wallet_id ?? null,
        wallet_name: data.wallet_name ?? null,
        payment_ref: data.payment_ref ?? null,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
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
    if (error) throw new Error(error.message);
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
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ Generic helpers ============ */

const TABLES = ["products", "categories", "service_categories", "packages", "wallets", "site_content"] as const;
type TableName = (typeof TABLES)[number];

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
    if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("products").insert(data.data);
      if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("categories").insert(data.data);
      if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("service_categories").insert(data.data);
      if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("wallets").insert(data.data);
      if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("packages").insert(data.data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ============ Site Content (key/value) ============ */

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
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ key: data.key, value: data.value as never }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ Image Upload (base64) ============ */

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      filename: z.string().trim().min(1).max(150),
      contentType: z.string().trim().min(1).max(100),
      base64: z.string().min(1),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/${Date.now()}-${safe}`;
    const buffer = Buffer.from(data.base64, "base64");
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(path, buffer, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(path);
    return { url: pub.publicUrl, path };
  });
