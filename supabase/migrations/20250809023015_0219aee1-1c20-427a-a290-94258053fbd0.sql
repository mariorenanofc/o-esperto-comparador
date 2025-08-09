-- Verificar se a tabela suggestions existe e tem as colunas necessárias
-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('improvement', 'feature', 'bug', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-review', 'implemented', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.suggestions;
CREATE POLICY "Users can view their own suggestions" 
ON public.suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own suggestions" ON public.suggestions;
CREATE POLICY "Users can create their own suggestions" 
ON public.suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.suggestions;
CREATE POLICY "Admins can view all suggestions" 
ON public.suggestions 
FOR SELECT 
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can update all suggestions" ON public.suggestions;
CREATE POLICY "Admins can update all suggestions" 
ON public.suggestions 
FOR UPDATE 
USING (public.is_user_admin());

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_suggestions_updated_at ON public.suggestions;
CREATE TRIGGER update_suggestions_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for suggestions table
ALTER TABLE public.suggestions REPLICA IDENTITY FULL;
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;