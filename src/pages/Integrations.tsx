import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useIntegrations, type Integration } from "@/hooks/useIntegrations"
import { 
  ShoppingBag, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Eye,
  EyeOff,
  TestTube,
  Zap
} from "lucide-react"

const Integrations = () => {
  const { toast } = useToast()
  const {
    isLoadingShopify,
    isLoadingWooCommerce,
    testShopifyConnection,
    testWooCommerceConnection,
    saveShopifyIntegration,
    saveWooCommerceIntegration,
    getIntegrations
  } = useIntegrations()

  const [showSecrets, setShowSecrets] = useState({
    shopifyToken: false,
    wooKey: false,
    wooSecret: false
  })

  const [shopifyIntegrations, setShopifyIntegrations] = useState<Integration[]>([])
  const [wooCommerceIntegrations, setWooCommerceIntegrations] = useState<Integration[]>([])

  const [editMode, setEditMode] = useState({
    shopify: false,
    woocommerce: false
  })

  const [formData, setFormData] = useState({
    shopifyUrl: "",
    shopifyToken: "",
    shopifyStoreName: "",
    wooUrl: "",
    wooKey: "",
    wooSecret: "",
    wooStoreName: ""
  })

  // Local storage for credentials when in edit mode
  const [savedCredentials, setSavedCredentials] = useState({
    shopify: { url: "", token: "", storeName: "" },
    woocommerce: { url: "", key: "", secret: "", storeName: "" }
  })

  // Load existing integrations on component mount
  useEffect(() => {
    const loadIntegrations = async () => {
      const [shopifyData, wooCommerceData] = await Promise.all([
        getIntegrations('shopify'),
        getIntegrations('woocommerce')
      ])
      
      setShopifyIntegrations(shopifyData)
      setWooCommerceIntegrations(wooCommerceData)

      // Pre-fill form with first integration if available
      if (shopifyData.length > 0) {
        const firstShopify = shopifyData[0]
        setFormData(prev => ({
          ...prev,
          shopifyUrl: firstShopify.storeUrl,
          shopifyStoreName: firstShopify.storeName
        }))
        setSavedCredentials(prev => ({
          ...prev,
          shopify: {
            url: firstShopify.storeUrl,
            token: "", // Never store actual token
            storeName: firstShopify.storeName
          }
        }))
        setEditMode(prev => ({ ...prev, shopify: false }))
      } else {
        setEditMode(prev => ({ ...prev, shopify: true }))
      }

      if (wooCommerceData.length > 0) {
        const firstWoo = wooCommerceData[0]
        setFormData(prev => ({
          ...prev,
          wooUrl: firstWoo.storeUrl,
          wooStoreName: firstWoo.storeName
        }))
        setSavedCredentials(prev => ({
          ...prev,
          woocommerce: {
            url: firstWoo.storeUrl,
            key: "", // Never store actual keys
            secret: "",
            storeName: firstWoo.storeName
          }
        }))
        setEditMode(prev => ({ ...prev, woocommerce: false }))
      } else {
        setEditMode(prev => ({ ...prev, woocommerce: true }))
      }
    }

    loadIntegrations()
  }, [getIntegrations])

  const handleSave = async (platform: 'shopify' | 'woocommerce') => {
    if (platform === 'shopify') {
      if (!formData.shopifyUrl || !formData.shopifyToken || !formData.shopifyStoreName) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos do Shopify",
          variant: "destructive"
        })
        return
      }

      const result = await saveShopifyIntegration(
        formData.shopifyStoreName,
        formData.shopifyUrl,
        formData.shopifyToken
      )

      if (result.success) {
        // Reload integrations
        const shopifyData = await getIntegrations('shopify')
        setShopifyIntegrations(shopifyData)
        setEditMode(prev => ({ ...prev, shopify: false }))
        // Clear sensitive data from form
        setFormData(prev => ({ ...prev, shopifyToken: "" }))
      }
    } else {
      if (!formData.wooUrl || !formData.wooKey || !formData.wooSecret || !formData.wooStoreName) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos do WooCommerce",
          variant: "destructive"
        })
        return
      }

      const result = await saveWooCommerceIntegration(
        formData.wooStoreName,
        formData.wooUrl,
        formData.wooKey,
        formData.wooSecret
      )

      if (result.success) {
        // Reload integrations
        const wooCommerceData = await getIntegrations('woocommerce')
        setWooCommerceIntegrations(wooCommerceData)
        setEditMode(prev => ({ ...prev, woocommerce: false }))
        // Clear sensitive data from form
        setFormData(prev => ({ ...prev, wooKey: "", wooSecret: "" }))
      }
    }
  }

  const testConnection = async (platform: 'shopify' | 'woocommerce') => {
    if (platform === 'shopify') {
      // Check if we have saved credentials and form fields are empty
      const hasShopifyIntegration = shopifyIntegrations.length > 0;
      const shopifyUrl = formData.shopifyUrl || (hasShopifyIntegration ? shopifyIntegrations[0].storeUrl : '');
      const shopifyToken = formData.shopifyToken;
      
      if (!shopifyUrl || (!shopifyToken && !hasShopifyIntegration)) {
        toast({
          title: "Campos obrigatórios",
          description: "Para testar uma nova configuração, preencha URL e Token do Shopify",
          variant: "destructive"
        })
        return
      }
      
      // If testing existing integration without token, show info message
      if (!shopifyToken && hasShopifyIntegration) {
        toast({
          title: "Teste com credenciais salvas",
          description: "Para testar com novas credenciais, clique em 'Editar Credenciais' primeiro",
          variant: "default"
        })
        return
      }
      
      // For Shopify, just test the connection without saving
      await testShopifyConnection(shopifyUrl, shopifyToken)
    } else {
      if (!formData.wooUrl || !formData.wooKey || !formData.wooSecret || !formData.wooStoreName) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos do WooCommerce para testar e salvar",
          variant: "destructive"
        })
        return
      }
      // For WooCommerce, testing will automatically save if successful
      const result = await testWooCommerceConnection(formData.wooUrl, formData.wooKey, formData.wooSecret)
      if (result.success) {
        // Reload integrations after successful save
        const wooCommerceData = await getIntegrations('woocommerce')
        setWooCommerceIntegrations(wooCommerceData)
        setEditMode(prev => ({ ...prev, woocommerce: false }))
        // Clear sensitive data from form
        setFormData(prev => ({ ...prev, wooKey: "", wooSecret: "" }))
      }
    }
  }

  // Get current integration status for display
  const getShopifyStatus = () => {
    const integration = shopifyIntegrations[0]
    return {
      connected: integration?.status === 'connected',
      url: integration?.storeUrl || 'Não configurado',
      lastSync: integration?.lastSync ? new Date(integration.lastSync).toLocaleString('pt-BR') : 'Nunca'
    }
  }

  const getWooCommerceStatus = () => {
    const integration = wooCommerceIntegrations[0]
    return {
      connected: integration?.status === 'connected',
      url: integration?.storeUrl || 'Não configurado',
      lastSync: integration?.lastSync ? new Date(integration.lastSync).toLocaleString('pt-BR') : 'Nunca'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    })
  }

  const toggleShowSecret = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const toggleEditMode = (platform: 'shopify' | 'woocommerce') => {
    const isEnteringEditMode = !editMode[platform]
    
    setEditMode(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
    
    // When entering edit mode, restore saved data to form
    if (isEnteringEditMode) {
      if (platform === 'shopify') {
        setFormData(prev => ({
          ...prev,
          shopifyUrl: savedCredentials.shopify.url,
          shopifyStoreName: savedCredentials.shopify.storeName,
          shopifyToken: "" // Always start with empty token for security
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          wooUrl: savedCredentials.woocommerce.url,
          wooStoreName: savedCredentials.woocommerce.storeName,
          wooKey: "", // Always start with empty credentials for security
          wooSecret: ""
        }))
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Configure as conexões com Shopify e WooCommerce
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Shopify</CardTitle>
                  <CardDescription>Plataforma de checkout</CardDescription>
                </div>
              </div>
              <Badge variant={getShopifyStatus().connected ? "default" : "destructive"} className="bg-accent">
                {getShopifyStatus().connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Desconectado</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">URL: </span>
              <span className="text-foreground">{getShopifyStatus().url}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Última sincronização: </span>
              <span className="text-accent">{getShopifyStatus().lastSync}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">WooCommerce</CardTitle>
                  <CardDescription>Vitrine de produtos</CardDescription>
                </div>
              </div>
              <Badge variant={getWooCommerceStatus().connected ? "default" : "destructive"} className="bg-accent">
                {getWooCommerceStatus().connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Desconectado</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">URL: </span>
              <span className="text-foreground">{getWooCommerceStatus().url}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Última sincronização: </span>
              <span className="text-accent">{getWooCommerceStatus().lastSync}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shopify Configuration */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Configuração Shopify
          </CardTitle>
          <CardDescription>
            Configure as credenciais de acesso à sua loja Shopify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!editMode.shopify && shopifyIntegrations.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Configuração Ativa</h4>
                    <p className="text-sm text-muted-foreground">Shopify está configurado e conectado</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleEditMode('shopify')}
                  >
                    Editar Credenciais
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Loja: </span>
                    <span className="text-foreground">{shopifyIntegrations[0]?.storeName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">URL: </span>
                    <span className="text-foreground">{shopifyIntegrations[0]?.storeUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopify-store-name">Nome da Loja</Label>
                <Input
                  id="shopify-store-name"
                  placeholder="Minha Loja Shopify"
                  value={formData.shopifyStoreName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopifyStoreName: e.target.value }))}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopify-url">URL da Loja Shopify</Label>
                <Input
                  id="shopify-url"
                  placeholder="https://minha-loja.myshopify.com"
                  value={formData.shopifyUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopifyUrl: e.target.value }))}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopify-token">Access Token (Private App)</Label>
                <div className="relative">
                  <Input
                    id="shopify-token"
                    type={showSecrets.shopifyToken ? "text" : "password"}
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={formData.shopifyToken}
                    onChange={(e) => setFormData(prev => ({ ...prev, shopifyToken: e.target.value }))}
                    className="bg-background/50 pr-20"
                  />
                  <div className="absolute right-1 top-1 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleShowSecret('shopifyToken')}
                    >
                      {showSecrets.shopifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(formData.shopifyToken)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Crie um Private App no Shopify Admin → Apps → Private apps
                </p>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-3">
            {editMode.shopify || shopifyIntegrations.length === 0 ? (
              <>
                <Button 
                  onClick={() => handleSave('shopify')}
                  className="bg-gradient-primary hover:shadow-glow"
                  disabled={isLoadingShopify}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoadingShopify ? "Salvando..." : "Salvar Shopify"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => testConnection('shopify')}
                  disabled={isLoadingShopify}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isLoadingShopify ? "Testando..." : "Testar Conexão"}
                </Button>
                {editMode.shopify && (
                  <Button 
                    variant="ghost"
                    onClick={() => toggleEditMode('shopify')}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            ) : (
              <Button 
                variant="outline"
                onClick={() => testConnection('shopify')}
                disabled={isLoadingShopify}
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isLoadingShopify ? "Testando..." : "Testar Conexão"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WooCommerce Configuration */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-secondary-foreground" />
            Configuração WooCommerce
          </CardTitle>
          <CardDescription>
            Configure as credenciais da API REST do WooCommerce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!editMode.woocommerce && wooCommerceIntegrations.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Configuração Ativa</h4>
                    <p className="text-sm text-muted-foreground">WooCommerce está configurado e conectado</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleEditMode('woocommerce')}
                  >
                    Editar Credenciais
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Loja: </span>
                    <span className="text-foreground">{wooCommerceIntegrations[0]?.storeName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">URL: </span>
                    <span className="text-foreground">{wooCommerceIntegrations[0]?.storeUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="woo-store-name">Nome da Loja</Label>
                <Input
                  id="woo-store-name"
                  placeholder="Minha Loja WooCommerce"
                  value={formData.wooStoreName}
                  onChange={(e) => setFormData(prev => ({ ...prev, wooStoreName: e.target.value }))}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="woo-url">URL do WooCommerce</Label>
                <Input
                  id="woo-url"
                  placeholder="https://meusite.com.br"
                  value={formData.wooUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, wooUrl: e.target.value }))}
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="woo-key">Consumer Key</Label>
                  <div className="relative">
                    <Input
                      id="woo-key"
                      type={showSecrets.wooKey ? "text" : "password"}
                      placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={formData.wooKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, wooKey: e.target.value }))}
                      className="bg-background/50 pr-20"
                    />
                    <div className="absolute right-1 top-1 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleShowSecret('wooKey')}
                      >
                        {showSecrets.wooKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(formData.wooKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="woo-secret">Consumer Secret</Label>
                  <div className="relative">
                    <Input
                      id="woo-secret"
                      type={showSecrets.wooSecret ? "text" : "password"}
                      placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={formData.wooSecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, wooSecret: e.target.value }))}
                      className="bg-background/50 pr-20"
                    />
                    <div className="absolute right-1 top-1 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleShowSecret('wooSecret')}
                      >
                        {showSecrets.wooSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(formData.wooSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Gere as chaves API em: WooCommerce → Configurações → Avançado → REST API
              </p>
            </div>
          )}

          <Separator />

          <div className="flex gap-3">
            {editMode.woocommerce || wooCommerceIntegrations.length === 0 ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => testConnection('woocommerce')}
                  disabled={isLoadingWooCommerce}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isLoadingWooCommerce ? "Testando e Salvando..." : "Testar e Salvar"}
                </Button>
                {editMode.woocommerce && (
                  <Button 
                    variant="ghost"
                    onClick={() => toggleEditMode('woocommerce')}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            ) : (
              <Button 
                variant="outline"
                onClick={() => testConnection('woocommerce')}
                disabled={isLoadingWooCommerce}
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isLoadingWooCommerce ? "Testando..." : "Testar Conexão"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card border-accent/20">
        <CardHeader>
          <CardTitle className="text-accent">Precisa de ajuda?</CardTitle>
          <CardDescription>
            Guias rápidos para configuração das integrações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">📋 Como configurar Shopify:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Acesse Admin → Apps → Private apps</li>
                <li>2. Clique em "Create private app"</li>
                <li>3. Configure as permissões necessárias</li>
                <li>4. Copie o Access Token gerado</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔧 Como configurar WooCommerce:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. WooCommerce → Configurações → Avançado</li>
                <li>2. Clique na aba "REST API"</li>
                <li>3. Adicione nova chave API</li>
                <li>4. Copie Consumer Key e Secret</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Integrations