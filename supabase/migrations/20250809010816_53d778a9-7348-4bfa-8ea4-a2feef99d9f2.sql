-- Enable real-time for daily_offers table
ALTER TABLE public.daily_offers REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_offers;