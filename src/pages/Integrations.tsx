import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useIntegrations, type Integration } from "@/hooks/useIntegrations"
import { supabase } from "@/integrations/supabase/client"
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

  // Estados para os modais de edição
  const [editModal, setEditModal] = useState({
    shopify: false,
    woocommerce: false
  })

  // Dados temporários para os modais
  const [modalData, setModalData] = useState({
    shopifyUrl: "",
    shopifyToken: "",
    shopifyStoreName: "",
    wooUrl: "",
    wooKey: "",
    wooSecret: "",
    wooStoreName: ""
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
      // Check if we have saved integration
      const hasIntegration = shopifyIntegrations.length > 0;
      
      if (hasIntegration && !editMode.shopify) {
        // Test with saved credentials
        await testWithSavedCredentials('shopify');
        return;
      }
      
      // Test with form data for new connections
      const shopifyUrl = formData.shopifyUrl;
      const shopifyToken = formData.shopifyToken;
      
      if (!shopifyUrl) {
        toast({
          title: "Campo obrigatório",
          description: "URL da loja Shopify é obrigatória",
          variant: "destructive"
        })
        return
      }
      
      if (!shopifyToken) {
        toast({
          title: "Campo obrigatório", 
          description: "Access Token é obrigatório para testar a conexão",
          variant: "destructive"
        })
        return
      }
      
      await testShopifyConnection(shopifyUrl, shopifyToken)
    } else {
      // WooCommerce logic
      const hasIntegration = wooCommerceIntegrations.length > 0;
      
      if (hasIntegration && !editMode.woocommerce) {
        // Test with saved credentials
        await testWithSavedCredentials('woocommerce');
        return;
      }
      
      // Test with form data for new connections or edit mode
      const useModalData = editModal.woocommerce;
      const testData = useModalData ? modalData : formData;
      
      const wooUrl = useModalData ? testData.wooUrl : testData.wooUrl;
      const wooKey = useModalData ? testData.wooKey : testData.wooKey;
      const wooSecret = useModalData ? testData.wooSecret : testData.wooSecret;
      const wooStoreName = useModalData ? testData.wooStoreName : testData.wooStoreName;
      
      if (!wooUrl || !wooKey || !wooSecret || !wooStoreName) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos do WooCommerce para testar",
          variant: "destructive"
        })
        return
      }
      
      console.log('Starting WooCommerce test with data:', {
        url: wooUrl,
        storeName: wooStoreName,
        hasKey: !!wooKey,
        hasSecret: !!wooSecret,
        source: useModalData ? 'modal' : 'form'
      });
      
      const result = await testWooCommerceConnection(wooUrl, wooKey, wooSecret, wooStoreName)
      if (result.success) {
        const wooCommerceData = await getIntegrations('woocommerce')
        setWooCommerceIntegrations(wooCommerceData)
        setEditMode(prev => ({ ...prev, woocommerce: false }))
        
        setFormData(prev => ({ ...prev, wooKey: "", wooSecret: "" }))
        if (useModalData) {
          closeEditModal('woocommerce')
        }
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

  // Funções para abrir modais de edição
  const openEditModal = (platform: 'shopify' | 'woocommerce') => {
    if (platform === 'shopify') {
      const integration = shopifyIntegrations[0]
      if (integration) {
        setModalData(prev => ({
          ...prev,
          shopifyUrl: integration.storeUrl,
          shopifyStoreName: integration.storeName,
          shopifyToken: "" // Sempre começa vazio por segurança
        }))
      }
    } else {
      const integration = wooCommerceIntegrations[0]
      if (integration) {
        setModalData(prev => ({
          ...prev,
          wooUrl: integration.storeUrl,
          wooStoreName: integration.storeName,
          wooKey: "", // Sempre começa vazio por segurança
          wooSecret: ""
        }))
      }
    }
    
    setEditModal(prev => ({ ...prev, [platform]: true }))
  }

  const closeEditModal = (platform: 'shopify' | 'woocommerce') => {
    setEditModal(prev => ({ ...prev, [platform]: false }))
    // Limpar dados temporários
    if (platform === 'shopify') {
      setModalData(prev => ({
        ...prev,
        shopifyUrl: "",
        shopifyToken: "",
        shopifyStoreName: ""
      }))
    } else {
      setModalData(prev => ({
        ...prev,
        wooUrl: "",
        wooKey: "",
        wooSecret: "",
        wooStoreName: ""
      }))
    }
  }

  const saveFromModal = async (platform: 'shopify' | 'woocommerce') => {
    if (platform === 'shopify') {
      if (!modalData.shopifyUrl || !modalData.shopifyToken || !modalData.shopifyStoreName) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos do Shopify",
          variant: "destructive"
        })
        return
      }

      const result = await saveShopifyIntegration(
        modalData.shopifyStoreName,
        modalData.shopifyUrl,
        modalData.shopifyToken
      )

      if (result.success) {
        // Reload integrations
        const shopifyData = await getIntegrations('shopify')
        setShopifyIntegrations(shopifyData)
        closeEditModal('shopify')
        toast({
          title: "Sucesso!",
          description: "Credenciais Shopify atualizadas com sucesso",
        })
      }
    } else {
      if (!modalData.wooUrl || !modalData.wooKey || !modalData.wooSecret || !modalData.wooStoreName) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos do WooCommerce",
          variant: "destructive"
        })
        return
      }

      const result = await saveWooCommerceIntegration(
        modalData.wooStoreName,
        modalData.wooUrl,
        modalData.wooKey,
        modalData.wooSecret
      )

      if (result.success) {
        // Reload integrations
        const wooCommerceData = await getIntegrations('woocommerce')
        setWooCommerceIntegrations(wooCommerceData)
        closeEditModal('woocommerce')
        toast({
          title: "Sucesso!",
          description: "Credenciais WooCommerce atualizadas com sucesso",
        })
      }
    }
  }

  const toggleEditMode = (platform: 'shopify' | 'woocommerce') => {
    const isEnteringEditMode = !editMode[platform]
    
    setEditMode(prev => ({
      ...prev,
      [platform]: isEnteringEditMode
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

  // Add function to test with saved credentials
  const testWithSavedCredentials = async (platform: 'shopify' | 'woocommerce') => {
    if (platform === 'shopify') {
      // For Shopify, we need to get the encrypted credentials from the database
      const integrations = await getIntegrations('shopify')
      if (integrations.length > 0) {
        // Call edge function to test with saved credentials
        const { data, error } = await supabase.functions.invoke('shopify-integration', {
          body: {
            action: 'test_saved',
            integrationId: integrations[0].id
          }
        });

        if (error) {
          toast({
            title: "Erro na conexão",
            description: "Falha ao testar conexão com credenciais salvas",
            variant: "destructive",
          });
          return;
        }

        if (data.success) {
          toast({
            title: "Conexão bem-sucedida!",
            description: `Conectado à loja: ${data.shopInfo?.name || integrations[0].storeUrl}`,
          });
        } else {
          toast({
            title: "Erro na conexão",
            description: data.error,
            variant: "destructive",
          });
        }
      }
    } else {
      // For WooCommerce
      const integrations = await getIntegrations('woocommerce')
      if (integrations.length > 0) {
        // Call edge function to test with saved credentials
        const { data, error } = await supabase.functions.invoke('woocommerce-integration', {
          body: {
            action: 'test_saved',
            integrationId: integrations[0].id
          }
        });

        if (error) {
          toast({
            title: "Erro na conexão",
            description: "Falha ao testar conexão com credenciais salvas",
            variant: "destructive",
          });
          return;
        }

        if (data.success) {
          toast({
            title: "Conexão bem-sucedida!",
            description: `Conectado à loja: ${data.storeInfo?.name || integrations[0].storeUrl}`,
          });
        } else {
          toast({
            title: "Erro na conexão",
            description: data.error,
            variant: "destructive",
          });
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Configure as conexões com Shopify e WooCommerce
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Shopify</CardTitle>
                  <CardDescription className="text-sm">Plataforma de checkout</CardDescription>
                </div>
              </div>
              <Badge variant={getShopifyStatus().connected ? "default" : "destructive"} className="bg-accent self-start sm:self-center">
                {getShopifyStatus().connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Desconectado</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm break-all">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">WooCommerce</CardTitle>
                  <CardDescription className="text-sm">Vitrine de produtos</CardDescription>
                </div>
              </div>
              <Badge variant={getWooCommerceStatus().connected ? "default" : "destructive"} className="bg-accent self-start sm:self-center">
                {getWooCommerceStatus().connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Desconectado</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm break-all">
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
                    onClick={() => openEditModal('shopify')}
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
                onClick={() => testWithSavedCredentials('shopify')}
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
                    onClick={() => openEditModal('woocommerce')}
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

      {/* Modal para editar credenciais Shopify */}
      <Dialog open={editModal.shopify} onOpenChange={(open) => !open && closeEditModal('shopify')}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Credenciais Shopify</DialogTitle>
            <DialogDescription>
              Atualize as credenciais de acesso à sua loja Shopify
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-shopify-store-name">Nome da Loja</Label>
              <Input
                id="modal-shopify-store-name"
                placeholder="Minha Loja Shopify"
                value={modalData.shopifyStoreName}
                onChange={(e) => setModalData(prev => ({ ...prev, shopifyStoreName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-shopify-url">URL da Loja Shopify</Label>
              <Input
                id="modal-shopify-url"
                placeholder="https://minha-loja.myshopify.com"
                value={modalData.shopifyUrl}
                onChange={(e) => setModalData(prev => ({ ...prev, shopifyUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-shopify-token">Access Token</Label>
              <div className="relative">
                <Input
                  id="modal-shopify-token"
                  type={showSecrets.shopifyToken ? "text" : "password"}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={modalData.shopifyToken}
                  onChange={(e) => setModalData(prev => ({ ...prev, shopifyToken: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => toggleShowSecret('shopifyToken')}
                >
                  {showSecrets.shopifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeEditModal('shopify')}>
              Cancelar
            </Button>
            <Button onClick={() => saveFromModal('shopify')} disabled={isLoadingShopify}>
              {isLoadingShopify ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar credenciais WooCommerce */}
      <Dialog open={editModal.woocommerce} onOpenChange={(open) => !open && closeEditModal('woocommerce')}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Credenciais WooCommerce</DialogTitle>
            <DialogDescription>
              Atualize as credenciais da API REST do WooCommerce
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-woo-store-name">Nome da Loja</Label>
              <Input
                id="modal-woo-store-name"
                placeholder="Minha Loja WooCommerce"
                value={modalData.wooStoreName}
                onChange={(e) => setModalData(prev => ({ ...prev, wooStoreName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-woo-url">URL do WooCommerce</Label>
              <Input
                id="modal-woo-url"
                placeholder="https://meusite.com.br"
                value={modalData.wooUrl}
                onChange={(e) => setModalData(prev => ({ ...prev, wooUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-woo-key">Consumer Key</Label>
              <div className="relative">
                <Input
                  id="modal-woo-key"
                  type={showSecrets.wooKey ? "text" : "password"}
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={modalData.wooKey}
                  onChange={(e) => setModalData(prev => ({ ...prev, wooKey: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => toggleShowSecret('wooKey')}
                >
                  {showSecrets.wooKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-woo-secret">Consumer Secret</Label>
              <div className="relative">
                <Input
                  id="modal-woo-secret"
                  type={showSecrets.wooSecret ? "text" : "password"}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={modalData.wooSecret}
                  onChange={(e) => setModalData(prev => ({ ...prev, wooSecret: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => toggleShowSecret('wooSecret')}
                >
                  {showSecrets.wooSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeEditModal('woocommerce')}>
              Cancelar
            </Button>
            <Button onClick={() => saveFromModal('woocommerce')} disabled={isLoadingWooCommerce}>
              {isLoadingWooCommerce ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Integrations