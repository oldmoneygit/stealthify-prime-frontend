import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
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
  const [showSecrets, setShowSecrets] = useState({
    shopifyToken: false,
    wooKey: false,
    wooSecret: false
  })

  // Mock integration status
  const [integrations, setIntegrations] = useState({
    shopify: {
      connected: true,
      url: "https://minha-loja.myshopify.com",
      token: "shpat_xxxxx...xxxxx",
      lastSync: "há 2 minutos"
    },
    woocommerce: {
      connected: true,
      url: "https://meusite.com.br",
      key: "ck_xxxxx...xxxxx",
      secret: "cs_xxxxx...xxxxx",
      lastSync: "há 5 minutos"
    }
  })

  const [formData, setFormData] = useState({
    shopifyUrl: integrations.shopify.url,
    shopifyToken: integrations.shopify.token,
    wooUrl: integrations.woocommerce.url,
    wooKey: integrations.woocommerce.key,
    wooSecret: integrations.woocommerce.secret
  })

  const handleSave = (platform: 'shopify' | 'woocommerce') => {
    if (platform === 'shopify') {
      setIntegrations(prev => ({
        ...prev,
        shopify: {
          ...prev.shopify,
          url: formData.shopifyUrl,
          token: formData.shopifyToken,
          connected: true,
          lastSync: "agora"
        }
      }))
    } else {
      setIntegrations(prev => ({
        ...prev,
        woocommerce: {
          ...prev.woocommerce,
          url: formData.wooUrl,
          key: formData.wooKey,
          secret: formData.wooSecret,
          connected: true,
          lastSync: "agora"
        }
      }))
    }

    toast({
      title: "Integração salva!",
      description: `Credenciais do ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'} atualizadas com sucesso.`,
    })
  }

  const testConnection = async (platform: 'shopify' | 'woocommerce') => {
    toast({
      title: "Testando conexão...",
      description: `Verificando credenciais do ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'}`,
    })

    // Simulate API test
    setTimeout(() => {
      toast({
        title: "Conexão bem-sucedida!",
        description: `${platform === 'shopify' ? 'Shopify' : 'WooCommerce'} conectado e funcionando.`,
      })
    }, 2000)
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
              <Badge variant={integrations.shopify.connected ? "default" : "destructive"} className="bg-accent">
                {integrations.shopify.connected ? (
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
              <span className="text-foreground">{integrations.shopify.url}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Última sincronização: </span>
              <span className="text-accent">{integrations.shopify.lastSync}</span>
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
              <Badge variant={integrations.woocommerce.connected ? "default" : "destructive"} className="bg-accent">
                {integrations.woocommerce.connected ? (
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
              <span className="text-foreground">{integrations.woocommerce.url}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Última sincronização: </span>
              <span className="text-accent">{integrations.woocommerce.lastSync}</span>
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
          <div className="space-y-4">
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

          <Separator />

          <div className="flex gap-3">
            <Button 
              onClick={() => handleSave('shopify')}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Zap className="w-4 h-4 mr-2" />
              Salvar Shopify
            </Button>
            <Button 
              variant="outline"
              onClick={() => testConnection('shopify')}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
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
          <div className="space-y-4">
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

          <Separator />

          <div className="flex gap-3">
            <Button 
              onClick={() => handleSave('woocommerce')}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Zap className="w-4 h-4 mr-2" />
              Salvar WooCommerce
            </Button>
            <Button 
              variant="outline"
              onClick={() => testConnection('woocommerce')}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
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