-- Create API Keys table for public API access
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  rate_limit_per_hour integer NOT NULL DEFAULT 1000,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  permissions jsonb NOT NULL DEFAULT '["read"]'::jsonb,
  usage_count integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for API keys
CREATE POLICY "Users can manage their own API keys" 
ON public.api_keys 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all API keys" 
ON public.api_keys 
FOR SELECT 
USING (is_user_admin());

-- Create function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key(key_name text, expires_in_days integer DEFAULT 365)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  api_key text;
  key_prefix text;
  key_hash text;
  new_key_id uuid;
BEGIN
  -- Only authenticated users can generate API keys
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Generate random API key
  api_key := 'ec_' || encode(gen_random_bytes(32), 'hex');
  key_prefix := left(api_key, 8) || '...';
  key_hash := encode(digest(api_key, 'sha256'), 'hex');
  
  -- Insert the API key
  INSERT INTO public.api_keys (
    user_id, 
    name, 
    key_hash, 
    key_prefix,
    expires_at,
    permissions
  ) VALUES (
    auth.uid(),
    key_name,
    key_hash,
    key_prefix,
    CASE 
      WHEN expires_in_days > 0 THEN now() + (expires_in_days || ' days')::interval
      ELSE NULL
    END,
    '["read", "write"]'::jsonb
  ) RETURNING id INTO new_key_id;
  
  RETURN jsonb_build_object(
    'id', new_key_id,
    'api_key', api_key,
    'prefix', key_prefix,
    'expires_at', (SELECT expires_at FROM api_keys WHERE id = new_key_id)
  );
END;
$function$;

-- Create function to validate API key
CREATE OR REPLACE FUNCTION public.validate_api_key(api_key_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_data record;
  key_hash text;
BEGIN
  -- Hash the input key
  key_hash := encode(digest(api_key_input, 'sha256'), 'hex');
  
  -- Find the API key
  SELECT 
    ak.id,
    ak.user_id,
    ak.name,
    ak.is_active,
    ak.rate_limit_per_hour,
    ak.expires_at,
    ak.permissions,
    ak.usage_count,
    p.plan
  INTO key_data
  FROM public.api_keys ak
  JOIN public.profiles p ON p.id = ak.user_id
  WHERE ak.key_hash = key_hash;
  
  -- Check if key exists and is valid
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid API key');
  END IF;
  
  IF NOT key_data.is_active THEN
    RETURN jsonb_build_object('valid', false, 'error', 'API key is inactive');
  END IF;
  
  IF key_data.expires_at IS NOT NULL AND key_data.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'API key has expired');
  END IF;
  
  -- Update last used and usage count
  UPDATE public.api_keys 
  SET 
    last_used_at = now(),
    usage_count = usage_count + 1
  WHERE id = key_data.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'user_id', key_data.user_id,
    'plan', key_data.plan,
    'permissions', key_data.permissions,
    'rate_limit', key_data.rate_limit_per_hour
  );
END;
$function$;

-- Create API rate limiting table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id uuid NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  requests_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT date_trunc('hour', now()),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(api_key_id, endpoint, window_start)
);

-- Enable RLS for API rate limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage API rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (current_user = 'service_role');

-- Create function to check API rate limit
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  api_key_input text,
  endpoint_name text,
  max_requests_per_hour integer DEFAULT 1000
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_validation jsonb;
  current_requests integer := 0;
  current_window timestamp with time zone;
  api_key_id uuid;
BEGIN
  -- Validate API key first
  key_validation := validate_api_key(api_key_input);
  
  IF NOT (key_validation->>'valid')::boolean THEN
    RETURN false;
  END IF;
  
  -- Get API key ID
  SELECT id INTO api_key_id 
  FROM public.api_keys 
  WHERE key_hash = encode(digest(api_key_input, 'sha256'), 'hex');
  
  -- Get current hour window
  current_window := date_trunc('hour', now());
  
  -- Get current request count for this hour
  SELECT COALESCE(requests_count, 0) INTO current_requests
  FROM public.api_rate_limits
  WHERE api_key_id = check_api_rate_limit.api_key_id
    AND endpoint = endpoint_name
    AND window_start = current_window;
  
  -- Check if within limit
  IF current_requests >= max_requests_per_hour THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO public.api_rate_limits (api_key_id, endpoint, requests_count, window_start)
  VALUES (check_api_rate_limit.api_key_id, endpoint_name, 1, current_window)
  ON CONFLICT (api_key_id, endpoint, window_start)
  DO UPDATE SET requests_count = api_rate_limits.requests_count + 1;
  
  RETURN true;
END;
$function$;