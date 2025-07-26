import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShopifyProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  image: string | null;
  stock: number;
  category: string;
  status: string;
  description: string;
  permalink: string;
  currency: string;
  camouflageTitle: string;
  camouflageImage: string;
}

serve(async (req) => {
  console.log('🚀 Shopify Integration function called - Method:', req.method)
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📡 Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log('✅ Supabase client created')

    console.log('📝 Parsing request body...')
    const { action, ...requestData } = await req.json()
    console.log('Shopify Integration - Action:', action)
    console.log('Request data:', requestData)

    if (action === 'test') {
      console.log('🔍 Testing Shopify connection...')
      const { shopUrl, accessToken } = requestData
      
      try {
        // Extract shop name from URL
        const shopName = shopUrl.replace(/^https?:\/\//, '').replace('.myshopify.com', '').replace(/\/$/, '')
        
        // Test connection to Shopify API
        const testResponse = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-07/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        })

        if (!testResponse.ok) {
          const errorText = await testResponse.text()
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Falha na autenticação: ${testResponse.status} - ${errorText}` 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const shopInfo = await testResponse.json()
        console.log('✅ Shopify connection test successful')
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            shopInfo: shopInfo.shop 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('❌ Shopify test error:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || 'Erro ao testar conexão' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (action === 'save') {
      console.log('💾 Saving Shopify integration...')
      const { storeName, shopUrl, accessToken } = requestData
      
      try {
        // Extract shop name from URL
        const shopName = shopUrl.replace(/^https?:\/\//, '').replace('.myshopify.com', '').replace(/\/$/, '')
        
        // Encrypt credentials
        const credentials = JSON.stringify({ shopName, accessToken })
        const { data: encryptedCredentials, error: encryptError } = await supabaseClient.rpc(
          'encrypt_integration_credentials',
          { data: credentials }
        )

        if (encryptError) {
          throw new Error('Erro ao criptografar credenciais')
        }

        // Save to database
        const { data: integration, error: saveError } = await supabaseClient
          .from('integrations')
          .upsert({
            user_id: '00000000-0000-0000-0000-000000000001', // Demo user
            platform: 'shopify',
            store_name: storeName,
            store_url: shopUrl,
            encrypted_credentials: encryptedCredentials,
            is_active: true
          })
          .select()
          .single()

        if (saveError) {
          throw new Error(`Erro ao salvar integração: ${saveError.message}`)
        }

        console.log('✅ Shopify integration saved successfully')
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            integration: integration 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('❌ Shopify save error:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || 'Erro ao salvar integração' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (action === 'list') {
      console.log('📋 Listing Shopify integrations...')
      
      try {
        const { data: integrations, error: listError } = await supabaseClient
          .from('integrations')
          .select('*')
          .eq('platform', 'shopify')
          .eq('user_id', '00000000-0000-0000-0000-000000000001') // Demo user

        if (listError) {
          throw new Error(`Erro ao listar integrações: ${listError.message}`)
        }

        const formattedIntegrations = integrations.map(integration => ({
          id: integration.id,
          storeName: integration.store_name,
          storeUrl: integration.store_url,
          status: integration.is_active ? 'connected' : 'disconnected',
          lastSync: integration.updated_at
        }))

        console.log('✅ Shopify integrations listed successfully')
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            integrations: formattedIntegrations 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('❌ Shopify list error:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || 'Erro ao listar integrações' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (action === 'import_product') {
      const { product }: { product: ShopifyProduct } = requestData
      console.log('Product to import:', product.sku, product.camouflageTitle)
      
      // Get Shopify credentials
      console.log('Fetching Shopify integration...')
      const { data: integrations, error: integrationsError } = await supabaseClient
        .from('integrations')
        .select('*')
        .eq('platform', 'shopify')
        .eq('is_active', true)
        .single()

      console.log('Integration found:', !!integrations, 'Error:', integrationsError)

      if (integrationsError || !integrations) {
        console.error('No Shopify integration found:', integrationsError)
        
        // Return a more informative error for demo purposes
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Para testar a importação, você precisa configurar uma integração Shopify real na seção de Integrações. Por enquanto, vou simular uma importação bem-sucedida.',
            demo: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200  // Changed to 200 for demo
          }
        )
      }

      // Decrypt credentials
      console.log('Decrypting credentials...')
      const { data: decryptedData, error: decryptError } = await supabaseClient.rpc(
        'decrypt_integration_credentials',
        { encrypted_data: integrations.encrypted_credentials }
      )

      console.log('Decryption result:', !!decryptedData, 'Error:', decryptError)

      if (decryptError || !decryptedData) {
        console.error('Decryption failed:', decryptError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao descriptografar credenciais da Shopify' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      const credentials = JSON.parse(decryptedData)
      const { shopName, accessToken } = credentials
      console.log('Shop name:', shopName, 'Has access token:', !!accessToken)

      // Create product in Shopify with camouflage
      console.log('Creating Shopify product...')
      const shopifyProductData = {
        product: {
          title: product.camouflageTitle || product.name,
          body_html: `<p>Produto importado via sistema de camuflagem</p><p>SKU Original: ${product.sku}</p>`,
          vendor: 'Importado',
          product_type: 'Produto Premium', // Use generic type instead of real category
          status: 'active',
          tags: 'Stealthify Import', // Add tracking tag
          variants: [{
            sku: product.sku,
            price: (product.salePrice || product.price).toString(),
            inventory_quantity: 100, // Fixed stock of 100
            inventory_management: 'shopify',
            inventory_policy: 'deny',
            taxable: false // Disable tax charges
          }]
        }
      }

      // Add camouflage image if provided
      if (product.camouflageImage) {
        // Extract base64 content without the data URL prefix
        const base64Content = product.camouflageImage.split(',')[1]
        shopifyProductData.product.images = [{
          attachment: base64Content
        }]
        console.log('Adding image with base64 length:', base64Content.length)
      }

      console.log('Shopify product data:', JSON.stringify(shopifyProductData, null, 2))

      const shopifyUrl = `https://${shopName}.myshopify.com/admin/api/2025-07/products.json`
      console.log('Making request to:', shopifyUrl)
      
      const shopifyResponse = await fetch(shopifyUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopifyProductData)
      })

      console.log('Shopify response status:', shopifyResponse.status)

      if (!shopifyResponse.ok) {
        const errorData = await shopifyResponse.text()
        console.error('Shopify API error:', shopifyResponse.status, errorData)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro da Shopify: ${shopifyResponse.status} - ${errorData}` 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const shopifyProduct = await shopifyResponse.json()
      console.log('Product created successfully:', shopifyProduct.product?.id)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          shopifyProduct: shopifyProduct.product,
          message: `Produto ${product.sku} importado com sucesso para a Shopify como "${product.camouflageTitle}"` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Ação não reconhecida' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Shopify Integration Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
