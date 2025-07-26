-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can create their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can view their own integration logs" ON public.integration_logs;
DROP POLICY IF EXISTS "Users can create their own integration logs" ON public.integration_logs;

-- Create policies for user_integrations with public access
CREATE POLICY "Allow all for user_integrations" 
ON public.user_integrations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policies for integration_logs with public access
CREATE POLICY "Allow all for integration_logs" 
ON public.integration_logs 
FOR ALL 
USING (true) 
WITH CHECK (true);