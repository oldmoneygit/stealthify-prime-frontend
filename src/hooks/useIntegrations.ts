import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Integration {
  id: string;
  storeName: string;
  storeUrl: string;
  status: 'connected' | 'error' | 'pending' | 'disconnected';
  lastSync?: string;
  errorMessage?: string;
}

export function useIntegrations() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testShopifyConnection = async (shopUrl: string, accessToken: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-integration', {
        body: {
          action: 'test',
          shopUrl,
          accessToken
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Conexão bem-sucedida!",
          description: `Conectado à loja: ${data.shopInfo?.name || shopUrl}`,
        });
        return { success: true, shopInfo: data.shopInfo };
      } else {
        toast({
          title: "Erro na conexão",
          description: data.error,
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error testing Shopify connection:', error);
      toast({
        title: "Erro na conexão",
        description: "Falha ao testar conexão com Shopify",
        variant: "destructive",
      });
      return { success: false, error: 'Connection failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const testWooCommerceConnection = async (storeUrl: string, consumerKey: string, consumerSecret: string) => {
    setIsLoading(true);
    try {
      console.log('Testing WooCommerce connection with:', { storeUrl, consumerKey: consumerKey.substring(0, 5) + '***' });
      
      const { data, error } = await supabase.functions.invoke('woocommerce-integration', {
        body: {
          action: 'test',
          storeUrl,
          consumerKey,
          consumerSecret
        }
      });

      console.log('Response from edge function:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.success) {
        toast({
          title: "Conexão bem-sucedida!",
          description: `Conectado à loja WooCommerce com tema: ${data.storeInfo?.theme || 'N/A'}`,
        });
        return { success: true, storeInfo: data.storeInfo };
      } else {
        toast({
          title: "Erro na conexão",
          description: data.error,
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error testing WooCommerce connection:', error);
      toast({
        title: "Erro na conexão",
        description: "Falha ao testar conexão com WooCommerce",
        variant: "destructive",
      });
      return { success: false, error: 'Connection failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const saveShopifyIntegration = async (storeName: string, shopUrl: string, accessToken: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-integration', {
        body: {
          action: 'save',
          storeName,
          shopUrl,
          accessToken
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Integração salva!",
          description: `Shopify ${storeName} configurado com sucesso`,
        });
        return { success: true, integration: data.integration };
      } else {
        toast({
          title: "Erro ao salvar",
          description: data.error,
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error saving Shopify integration:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar integração Shopify",
        variant: "destructive",
      });
      return { success: false, error: 'Save failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const saveWooCommerceIntegration = async (storeName: string, storeUrl: string, consumerKey: string, consumerSecret: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('woocommerce-integration', {
        body: {
          action: 'save',
          storeName,
          storeUrl,
          consumerKey,
          consumerSecret
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Integração salva!",
          description: `WooCommerce ${storeName} configurado com sucesso`,
        });
        return { success: true, integration: data.integration };
      } else {
        toast({
          title: "Erro ao salvar",
          description: data.error,
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error saving WooCommerce integration:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar integração WooCommerce",
        variant: "destructive",
      });
      return { success: false, error: 'Save failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const getIntegrations = async (type: 'shopify' | 'woocommerce'): Promise<Integration[]> => {
    try {
      const functionName = type === 'shopify' ? 'shopify-integration' : 'woocommerce-integration';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { action: 'list' }
      });

      if (error) throw error;

      return data.integrations || [];
    } catch (error) {
      console.error(`Error fetching ${type} integrations:`, error);
      return [];
    }
  };

  return {
    isLoading,
    testShopifyConnection,
    testWooCommerceConnection,
    saveShopifyIntegration,
    saveWooCommerceIntegration,
    getIntegrations
  };
}