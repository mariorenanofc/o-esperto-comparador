
-- Add quantity and unit columns to daily_offers table
ALTER TABLE public.daily_offers 
ADD COLUMN quantity integer DEFAULT 1,
ADD COLUMN unit text DEFAULT 'unidade';
