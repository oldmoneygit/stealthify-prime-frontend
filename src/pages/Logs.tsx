import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLog, LogLevel } from "@/contexts/LogContext"
import { 
  Terminal, 
  Copy, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Bug,
  Clock,
  RefreshCw,
  Download
} from "lucide-react"

const Logs = () => {
  const { toast } = useToast()
  const { logs, clearLogs, exportLogs } = useLog()
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL")
  const [sourceFilter, setSourceFilter] = useState("ALL")

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLevel = levelFilter === "ALL" || log.level === levelFilter
    const matchesSource = sourceFilter === "ALL" || log.source === sourceFilter

    return matchesSearch && matchesLevel && matchesSource
  })

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "SUCCESS":
        return <CheckCircle className="w-3 h-3 text-emerald-500" />
      case "ERROR":
        return <XCircle className="w-3 h-3 text-red-500" />
      case "WARNING":
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />
      case "INFO":
        return <Info className="w-3 h-3 text-blue-500" />
      case "DEBUG":
        return <Bug className="w-3 h-3 text-purple-500" />
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getLevelColors = (level: LogLevel) => {
    switch (level) {
      case "SUCCESS":
        return "text-emerald-400 bg-emerald-950/50 border-emerald-800/50"
      case "ERROR":
        return "text-red-400 bg-red-950/50 border-red-800/50"
      case "WARNING":
        return "text-yellow-400 bg-yellow-950/50 border-yellow-800/50"
      case "INFO":
        return "text-blue-400 bg-blue-950/50 border-blue-800/50"
      case "DEBUG":
        return "text-purple-400 bg-purple-950/50 border-purple-800/50"
      default:
        return "text-muted-foreground bg-muted/50 border-border"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: "Log copiado para a área de transferência.",
      })
    })
  }

  const copyAllLogs = () => {
    const allLogsText = exportLogs()
    copyToClipboard(allLogsText)
  }

  const handleClearLogs = () => {
    clearLogs()
    toast({
      title: "Logs limpos",
      description: "Todos os logs foram removidos do sistema.",
      variant: "destructive"
    })
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(date)
  }

  const uniqueSources = Array.from(new Set(logs.map(log => log.source))).sort()

  const getLogCounts = () => {
    return {
      total: logs.length,
      success: logs.filter(log => log.level === "SUCCESS").length,
      error: logs.filter(log => log.level === "ERROR").length,
      warning: logs.filter(log => log.level === "WARNING").length,
      info: logs.filter(log => log.level === "INFO").length,
      debug: logs.filter(log => log.level === "DEBUG").length
    }
  }

  const counts = getLogCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Terminal className="w-8 h-8 text-primary" />
            Sistema de Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor em tempo real de todas as operações do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={copyAllLogs} disabled={logs.length === 0}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Todos
          </Button>
          <Button variant="outline" onClick={handleClearLogs} disabled={logs.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{counts.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-950/30 border-emerald-800/50">
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-400">{counts.success}</p>
              <p className="text-xs text-emerald-300/70">Success</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-950/30 border-red-800/50">
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-red-400">{counts.error}</p>
              <p className="text-xs text-red-300/70">Error</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-950/30 border-yellow-800/50">
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-400">{counts.warning}</p>
              <p className="text-xs text-yellow-300/70">Warning</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-950/30 border-blue-800/50">
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400">{counts.info}</p>
              <p className="text-xs text-blue-300/70">Info</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-950/30 border-purple-800/50">
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-purple-400">{counts.debug}</p>
              <p className="text-xs text-purple-300/70">Debug</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
              />
            </div>

            <Select value={levelFilter} onValueChange={(value: LogLevel | "ALL") => setLevelFilter(value)}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os níveis</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as origens</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{filteredLogs.length} log(s) encontrado(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terminal-style Log Display */}
      <Card className="bg-gray-950/95 border-gray-800/50 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-400 font-mono">
              <Terminal className="w-5 h-5" />
              stealthify@system:~$ tail -f /var/log/stealthify.log
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-black/80 rounded-b-lg max-h-96 overflow-y-auto font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum log encontrado</p>
                <p className="text-xs mt-1">Aguardando eventos do sistema...</p>
              </div>
            ) : (
              <div className="p-4 space-y-1">
                {filteredLogs.map((log, index) => (
                  <div 
                    key={log.id}
                    className="group hover:bg-gray-800/30 rounded px-2 py-1 transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getLevelIcon(log.level)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0 font-mono ${getLevelColors(log.level)}`}
                        >
                          {log.level}
                        </Badge>
                      </div>
                      <span className="text-blue-400 text-xs">[{log.source}]</span>
                      <span className="text-gray-300 flex-1">{log.message}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => copyToClipboard(`[${formatTimestamp(log.timestamp)}] [${log.level}] [${log.source}] ${log.message}${log.details ? `\nDetalhes: ${JSON.stringify(log.details, null, 2)}` : ''}`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {log.details && (
                      <div className="ml-6 mt-1 text-xs text-gray-400 bg-gray-900/50 rounded p-2 border-l-2 border-gray-600">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Logs