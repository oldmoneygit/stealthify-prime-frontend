import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  HelpCircle, 
  MessageSquare, 
  Phone,
  Mail,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Video,
  FileText,
  Send,
  Search
} from "lucide-react"

const Support = () => {
  const { toast } = useToast()
  const [supportForm, setSupportForm] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "medium"
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Mock support tickets
  const supportTickets = [
    {
      id: "SUP-001",
      subject: "Erro na importação de produtos",
      category: "Técnico",
      status: "open",
      priority: "high",
      created: "2024-01-15 14:30",
      lastUpdate: "2024-01-15 16:45",
      messages: 3
    },
    {
      id: "SUP-002",
      subject: "Dúvida sobre configuração Shopify",
      category: "Configuração",
      status: "pending",
      priority: "medium",
      created: "2024-01-14 09:15",
      lastUpdate: "2024-01-14 12:20",
      messages: 1
    },
    {
      id: "SUP-003",
      subject: "Solicitação de nova funcionalidade",
      category: "Feature Request",
      status: "resolved",
      priority: "low",
      created: "2024-01-12 16:00",
      lastUpdate: "2024-01-13 10:30",
      messages: 5
    }
  ]

  // FAQ items
  const faqItems = [
    {
      category: "Configuração",
      items: [
        {
          question: "Como configurar as integrações com Shopify e WooCommerce?",
          answer: "Acesse a seção 'Integrações' no menu lateral. Para Shopify, você precisará criar um Private App e obter o Access Token. Para WooCommerce, gere as chaves da API REST nas configurações avançadas."
        },
        {
          question: "Quais permissões são necessárias no Shopify?",
          answer: "O Private App precisa das seguintes permissões: Products (read/write), Inventory (read/write), e Files (read/write) para upload de imagens."
        }
      ]
    },
    {
      category: "Importação",
      items: [
        {
          question: "Como funciona a camuflagem de produtos?",
          answer: "A plataforma substitui automaticamente o título original por um título genérico e troca a imagem do produto por uma imagem neutra, mantendo SKU, preço e estoque intactos."
        },
        {
          question: "Posso importar produtos em lote?",
          answer: "Sim! Você pode selecionar múltiplos produtos na página do Importador e fazer a importação em lote. O sistema processará todos os produtos selecionados automaticamente."
        }
      ]
    },
    {
      category: "Técnico",
      items: [
        {
          question: "O que fazer se a importação falhar?",
          answer: "Verifique na seção 'Logs' o motivo da falha. Geralmente, problemas ocorrem por tokens expirados ou produtos com informações incompletas."
        },
        {
          question: "Como monitorar o status das operações?",
          answer: "Use a seção 'Logs' para acompanhar todas as operações em tempo real. Você pode filtrar por status e exportar relatórios."
        }
      ]
    }
  ]

  const filteredFAQ = faqItems.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  const handleSubmitTicket = () => {
    if (!supportForm.category || !supportForm.subject || !supportForm.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar o ticket.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Ticket criado com sucesso!",
      description: `Seu ticket SUP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')} foi criado. Responderemos em breve.`,
    })

    setSupportForm({
      category: "",
      subject: "",
      description: "",
      priority: "medium"
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "bg-primary-glow/20 text-primary-glow border-primary-glow/30",
      pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      resolved: "bg-accent/20 text-accent border-accent/30"
    }
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || ""}>
        {status === "open" && "Aberto"}
        {status === "pending" && "Pendente"}
        {status === "resolved" && "Resolvido"}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      low: "bg-accent/20 text-accent border-accent/30"
    }
    
    return (
      <Badge variant="outline" className={variants[priority as keyof typeof variants] || ""}>
        {priority === "high" && "Alta"}
        {priority === "medium" && "Média"}
        {priority === "low" && "Baixa"}
      </Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Central de Suporte</h1>
        <p className="text-muted-foreground mt-2">
          Tire suas dúvidas e obtenha ajuda com a plataforma STEALTHIFY.AI
        </p>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Chat Online</h3>
                <p className="text-sm text-muted-foreground">Resposta imediata</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-glow/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-glow" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground">suporte@stealthify.ai</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/40 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Telefone</h3>
                <p className="text-sm text-muted-foreground">+55 11 9999-9999</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              Ligar Agora
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Ticket */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              Criar Ticket de Suporte
            </CardTitle>
            <CardDescription>
              Descreva seu problema e nossa equipe entrará em contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={supportForm.category} onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Problema Técnico</SelectItem>
                    <SelectItem value="configuration">Configuração</SelectItem>
                    <SelectItem value="billing">Faturamento</SelectItem>
                    <SelectItem value="feature">Solicitação de Funcionalidade</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={supportForm.priority} onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={supportForm.subject}
                onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Descreva resumidamente o problema"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição Detalhada</Label>
              <Textarea
                value={supportForm.description}
                onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o problema em detalhes, incluindo passos para reproduzi-lo..."
                className="bg-background/50 min-h-[120px]"
              />
            </div>

            <Button onClick={handleSubmitTicket} className="w-full bg-gradient-primary hover:shadow-glow">
              <Send className="w-4 h-4 mr-2" />
              Criar Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-glow" />
              Meus Tickets
            </CardTitle>
            <CardDescription>
              Acompanhe o status dos seus tickets de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-lg border border-border bg-background/30 hover:border-accent/50 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{ticket.subject}</h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>#{ticket.id}</span>
                        <span>{ticket.category}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.messages}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Criado: {ticket.created}</span>
                    <span>Atualizado: {ticket.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>

            {supportTickets.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum ticket encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie seu primeiro ticket de suporte
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Encontre respostas rápidas para dúvidas comuns
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar nas FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredFAQ.map((category) => (
              <div key={category.category}>
                <h3 className="font-medium text-foreground mb-3 border-b border-border pb-1">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.items.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-foreground">{item.question}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredFAQ.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma FAQ encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar sua busca ou entre em contato conosco
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Tutoriais em Vídeo</h3>
                <p className="text-sm text-muted-foreground">Aprenda assistindo</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Assistir Vídeos
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-glow/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-glow" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Documentação</h3>
                <p className="text-sm text-muted-foreground">Guias completos</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Documentação
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow/20 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/40 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Comunidade</h3>
                <p className="text-sm text-muted-foreground">Fórum de usuários</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Fórum
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Support