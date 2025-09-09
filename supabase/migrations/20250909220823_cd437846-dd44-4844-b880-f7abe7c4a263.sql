-- Allow authenticated users to insert their own performance logs
CREATE POLICY "Users can insert their own performance logs"
ON public.api_performance_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role to insert performance logs for any user  
CREATE POLICY "Service role can insert performance logs for any user"
ON public.api_performance_logs
FOR INSERT
WITH CHECK (CURRENT_USER = 'service_role'::name);