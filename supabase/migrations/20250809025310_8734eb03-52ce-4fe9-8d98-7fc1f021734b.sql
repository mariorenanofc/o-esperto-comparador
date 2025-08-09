-- Enable realtime for daily_offers table
ALTER TABLE public.daily_offers REPLICA IDENTITY FULL;

-- Add daily_offers to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_offers;