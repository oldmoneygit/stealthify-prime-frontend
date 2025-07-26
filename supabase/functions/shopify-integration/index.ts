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
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Nenhuma integração Shopify ativa encontrada' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
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

      // Create product in Shopify with camouflage (simplified approach first)
      console.log('Creating Shopify product...')
      const shopifyProductData = {
        product: {
          title: product.camouflageTitle || product.name,
          body_html: `<p>Produto importado via sistema de camuflagem</p><p>SKU Original: ${product.sku}</p>`,
          vendor: 'Importado',
          product_type: product.category,
          status: 'active',
          variants: [{
            sku: product.sku,
            price: (product.salePrice || product.price).toString(),
            inventory_quantity: product.stock,
            inventory_management: 'shopify',
            inventory_policy: 'deny'
          }]
        }
      }

      // Add image if provided
      if (product.camouflageImage) {
        shopifyProductData.product.images = [{
          attachment: product.camouflageImage
        }]
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
