import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, slug, name, icon, sort_order")
    .order("sort_order");
  if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
  return data ?? [];
});

export const getServiceCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("service_categories")
    .select("id, slug, name, short_desc, long_desc, image_url, sort_order")
    .order("sort_order");
  if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
  return data ?? [];
});

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("service_categories")
      .select("id, slug, name, short_desc, long_desc, image_url")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    return row;
  });

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, name, description, price, old_price, images, rating, is_bestseller, category_id")
    .order("created_at", { ascending: false });
  if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
  return data ?? [];
});

export const getProductById = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("id, name, description, price, old_price, images, video_url, rating, category_id")
      .eq("id", data.id)
      .maybeSingle();
    if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
    return row;
  });

export const getPackages = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("packages")
    .select("id, slug, name, description, price, old_price, features, badge, sort_order")
    .order("sort_order");
  if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
  return data ?? [];
});

export const getWallets = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("wallets")
    .select("id, name, account_number, sort_order")
    .order("sort_order");
  if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
  return data ?? [];
});

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("key, value");
  if (error) { console.error("[server] DB error:", error); throw new Error("حدث خطأ، الرجاء المحاولة لاحقاً"); }
  return (data ?? []) as Array<{ key: string; value: Json }>;
});
