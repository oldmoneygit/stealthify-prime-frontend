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
    const cleanUrl = storeUrl.replace(/\/$/, '');
    const apiUrl = `${cleanUrl}/wp-json/wc/v3/system_status`;
    
    // Create basic auth header
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `WooCommerce API Error (${response.status}): ${errorText}`
      };
    }

    const data = await response.json();
    
    // Also test products endpoint to ensure we have the right permissions
    const productsResponse = await fetch(`${cleanUrl}/wp-json/wc/v3/products?per_page=1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      return {
        success: false,
        error: `WooCommerce Products API Error (${productsResponse.status}): Insufficient permissions`
      };
    }

    return {
      success: true,
      storeInfo: {
        environment: data.environment,
        database: data.database,
        activePlugins: data.active_plugins?.length || 0,
        theme: data.theme?.name
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Connection Error: ${error.message}`
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
    console.log('WooCommerce integration function called with method:', req.method);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // For public access, we'll use a demo user ID
    // In production, you'd implement proper authentication
    const demoUserId = 'demo-user-' + Date.now().toString();

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...body } = requestBody;

    switch (action) {
      case 'test': {
        const { storeUrl, consumerKey, consumerSecret } = body;
        
        console.log(`Testing WooCommerce connection for user ${demoUserId}`);
        
        const testResult = await testWooCommerceConnection(storeUrl, consumerKey, consumerSecret);
        
        await logAction(
          supabaseClient,
          demoUserId,
          null,
          'test_connection',
          testResult.success ? 'success' : 'error',
          testResult.success ? 'WooCommerce connection test successful' : testResult.error!,
          { storeUrl, storeInfo: testResult.storeInfo }
        );

        return new Response(JSON.stringify(testResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'save': {
        const { storeName, storeUrl, consumerKey, consumerSecret } = body;
        
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
            onConflict: 'user_id,integration_type,store_url'
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
            error: 'Failed to save integration'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

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
      }

      case 'list': {
        const { data, error } = await supabaseClient
          .from('user_integrations')
          .select('*')
          .eq('user_id', demoUserId)
          .eq('integration_type', 'woocommerce');

        if (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch integrations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const integrations = data.map(integration => ({
          id: integration.id,
          storeName: integration.store_name,
          storeUrl: integration.store_url,
          status: integration.status,
          lastSync: integration.last_sync_at,
          errorMessage: integration.error_message
        }));

        return new Response(JSON.stringify({ integrations }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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