import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  Upload, 
  Download, 
  Package, 
  Eye,
  Zap,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Image,
  Filter,
  Search,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react"

// Product interface for WooCommerce products
interface WooProduct {
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
  priceInBRL?: number;
  salePriceInBRL?: number;
}

// Store info interface
interface StoreInfo {
  name: string;
  url: string;
  totalProducts: number;
  apiUsed: string;
  currency: string;
}

const Importer = () => {
  const { toast } = useToast()
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [genericTitle, setGenericTitle] = useState("Produto Premium")
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [camouflageImage, setCamouflageImage] = useState<File | null>(null)
  
  // Real WooCommerce product states
  const [products, setProducts] = useState<WooProduct[]>([])
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [hasWooCommerceConnection, setHasWooCommerceConnection] = useState<boolean | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number>(1)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('MXN')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsPerPage = 250

  // Load WooCommerce products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (page = 1) => {
    setIsLoadingProducts(true)
    
    try {
      console.log('Calling woocommerce-integration with:', { action: 'fetch_products', page, per_page: productsPerPage })
      const { data, error } = await supabase.functions.invoke('woocommerce-integration', {
        body: { 
          action: 'fetch_products',
          page: page,
          per_page: productsPerPage
        }
      })

      console.log('Response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        setHasWooCommerceConnection(false)
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao WooCommerce: " + error.message,
          variant: "destructive"
        })
        return
      }

      if (data.success) {
        // Set currency from store info or default to MXN
        const storeCurrency = data.storeInfo.currency || 'MXN'
        setSelectedCurrency(storeCurrency)
        
        // Get exchange rate if currency is not BRL
        if (storeCurrency !== 'BRL') {
          await fetchExchangeRate(storeCurrency)
        }
        
        setProducts(data.products)
        setStoreInfo(data.storeInfo)
        setTotalProducts(data.storeInfo.totalProducts || data.products.length)
        setCurrentPage(page)
        setHasWooCommerceConnection(true)
        
        console.log('Total products received:', data.storeInfo.totalProducts)
        console.log('Products length:', data.products.length)
        console.log('Total pages calculated:', Math.ceil((data.storeInfo.totalProducts || data.products.length) / productsPerPage))
        
        toast({
          title: "Produtos carregados!",
          description: `${data.products.length} produtos encontrados (página ${page} de ${Math.ceil((data.storeInfo.totalProducts || data.products.length) / productsPerPage)})`,
        })
      } else {
        setHasWooCommerceConnection(false)
        toast({
          title: "Nenhuma integração encontrada",
          description: data.error || "Configure uma integração WooCommerce primeiro.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setHasWooCommerceConnection(false)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar produtos.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCamouflageImage(file)
      toast({
        title: "Imagem carregada!",
        description: `${file.name} será usada como imagem camuflada.`,
      })
    }
  }

  const handleImport = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para importar.",
        variant: "destructive"
      })
      return
    }

    if (!camouflageImage) {
      toast({
        title: "Imagem necessária",
        description: "Faça upload de uma imagem camuflada para continuar.",
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    try {
      // Get selected products data from real products
      const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
      
      // Convert image to base64
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(camouflageImage!)
      })
      
      for (let i = 0; i < selectedProductsData.length; i++) {
        const product = selectedProductsData[i]
        
        try {
          // Import product to Shopify
          console.log('Importing product to Shopify:', product.sku)
          const { data, error } = await supabase.functions.invoke('shopify-integration', {
            body: { 
              action: 'import_product',
              product: {
                ...product,
                camouflageTitle: genericTitle,
                camouflageImage: imageBase64
              }
            }
          })

          console.log('Shopify response:', data, error)

          if (error) {
            throw new Error(`Erro ao importar ${product.sku}: ${error.message}`)
          }

          // Handle demo mode (when no real Shopify integration is configured)
          if (data?.demo) {
            console.log('Demo mode - simulating successful import')
          } else if (!data?.success) {
            throw new Error(`Erro ao importar ${product.sku}: ${data?.error || 'Erro desconhecido'}`)
          }
          
          const progress = ((i + 1) / selectedProductsData.length) * 100
          setImportProgress(progress)

          toast({
            title: `Produto importado: ${product.sku}`,
            description: `${genericTitle} → ${product.sku} importado com sucesso!`,
          })
        } catch (productError) {
          console.error(`Error importing product ${product.sku}:`, productError)
          toast({
            title: `Erro ao importar: ${product.sku}`,
            description: productError instanceof Error ? productError.message : "Erro desconhecido",
            variant: "destructive"
          })
        }
      }

      setIsImporting(false)
      setSelectedProducts([])
      setCamouflageImage(null)
      setGenericTitle("Produto Premium")

      toast({
        title: "Importação concluída!",
        description: `${selectedProductsData.length} produto(s) importado(s) para a Shopify.`,
      })
    } catch (error) {
      console.error('Import error:', error)
      setIsImporting(false)
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const fetchExchangeRate = async (fromCurrency: string) => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      setExchangeRate(data.rates.BRL || 1)
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      setExchangeRate(1)
    }
  }

  const currencies = [
    { code: 'MXN', symbol: 'MX$', name: 'Peso Mexicano' },
    { code: 'ARS', symbol: 'AR$', name: 'Peso Argentino' },
    { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
    { code: 'USD', symbol: '$', name: 'Dólar Americano' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'Libra Esterlina' }
  ]

  const formatPrice = (price: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency)
    const symbol = currencyData?.symbol || currency
    const priceInBRL = currency !== 'BRL' ? price * exchangeRate : price
    
    if (currency === 'BRL') {
      return `${symbol} ${price.toFixed(2)}`
    }
    
    return `${symbol} ${price.toFixed(2)} ~ R$ ${priceInBRL.toFixed(2)}`
  }

  const handleViewProduct = (permalink: string) => {
    window.open(permalink, '_blank', 'noopener,noreferrer')
  }

  const refreshProducts = async () => {
    await fetchProducts(currentPage)
  }

  const handlePageChange = (page: number) => {
    fetchProducts(page)
  }

  const totalPages = totalProducts > 0 ? Math.ceil(totalProducts / productsPerPage) : 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importador de Produtos</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Selecione produtos do WooCommerce para importar e camuflar na Shopify
            </p>
            {storeInfo && (
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">{storeInfo.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshProducts}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoadingProducts}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
            {isLoadingProducts ? 'Carregando...' : 'Atualizar Lista'}
          </Button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {hasWooCommerceConnection === false && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-medium text-destructive">WooCommerce não conectado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure uma integração WooCommerce na seção de Integrações para importar produtos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingProducts && hasWooCommerceConnection === null && (
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Carregando produtos...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Conectando ao WooCommerce e buscando produtos disponíveis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Configuração
            </CardTitle>
            <CardDescription>
              Configure a camuflagem dos produtos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="generic-title">Título Genérico</Label>
              <Input
                id="generic-title"
                placeholder="Ex: Produto Premium"
                value={genericTitle}
                onChange={(e) => setGenericTitle(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Este título substituirá os nomes originais na Shopify
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency-select">Moeda dos Produtos</Label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value)
                  if (e.target.value !== 'BRL') {
                    fetchExchangeRate(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-foreground"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Moeda utilizada para exibir os preços dos produtos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="camouflage-image">Imagem Camuflada</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center relative">
                {camouflageImage ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-accent mx-auto" />
                    <p className="text-sm font-medium">{camouflageImage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(camouflageImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Clique para fazer upload da imagem
                    </p>
                  </div>
                )}
                <input
                  id="camouflage-image"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta imagem substituirá todas as imagens originais
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Produtos Selecionados</span>
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  {selectedProducts.length}
                </Badge>
              </div>
              <Button 
                onClick={handleImport}
                disabled={isImporting || selectedProducts.length === 0}
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                {isImporting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Importando...
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Importar para Shopify
                  </>
                )}
              </Button>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="lg:col-span-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-glow" />
                  Produtos WooCommerce
                </CardTitle>
                <CardDescription>
                  {filteredProducts.length} produtos encontrados
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64 bg-background/50"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="whitespace-nowrap"
                >
                  {selectedProducts.length === filteredProducts.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    selectedProducts.includes(product.id) 
                      ? "border-accent bg-accent/10 shadow-accent/20" 
                      : "border-border bg-background/30 hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    
                    <div className="flex-shrink-0">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-grow">
                          <h3 className="font-medium text-foreground line-clamp-1">{product.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-2">
                            {product.salePrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price, selectedCurrency)}
                              </span>
                            )}
                            <span className="font-bold text-accent">
                              {formatPrice(product.salePrice || product.price, selectedCurrency)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {product.stock} em estoque
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProduct(product.permalink)}
                      title="Ver produto na loja"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar os filtros ou verificar a conexão com o WooCommerce
                </p>
              </div>
            )}

            {/* Pagination */}
            {hasWooCommerceConnection && totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Página {currentPage} de {totalPages}</span>
                  <span>•</span>
                  <span>{totalProducts} produtos total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingProducts}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={isLoadingProducts}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoadingProducts}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Summary */}
      {selectedProducts.length > 0 && (
        <Card className="bg-card/95 backdrop-blur-sm border-accent/20 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {selectedProducts.length} produto(s) pronto(s) para importação
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Produtos serão camuflados como "{genericTitle}" na Shopify
                  </p>
                </div>
              </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-accent">
                    {formatPrice(
                      products
                        .filter(p => selectedProducts.includes(p.id))
                        .reduce((sum, p) => sum + (p.salePrice || p.price), 0),
                      selectedCurrency
                    )}
                  </p>
                 <p className="text-sm text-muted-foreground">Valor total</p>
               </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Importer