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
  const [isLoadingShopify, setIsLoadingShopify] = useState(false);
  const [isLoadingWooCommerce, setIsLoadingWooCommerce] = useState(false);
  const { toast } = useToast();

  const testShopifyConnection = async (shopUrl: string, accessToken: string) => {
    setIsLoadingShopify(true);
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
      setIsLoadingShopify(false);
    }
  };

  const testWooCommerceConnection = async (storeUrl: string, consumerKey: string, consumerSecret: string, storeName: string = "SNK HOUSE") => {
    setIsLoadingWooCommerce(true);
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

      // Check if data has success property (new format) or if it's the integration object directly (old format)
      const isSuccess = data.success === true || (data && !data.error && !data.success);
      
      if (isSuccess) {
        toast({
          title: "Conexão bem-sucedida!",
          description: "WooCommerce conectado com sucesso. Salvando credenciais...",
        });
        
        // Automatically save credentials after successful test
        const saveResult = await saveWooCommerceIntegration(
          storeName,
          storeUrl,
          consumerKey,
          consumerSecret
        );
        
        if (saveResult.success) {
          toast({
            title: "Integração salva!",
            description: "Credenciais WooCommerce salvas com sucesso.",
          });
        }
        
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
      setIsLoadingWooCommerce(false);
    }
  };

  const saveShopifyIntegration = async (storeName: string, shopUrl: string, accessToken: string) => {
    setIsLoadingShopify(true);
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
      setIsLoadingShopify(false);
    }
  };

  const saveWooCommerceIntegration = async (storeName: string, storeUrl: string, consumerKey: string, consumerSecret: string) => {
    setIsLoadingWooCommerce(true);
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
      setIsLoadingWooCommerce(false);
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
    isLoadingShopify,
    isLoadingWooCommerce,
    testShopifyConnection,
    testWooCommerceConnection,
    saveShopifyIntegration,
    saveWooCommerceIntegration,
    getIntegrations
  };
}