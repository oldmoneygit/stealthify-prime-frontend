import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
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
  RefreshCw
} from "lucide-react"

// Mock products from WooCommerce
const mockProducts = [
  {
    id: 1,
    name: "Tênis Nike Air Max Replica Premium",
    sku: "NIKE-AM-001",
    price: 299.90,
    salePrice: 249.90,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop",
    stock: 25,
    category: "Calçados",
    status: "active"
  },
  {
    id: 2,
    name: "Bolsa Louis Vuitton Inspired Collection",
    sku: "LV-BAG-002",
    price: 799.90,
    salePrice: null,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop",
    stock: 12,
    category: "Acessórios",
    status: "active"
  },
  {
    id: 3,
    name: "Relógio Rolex Style Premium",
    sku: "RLX-WATCH-003",
    price: 1299.90,
    salePrice: 999.90,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop",
    stock: 8,
    category: "Relógios",
    status: "active"
  },
  {
    id: 4,
    name: "Perfume Chanel Inspired Fragrance",
    sku: "CHANEL-PERF-004",
    price: 189.90,
    salePrice: 149.90,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop",
    stock: 30,
    category: "Perfumes",
    status: "active"
  },
  {
    id: 5,
    name: "Óculos Ray-Ban Aviator Style",
    sku: "RB-AVIATOR-005",
    price: 299.90,
    salePrice: 199.90,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop",
    stock: 15,
    category: "Óculos",
    status: "active"
  }
]

const Importer = () => {
  const { toast } = useToast()
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [genericTitle, setGenericTitle] = useState("Produto Premium")
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [camouflageImage, setCamouflageImage] = useState<File | null>(null)

  const filteredProducts = mockProducts.filter(product =>
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

    // Simulate import process
    const selectedProductsData = mockProducts.filter(p => selectedProducts.includes(p.id))
    
    for (let i = 0; i < selectedProductsData.length; i++) {
      const product = selectedProductsData[i]
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const progress = ((i + 1) / selectedProductsData.length) * 100
      setImportProgress(progress)

      toast({
        title: `Produto importado: ${product.sku}`,
        description: `${genericTitle} → ${product.sku} importado com sucesso!`,
      })
    }

    setIsImporting(false)
    setSelectedProducts([])
    setCamouflageImage(null)
    setGenericTitle("Produto Premium")

    toast({
      title: "Importação concluída!",
      description: `${selectedProductsData.length} produto(s) importado(s) para a Shopify.`,
    })
  }

  const refreshProducts = () => {
    toast({
      title: "Atualizando produtos...",
      description: "Sincronizando com WooCommerce.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importador de Produtos</h1>
          <p className="text-muted-foreground mt-2">
            Selecione produtos do WooCommerce para importar e camuflar na Shopify
          </p>
        </div>
        <Button 
          onClick={refreshProducts}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar Lista
        </Button>
      </div>

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
              <Label htmlFor="camouflage-image">Imagem Camuflada</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
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
                                R$ {product.price.toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold text-accent">
                              R$ {(product.salePrice || product.price).toFixed(2)}
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

                    <Button variant="ghost" size="sm">
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
                  R$ {mockProducts
                    .filter(p => selectedProducts.includes(p.id))
                    .reduce((sum, p) => sum + (p.salePrice || p.price), 0)
                    .toFixed(2)}
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