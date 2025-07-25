import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Calendar,
  ExternalLink
} from "lucide-react"

// Mock log data
const mockLogs = [
  {
    id: "log-001",
    timestamp: "2024-01-15 14:30:25",
    action: "product_import",
    status: "success",
    product: {
      originalName: "Tênis Nike Air Max Replica Premium",
      sku: "NIKE-AM-001",
      newName: "Sneaker Premium",
      shopifyId: "SP001"
    },
    details: "Produto importado e camuflado com sucesso",
    duration: "2.3s",
    source: "WooCommerce",
    target: "Shopify"
  },
  {
    id: "log-002", 
    timestamp: "2024-01-15 14:28:12",
    action: "image_camouflage",
    status: "success",
    product: {
      originalName: "Bolsa Louis Vuitton Inspired Collection",
      sku: "LV-BAG-002",
      newName: "Bolsa Elegante",
      shopifyId: "SP002"
    },
    details: "Imagem original substituída pela imagem camuflada",
    duration: "1.8s",
    source: "Sistema",
    target: "Shopify"
  },
  {
    id: "log-003",
    timestamp: "2024-01-15 14:25:45",
    action: "product_sync",
    status: "error",
    product: {
      originalName: "Relógio Rolex Style Premium",
      sku: "RLX-WATCH-003",
      newName: "Relógio Clássico",
      shopifyId: null
    },
    details: "Erro de autenticação: Token Shopify expirado",
    duration: "0.5s",
    source: "Sistema",
    target: "Shopify"
  },
  {
    id: "log-004",
    timestamp: "2024-01-15 14:22:30",
    action: "stock_update",
    status: "pending",
    product: {
      originalName: "Perfume Chanel Inspired Fragrance",
      sku: "CHANEL-PERF-004", 
      newName: "Fragância Premium",
      shopifyId: "SP004"
    },
    details: "Sincronização de estoque em andamento",
    duration: "15.2s",
    source: "WooCommerce",
    target: "Shopify"
  },
  {
    id: "log-005",
    timestamp: "2024-01-15 14:20:15",
    action: "product_import",
    status: "success",
    product: {
      originalName: "Óculos Ray-Ban Aviator Style",
      sku: "RB-AVIATOR-005",
      newName: "Óculos Moderno",
      shopifyId: "SP005"
    },
    details: "Produto importado com preço promocional aplicado",
    duration: "3.1s",
    source: "WooCommerce", 
    target: "Shopify"
  },
  {
    id: "log-006",
    timestamp: "2024-01-15 14:18:42",
    action: "title_camouflage",
    status: "warning",
    product: {
      originalName: "Sapato Gucci Inspired Luxury",
      sku: "GUCCI-SHOE-006",
      newName: "Calçado Social",
      shopifyId: "SP006"
    },
    details: "Título muito longo, foi truncado automaticamente",
    duration: "1.2s",
    source: "Sistema",
    target: "Shopify"
  }
]

type LogStatus = "all" | "success" | "error" | "pending" | "warning"
type LogAction = "all" | "product_import" | "image_camouflage" | "product_sync" | "stock_update" | "title_camouflage"

const Logs = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<LogStatus>("all")
  const [actionFilter, setActionFilter] = useState<LogAction>("all")
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = 
      log.product.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesAction = actionFilter === "all" || log.action === actionFilter

    return matchesSearch && matchesStatus && matchesAction
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-accent" />
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "pending":
        return <Clock className="w-4 h-4 text-primary-glow animate-pulse" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "bg-accent/20 text-accent border-accent/30",
      error: "bg-destructive/20 text-destructive border-destructive/30",
      pending: "bg-primary-glow/20 text-primary-glow border-primary-glow/30",
      warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    }
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || ""}>
        {status === "success" && "Sucesso"}
        {status === "error" && "Erro"}
        {status === "pending" && "Pendente"}
        {status === "warning" && "Aviso"}
      </Badge>
    )
  }

  const getActionLabel = (action: string) => {
    const labels = {
      product_import: "Importação",
      image_camouflage: "Camuflagem Imagem",
      product_sync: "Sincronização",
      stock_update: "Atualização Estoque",
      title_camouflage: "Camuflagem Título"
    }
    return labels[action as keyof typeof labels] || action
  }

  const exportLogs = () => {
    const dataToExport = selectedLogs.length > 0 
      ? mockLogs.filter(log => selectedLogs.includes(log.id))
      : filteredLogs

    const csvContent = [
      ["Timestamp", "Ação", "Status", "SKU", "Produto Original", "Produto Camuflado", "Detalhes", "Duração"],
      ...dataToExport.map(log => [
        log.timestamp,
        getActionLabel(log.action),
        log.status,
        log.product.sku,
        log.product.originalName,
        log.product.newName,
        log.details,
        log.duration
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `stealthify-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Logs exportados!",
      description: `${dataToExport.length} registros exportados com sucesso.`,
    })
  }

  const refreshLogs = () => {
    toast({
      title: "Atualizando logs...",
      description: "Carregando registros mais recentes.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs do Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Histórico de operações e monitoramento da plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refreshLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportLogs} className="bg-gradient-primary hover:shadow-glow">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtre os logs por status, ação ou busque por termos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: LogStatus) => setStatusFilter(value)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={(value: LogAction) => setActionFilter(value)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ações</SelectItem>
                <SelectItem value="product_import">Importação</SelectItem>
                <SelectItem value="image_camouflage">Camuflagem Imagem</SelectItem>
                <SelectItem value="product_sync">Sincronização</SelectItem>
                <SelectItem value="stock_update">Atualização Estoque</SelectItem>
                <SelectItem value="title_camouflage">Camuflagem Título</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredLogs.length} registro(s)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-glow" />
            Registros de Atividade
          </CardTitle>
          <CardDescription>
            {filteredLogs.length} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className="p-4 rounded-lg border border-border bg-background/30 hover:border-accent/50 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(log.status)}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">
                            {getActionLabel(log.action)}
                          </h3>
                          {getStatusBadge(log.status)}
                          <span className="text-xs text-muted-foreground">
                            {log.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{log.timestamp}</span>
                          <span>SKU: {log.product.sku}</span>
                          {log.product.shopifyId && (
                            <span>Shopify ID: {log.product.shopifyId}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{log.source}</span>
                          <ExternalLink className="w-3 h-3" />
                          <span>{log.target}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Original: </span>
                          <span className="text-foreground">{log.product.originalName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Camuflado: </span>
                          <span className="text-accent">{log.product.newName}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Detalhes: </span>
                        <span className="text-foreground">{log.details}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou aguarde novas operações do sistema
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockLogs.filter(log => log.status === "success").length}
                </p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockLogs.filter(log => log.status === "error").length}
                </p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-glow/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-glow" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockLogs.filter(log => log.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockLogs.filter(log => log.status === "warning").length}
                </p>
                <p className="text-sm text-muted-foreground">Avisos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Logs