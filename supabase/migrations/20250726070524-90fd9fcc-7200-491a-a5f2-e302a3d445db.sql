-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.encrypt_integration_credentials(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple base64 encoding for demo purposes
  -- In production, use proper encryption
  RETURN encode(data::bytea, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_integration_credentials(encrypted_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple base64 decoding for demo purposes
  -- In production, use proper decryption
  RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8');
END;
$$;