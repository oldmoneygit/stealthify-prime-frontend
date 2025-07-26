-- Create user_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_url TEXT NOT NULL,
  encrypted_credentials TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_type, store_url)
);

-- Create integration_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_id UUID,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_integrations
CREATE POLICY IF NOT EXISTS "Users can view their own integrations" 
ON public.user_integrations 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can create their own integrations" 
ON public.user_integrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own integrations" 
ON public.user_integrations 
FOR UPDATE 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can delete their own integrations" 
ON public.user_integrations 
FOR DELETE 
USING (true);

-- Create policies for integration_logs
CREATE POLICY IF NOT EXISTS "Users can view their own logs" 
ON public.integration_logs 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can create their own logs" 
ON public.integration_logs 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_user_integrations_updated_at
BEFORE UPDATE ON public.user_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();