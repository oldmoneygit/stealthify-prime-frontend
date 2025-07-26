-- Create user_integrations table for storing encrypted credentials
CREATE TABLE public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('shopify', 'woocommerce')),
  store_name TEXT NOT NULL,
  store_url TEXT NOT NULL,
  encrypted_credentials TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_type, store_url)
);

-- Create integration_logs table for audit and history
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning', 'info')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_integrations
CREATE POLICY "Users can view their own integrations" 
ON public.user_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations" 
ON public.user_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" 
ON public.user_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" 
ON public.user_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for integration_logs
CREATE POLICY "Users can view their own integration logs" 
ON public.integration_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integration logs" 
ON public.integration_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_integrations_updated_at
BEFORE UPDATE ON public.user_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX idx_user_integrations_type ON public.user_integrations(integration_type);
CREATE INDEX idx_integration_logs_user_id ON public.integration_logs(user_id);
CREATE INDEX idx_integration_logs_integration_id ON public.integration_logs(integration_id);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);