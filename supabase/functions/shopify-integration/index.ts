import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShopifyCredentials {
  shopUrl: string;
  accessToken: string;
}

// Simple encryption/decryption functions
function encrypt(text: string, key: string): string {
  // Simple XOR encryption for demo - in production use proper encryption
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

async function testShopifyConnection(shopUrl: string, accessToken: string): Promise<{ success: boolean; error?: string; shopInfo?: any }> {
  try {
    const cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const apiUrl = `https://${cleanUrl}/admin/api/2024-07/shop.json`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Shopify API Error (${response.status}): ${errorText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      shopInfo: data.shop
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
    console.log('Shopify integration function called with method:', req.method);
    
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
        const { shopUrl, accessToken } = body;
        
        console.log(`Testing Shopify connection for user ${demoUserId}`);
        
        const testResult = await testShopifyConnection(shopUrl, accessToken);
        
        await logAction(
          supabaseClient,
          demoUserId,
          null,
          'test_connection',
          testResult.success ? 'success' : 'error',
          testResult.success ? 'Shopify connection test successful' : testResult.error!,
          { shopUrl, shopInfo: testResult.shopInfo }
        );

        return new Response(JSON.stringify(testResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'save': {
        const { storeName, shopUrl, accessToken } = body;
        
        console.log(`Saving Shopify integration for user ${demoUserId}`);

        // First test the connection
        const testResult = await testShopifyConnection(shopUrl, accessToken);
        
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
        const credentials: ShopifyCredentials = { shopUrl, accessToken };
        const encryptedCredentials = encrypt(JSON.stringify(credentials), encryptionKey);

        // Save to database
        const { data, error } = await supabaseClient
          .from('user_integrations')
          .upsert({
            user_id: demoUserId,
            integration_type: 'shopify',
            store_name: storeName,
            store_url: shopUrl,
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
            { shopUrl, error }
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
          'Shopify integration saved successfully',
          { shopUrl, storeName, shopInfo: testResult.shopInfo }
        );

        return new Response(JSON.stringify({
          success: true,
          integration: {
            id: data.id,
            storeName,
            shopUrl,
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
          .eq('integration_type', 'shopify');

        if (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch integrations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const integrations = data.map(integration => ({
          id: integration.id,
          storeName: integration.store_name,
          shopUrl: integration.store_url,
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
    console.error('Shopify integration error:', error);
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