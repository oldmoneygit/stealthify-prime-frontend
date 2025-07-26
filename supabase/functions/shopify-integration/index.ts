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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...requestData } = await req.json()
    console.log('Shopify Integration - Action:', action)

    if (action === 'import_product') {
      const { product }: { product: ShopifyProduct } = requestData
      
      // Get Shopify credentials
      const { data: integrations, error: integrationsError } = await supabaseClient
        .from('integrations')
        .select('*')
        .eq('platform', 'shopify')
        .eq('is_active', true)
        .single()

      if (integrationsError || !integrations) {
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
      const { data: decryptedData, error: decryptError } = await supabaseClient.rpc(
        'decrypt_integration_credentials',
        { encrypted_data: integrations.encrypted_credentials }
      )

      if (decryptError || !decryptedData) {
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

      // Upload camouflage image to Shopify first
      let shopifyImageUrl = null
      if (product.camouflageImage) {
        try {
          // Convert base64 to blob for upload
          const base64Data = product.camouflageImage.split(',')[1]
          const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
          
          // Create image in Shopify
          const imageResponse = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-07/products.json`, {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product: {
                title: `temp-image-${Date.now()}`,
                product_type: 'temp',
                vendor: 'temp',
                images: [{
                  attachment: product.camouflageImage
                }]
              }
            })
          })

          if (imageResponse.ok) {
            const tempProduct = await imageResponse.json()
            if (tempProduct.product?.images?.[0]?.src) {
              shopifyImageUrl = tempProduct.product.images[0].src
              
              // Delete the temporary product, keep only the image
              await fetch(`https://${shopName}.myshopify.com/admin/api/2025-07/products/${tempProduct.product.id}.json`, {
                method: 'DELETE',
                headers: {
                  'X-Shopify-Access-Token': accessToken
                }
              })
            }
          }
        } catch (imageError) {
          console.error('Error uploading image:', imageError)
        }
      }

      // Create product in Shopify with camouflage
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
          }],
          ...(shopifyImageUrl && {
            images: [{
              src: shopifyImageUrl
            }]
          })
        }
      }

      const shopifyResponse = await fetch(`https://${shopName}.myshopify.com/admin/api/2025-07/products.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopifyProductData)
      })

      if (!shopifyResponse.ok) {
        const errorData = await shopifyResponse.text()
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
