import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WooCommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

// Simple encryption/decryption functions
function encrypt(text: string, key: string): string {
  const encoded = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key);
  const encrypted = encoded.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
  return btoa(String.fromCharCode(...encrypted));
}

function decrypt(encryptedText: string, key: string): string {
  const encrypted = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
  const keyBytes = new TextEncoder().encode(key);
  const decrypted = encrypted.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
  return new TextDecoder().decode(decrypted);
}

async function testWooCommerceConnection(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<{ success: boolean; error?: string; storeInfo?: any }> {
  try {
    console.log('Testing WooCommerce connection with:', { storeUrl, consumerKey: consumerKey.substring(0, 5) + '***' });
    
    // Validate URL format
    if (!storeUrl.startsWith('http://') && !storeUrl.startsWith('https://')) {
      return {
        success: false,
        error: 'URL deve começar com http:// ou https://'
      };
    }
    
    const cleanUrl = storeUrl.replace(/\/$/, '');
    
    // Test with a simpler endpoint first - just check if site responds
    console.log('Testing basic site connectivity...');
    const basicResponse = await fetch(cleanUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'WooCommerce-Integration-Test/1.0',
      },
    });
    
    console.log('Basic site response status:', basicResponse.status);
    
    if (!basicResponse.ok) {
      return {
        success: false,
        error: `Site não acessível (${basicResponse.status}). Verifique se a URL está correta.`
      };
    }
    
    // Now test WooCommerce API
    const apiUrl = `${cleanUrl}/wp-json/wc/v3/products?per_page=1`;
    console.log('Testing WooCommerce API at:', apiUrl);
    
    // Create basic auth header
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WooCommerce-Integration-Test/1.0',
        'Accept': 'application/json',
      },
    });

    console.log('API response status:', response.status);
    console.log('API response content-type:', response.headers.get('content-type'));

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.log('API error response:', errorText.substring(0, 500));
      } catch (e) {
        console.log('Could not read error response:', e);
      }
      
      if (response.status === 401) {
        return {
          success: false,
          error: `Credenciais inválidas. Verifique se o Consumer Key e Consumer Secret estão corretos.`
        };
      } else if (response.status === 404) {
        return {
          success: false,
          error: `WooCommerce REST API não encontrada. Verifique se o WooCommerce está instalado e a API está ativada.`
        };
      } else if (response.status === 403) {
        return {
          success: false,
          error: `Acesso negado. Verifique se as chaves API têm as permissões necessárias.`
        };
      } else {
        // Check if the response is HTML (common when there's a server error)
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          return {
            success: false,
            error: `Erro: A URL está retornando uma página HTML em vez da API. Verifique se a URL do WooCommerce está correta (ex: https://seusite.com).`
          };
        }
        
        return {
          success: false,
          error: `Erro da API WooCommerce (${response.status}). Verifique a configuração da API.`
        };
      }
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Raw API response:', responseText.substring(0, 500));
      
      // Check if response is JSON
      if (!responseText.trim().startsWith('[') && !responseText.trim().startsWith('{')) {
        return {
          success: false,
          error: `Resposta inválida da API. Esperado JSON, recebido: ${responseText.substring(0, 100)}...`
        };
      }
      
      data = JSON.parse(responseText);
      console.log('Parsed API response data:', data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: `Erro ao processar resposta da API. Verifique se o WooCommerce está configurado corretamente.`
      };
    }
    
    return {
      success: true,
      storeInfo: {
        storeUrl: cleanUrl,
        productsCount: Array.isArray(data) ? data.length : 0,
        apiVersion: 'v3',
        status: 'connected'
      }
    };
  } catch (error) {
    console.error('WooCommerce connection error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: `Erro de conexão: Não foi possível conectar à URL. Verifique se a URL está correta e acessível.`
      };
    }
    
    return {
      success: false,
      error: `Erro de conexão: ${error.message}`
    };
  }
}

