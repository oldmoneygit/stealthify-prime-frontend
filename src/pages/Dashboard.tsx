import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  ArrowUpRight
} from "lucide-react"

// Mock data for dashboard
const stats = [
  {
    title: "Produtos Importados",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "text-accent"
  },
  {
    title: "Taxa de Sucesso",
    value: "98.7%",
    change: "+2.1%",
    trend: "up", 
    icon: CheckCircle,
    color: "text-accent"
  },
  {
    title: "Processamentos Hoje",
    value: "156",
    change: "+24%",
    trend: "up",
    icon: Activity,
    color: "text-primary-glow"
  },
  {
    title: "Alertas Ativos",
    value: "3",
    change: "-2",
    trend: "down",
    icon: AlertTriangle,
    color: "text-destructive"
  }
]

const recentActivity = [
  {
    id: 1,
    action: "Produto importado",
    product: "Sneaker Premium #1247",
    status: "success",
    time: "há 2 minutos",
    details: "WooCommerce → Shopify"
  },
  {
    id: 2,
    action: "Imagem camuflada",
    product: "Bolsa Designer #892",
    status: "success", 
    time: "há 5 minutos",
    details: "Título alterado automaticamente"
  },
  {
    id: 3,
    action: "Sincronização estoque",
    product: "Relógio Luxury #445",
    status: "pending",
    time: "há 8 minutos",
    details: "Aguardando confirmação Shopify"
  },
  {
    id: 4,
    action: "Erro na importação",
    product: "Tênis Sport #223",
    status: "error",
    time: "há 15 minutos",
    details: "Token Shopify expirado"
  }
]

const Dashboard = () => {
  const [systemHealth] = useState(97)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral da sua operação STEALTHIFY.AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Sistema Online</span>
          </div>
          <Button className="bg-gradient-primary hover:shadow-glow">
            <Zap className="w-4 h-4 mr-2" />
            Importar Agora
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-accent' : 'text-destructive'}`} />
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs último mês</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-stealth flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card className="lg:col-span-1 bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Saúde do Sistema
            </CardTitle>
            <CardDescription>
              Performance geral da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span className="text-accent font-medium">{systemHealth}%</span>
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  API WooCommerce
                </span>
                <span className="text-accent">Online</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  API Shopify
                </span>
                <span className="text-accent">Online</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  Cache Sistema
                </span>
                <span className="text-destructive">Limpeza necessária</span>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Otimizar Sistema
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-glow" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimas operações da plataforma
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'success' ? 'bg-accent/20 text-accent' :
                    activity.status === 'pending' ? 'bg-primary-glow/20 text-primary-glow' :
                    'bg-destructive/20 text-destructive'
                  }`}>
                    {activity.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                     activity.status === 'pending' ? <Clock className="w-4 h-4" /> :
                     <AlertTriangle className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.product}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-accent/10 hover:border-accent">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">Sincronizar Produtos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-accent/10 hover:border-accent">
              <Package className="w-5 h-5" />
              <span className="text-sm">Verificar Estoque</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-accent/10 hover:border-accent">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Executar Backup</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-accent/10 hover:border-accent">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard