-- Ejecuta esto de nuevo en el "SQL Editor" de Supabase
-- Hemos añadido NOTIFY pgrst, 'reload schema' para forzar a Supabase a reconocer los cambios
-- y asegurado TODAS las columnas que el sistema necesita.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "techType" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "originalPrice" NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER DEFAULT 4;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS materials TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "careGuide" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "sizes" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