async function logAction(supabase: any, userId: string, integrationId: string | null, action: string, status: string, message: string, details: any = null) {
  await supabase
    .from('integration_logs')
    .insert({
      user_id: userId,
      integration_id: integrationId,
      action,
      status,
      message,
      details
    });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WooCommerce function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const demoUserId = '00000000-0000-0000-0000-000000000001';

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request parsed:', requestBody);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = requestBody;
    console.log('Action:', action);

    switch (action) {
      case 'test': {
        console.log('Processing test action for user:', demoUserId);
        console.log('Test params:', { storeUrl: requestBody.storeUrl, hasKey: !!requestBody.consumerKey, hasSecret: !!requestBody.consumerSecret });
        
        const { storeUrl, consumerKey, consumerSecret } = requestBody;
        
        if (!storeUrl || !consumerKey || !consumerSecret) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters for testing'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const testResult = await testWooCommerceConnection(storeUrl, consumerKey, consumerSecret);
        
        return new Response(JSON.stringify(testResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'save': {
        console.log('Processing save action for user:', demoUserId);
        console.log('Request body for save:', JSON.stringify(requestBody));
        
        const { storeName, storeUrl, consumerKey, consumerSecret } = requestBody;
        
        if (!storeName || !storeUrl || !consumerKey || !consumerSecret) {
          console.log('Missing required fields for save');
          return new Response(
            JSON.stringify({ success: false, error: 'Missing required fields' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        try {
          console.log(`Saving WooCommerce integration for user ${demoUserId}`);

          // First test the connection
          const testResult = await testWooCommerceConnection(storeUrl, consumerKey, consumerSecret);
          
          if (!testResult.success) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Invalid credentials: ' + testResult.error
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Encrypt credentials
          const encryptionKey = demoUserId; // Using demo user ID as encryption key
          const credentials: WooCommerceCredentials = { storeUrl, consumerKey, consumerSecret };
          const encryptedCredentials = encrypt(JSON.stringify(credentials), encryptionKey);

          console.log('Attempting to save to database...');

          // Save to database
          const { data, error } = await supabaseClient
            .from('user_integrations')
            .upsert({
              user_id: demoUserId,
              integration_type: 'woocommerce',
              store_name: storeName,
              store_url: storeUrl,
              encrypted_credentials: encryptedCredentials,
              status: 'connected',
              last_sync_at: new Date().toISOString(),
              error_message: null
            }, {
              onConflict: 'user_id,integration_type'
            })
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
            await logAction(
              supabaseClient,
              demoUserId,
              null,
              'save_integration',
              'error',
              'Failed to save integration: ' + error.message,
              { storeUrl, error }
            );

            return new Response(JSON.stringify({
              success: false,
              error: 'Failed to save integration',
              details: error.message
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          console.log('Save successful:', data);

          await logAction(
            supabaseClient,
            demoUserId,
            data.id,
            'save_integration',
            'success',
            'WooCommerce integration saved successfully',
            { storeUrl, storeName, storeInfo: testResult.storeInfo }
          );

          return new Response(JSON.stringify({
            success: true,
            message: 'Integration saved successfully',
            integration: {
              id: data.id,
              storeName,
              storeUrl,
              status: 'connected',
              lastSync: data.last_sync_at
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.log('Unexpected error during save:', error);
          return new Response(
            JSON.stringify({ success: false, error: 'Unexpected error occurred', details: error.message }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }

      case 'list': {
        console.log('Processing list action for user:', demoUserId);
        
        try {
          const { data, error } = await supabaseClient
            .from('user_integrations')
            .select('*')
            .eq('user_id', demoUserId)
            .eq('integration_type', 'woocommerce');

          console.log('Database query result:', { data, error });

          if (error) {
            console.error('Database error in list action:', error);
            return new Response(JSON.stringify({ error: 'Failed to fetch integrations', details: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const integrations = data?.map(integration => ({
            id: integration.id,
            storeName: integration.store_name,
            storeUrl: integration.store_url,
            status: integration.status,
            lastSync: integration.last_sync_at,
            errorMessage: integration.error_message
          })) || [];

          console.log('Returning integrations:', integrations);

          return new Response(JSON.stringify({ integrations }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (listError) {
          console.error('Exception in list action:', listError);
          return new Response(JSON.stringify({ 
            error: 'Failed to process list request', 
            details: listError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('WooCommerce integration error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});