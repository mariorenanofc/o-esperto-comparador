-- Enable realtime for daily_offers table
ALTER TABLE public.daily_offers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_offers;