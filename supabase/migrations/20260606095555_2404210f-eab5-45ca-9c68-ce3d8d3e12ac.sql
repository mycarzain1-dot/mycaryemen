
-- Fix 1: Restrict public listing of storage.objects in the media bucket.
-- Public buckets still serve files via public URLs without a SELECT policy on storage.objects.
DROP POLICY IF EXISTS "media public read" ON storage.objects;

-- Fix 2 & 3: Tighten product_reviews INSERT policy (was WITH CHECK true).
-- Enforce field constraints + ensure referenced product exists.
DROP POLICY IF EXISTS "public insert reviews" ON public.product_reviews;

CREATE POLICY "public insert valid reviews"
ON public.product_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  rating BETWEEN 1 AND 5
  AND char_length(btrim(customer_name)) BETWEEN 1 AND 100
  AND (comment IS NULL OR char_length(comment) <= 1000)
  AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_reviews.product_id)
);

-- Add a foreign key for integrity (cascading delete with product).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_reviews_product_id_fkey'
  ) THEN
    ALTER TABLE public.product_reviews
      ADD CONSTRAINT product_reviews_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Basic check constraints as defense-in-depth.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_reviews_rating_check') THEN
    ALTER TABLE public.product_reviews
      ADD CONSTRAINT product_reviews_rating_check CHECK (rating BETWEEN 1 AND 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_reviews_name_len_check') THEN
    ALTER TABLE public.product_reviews
      ADD CONSTRAINT product_reviews_name_len_check CHECK (char_length(btrim(customer_name)) BETWEEN 1 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_reviews_comment_len_check') THEN
    ALTER TABLE public.product_reviews
      ADD CONSTRAINT product_reviews_comment_len_check CHECK (comment IS NULL OR char_length(comment) <= 1000);
  END IF;
END $$;
