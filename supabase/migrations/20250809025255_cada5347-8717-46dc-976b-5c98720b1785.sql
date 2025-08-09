-- Enable realtime for daily_offers table
ALTER TABLE public.daily_offers REPLICA IDENTITY FULL;

-- Add daily_offers to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_offers;

-- Enable realtime for suggestions table as well
ALTER TABLE public.suggestions REPLICA IDENTITY FULL;

-- Add suggestions to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;