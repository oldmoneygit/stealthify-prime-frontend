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
    console.log('Clean URL:', cleanUrl);
    
    // Create basic auth header
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    // Test different WooCommerce API endpoints
    const testUrls = [
      `${cleanUrl}/wp-json/wc/v3/products?per_page=1`,
      `${cleanUrl}/wp-json/wc/v2/products?per_page=1`,
      `${cleanUrl}/index.php/wp-json/wc/v3/products?per_page=1`,
    ];
    
    for (const testUrl of testUrls) {
      console.log('Testing API URL:', testUrl);
      
      try {
        const response = await fetch(testUrl, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'User-Agent': 'WooCommerce-Integration-Test/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        console.log(`API response for ${testUrl}: status ${response.status}`);

        if (response.ok) {
          const responseText = await response.text();
          
          if (responseText.trim().startsWith('[') || responseText.trim().startsWith('{')) {
            const data = JSON.parse(responseText);
            console.log('Successfully parsed JSON response');
            
            return {
              success: true,
              storeInfo: {
                storeUrl: cleanUrl,
                productsCount: Array.isArray(data) ? data.length : 0,
                apiVersion: testUrl.includes('/v3/') ? 'v3' : 'v2',
                apiUrl: testUrl,
                status: 'connected'
              }
            };
          }
        } else if (response.status === 401) {
          return {
            success: false,
            error: 'Credenciais inválidas. Verifique Consumer Key e Consumer Secret.'
          };
        } else if (response.status === 403) {
          return {
            success: false,
            error: 'Acesso negado. Verifique se as chaves API têm permissões necessárias.'
          };
        }
      } catch (urlError) {
        console.log(`Error testing ${testUrl}:`, urlError.message);
        continue;
      }
    }
    
    return {
      success: false,
      error: 'WooCommerce REST API não encontrada. Verifique se o WooCommerce está instalado e ativo.'
    };
    
  } catch (error) {
    console.error('WooCommerce connection error:', error);
    return {
      success: false,
      error: `Erro de conexão: ${error.message}`
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WooCommerce function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
        console.log('Processing test action');
        const { storeUrl, consumerKey, consumerSecret } = requestBody;
        
        if (!storeUrl || !consumerKey || !consumerSecret) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters'
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
        console.log('🚀 Processing save action');
        const { storeName, storeUrl, consumerKey, consumerSecret } = requestBody;
        
        if (!storeName || !storeUrl || !consumerKey || !consumerSecret) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing required fields' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        try {
          console.log('🔐 Encrypting credentials...');
          const credentials: WooCommerceCredentials = { storeUrl, consumerKey, consumerSecret };
          const { data: encryptedCredentials, error: encryptError } = await supabaseClient.rpc(
            'encrypt_integration_credentials',
            { data: JSON.stringify(credentials) }
          );

          if (encryptError) {
            console.error('❌ Encryption error:', encryptError);
            throw new Error('Erro ao criptografar credenciais');
          }

          console.log('💾 Saving to database...');
          const { data, error } = await supabaseClient
            .from('integrations')
            .upsert({
              user_id: demoUserId,
              platform: 'woocommerce',
              store_name: storeName,
              store_url: storeUrl,
              encrypted_credentials: encryptedCredentials,
              is_active: true
            })
            .select()
            .single();

          if (error) {
            console.error('❌ Database error:', error);
            throw new Error('Database error: ' + error.message);
          }

          console.log('✅ Successfully saved:', data?.id);
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Integration saved successfully',
            integration: {
              id: data.id,
              storeName,
              storeUrl,
              status: 'connected',
              lastSync: data.updated_at
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('❌ Save failed:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to save integration: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'list': {
        console.log('Processing list action');
        
        try {
          const { data, error } = await supabaseClient
            .from('integrations')
            .select('*')
            .eq('user_id', demoUserId)
            .eq('platform', 'woocommerce');

          if (error) {
            throw new Error(error.message);
          }

          const integrations = data?.map(integration => ({
            id: integration.id,
            storeName: integration.store_name,
            storeUrl: integration.store_url,
            status: integration.is_active ? 'connected' : 'disconnected',
            lastSync: integration.updated_at,
            errorMessage: null
          })) || [];

          return new Response(JSON.stringify({ integrations }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('List error:', error);
          return new Response(JSON.stringify({ 
            error: 'Failed to fetch integrations',
            details: error.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'fetch_products': {
        console.log('Processing fetch_products action');
        
        try {
          const { data: integrationData, error: integrationError } = await supabaseClient
            .from('integrations')
            .select('*')
            .eq('user_id', demoUserId)
            .eq('platform', 'woocommerce')
            .eq('is_active', true)
            .single();

          if (integrationError || !integrationData) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Nenhuma integração WooCommerce conectada encontrada'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Decrypt credentials
          const { data: decryptedCredentials, error: decryptError } = await supabaseClient.rpc(
            'decrypt_integration_credentials',
            { encrypted_data: integrationData.encrypted_credentials }
          );
          
          if (decryptError) {
            throw new Error('Failed to decrypt credentials');
          }

          const credentials = JSON.parse(decryptedCredentials);
          const auth = btoa(`${credentials.consumerKey}:${credentials.consumerSecret}`);
          const cleanUrl = credentials.storeUrl.replace(/\/$/, '');
          
          // Fetch products
          const productUrl = `${cleanUrl}/wp-json/wc/v3/products?per_page=100&status=publish`;
          console.log('Fetching products from:', productUrl);
          
          const response = await fetch(productUrl, {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(30000)
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          const productsData = await response.json();
          
          const products = Array.isArray(productsData) ? productsData.map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku || `PRODUCT-${product.id}`,
            price: parseFloat(product.regular_price || product.price || '0'),
            salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
            image: product.images && product.images.length > 0 ? product.images[0].src : null,
            stock: product.stock_quantity || 0,
            category: product.categories && product.categories.length > 0 ? product.categories[0].name : 'Sem categoria',
            status: product.status,
            description: product.description || product.short_description || '',
            permalink: product.permalink,
            currency: 'MXN' // Default currency
          })) : [];

          console.log(`Successfully fetched ${products.length} products`);

          return new Response(JSON.stringify({
            success: true,
            products: products,
            storeInfo: {
              name: integrationData.store_name,
              url: integrationData.store_url,
              totalProducts: products.length,
              apiUsed: productUrl,
              currency: 'MXN'
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Error fetching products:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Erro ao buscar produtos: ' + error.message
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
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});