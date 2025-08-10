-- Broaden admin check to include whitelisted emails
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles 
    WHERE id = auth.uid()
      AND (
        plan = 'admin'
        OR email IN ('mariovendasonline10k@gmail.com','mariorenan25@gmail.com')
      )
  );
$$;