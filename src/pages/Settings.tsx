import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone
} from "lucide-react"

const Settings = () => {
  const { toast } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // User settings state
  const [userSettings, setUserSettings] = useState({
    name: "João Silva",
    email: "joao@empresa.com",
    phone: "+55 11 99999-9999",
    company: "Minha Empresa LTDA",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // App settings state
  const [appSettings, setAppSettings] = useState({
    theme: "dark",
    language: "pt",
    notifications: {
      email: true,
      push: true,
      importSuccess: true,
      importError: true,
      systemUpdates: false
    },
    privacy: {
      analytics: true,
      crashReports: true
    },
    automation: {
      autoImport: false,
      autoSync: true,
      backupFrequency: "daily"
    }
  })

  const handleUserUpdate = () => {
    // Validate password if provided
    if (userSettings.newPassword && userSettings.newPassword !== userSettings.confirmPassword) {
      toast({
        title: "Erro na senha",
        description: "As senhas não coincidem.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    })
  }

  const handleAppUpdate = () => {
    toast({
      title: "Configurações salvas!",
      description: "Preferências da aplicação atualizadas.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Conta excluída",
      description: "Esta ação não pode ser desfeita.",
      variant: "destructive"
    })
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setAppSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updatePrivacySetting = (key: string, value: boolean) => {
    setAppSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const updateAutomationSetting = (key: string, value: boolean | string) => {
    setAppSettings(prev => ({
      ...prev,
      automation: {
        ...prev.automation,
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile */}
        <Card className="lg:col-span-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={userSettings.company}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={userSettings.phone}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Alterar Senha</h3>
              
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={userSettings.currentPassword}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-background/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={userSettings.newPassword}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={userSettings.confirmPassword}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleUserUpdate} className="bg-gradient-primary hover:shadow-glow">
                <Save className="w-4 h-4 mr-2" />
                Salvar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" />
              Preferências
            </CardTitle>
            <CardDescription>
              Configure aparência e comportamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={appSettings.theme} onValueChange={(value) => setAppSettings(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={appSettings.language} onValueChange={(value) => setAppSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-xs text-muted-foreground">Receber notificações por email</p>
                  </div>
                  <Switch
                    checked={appSettings.notifications.email}
                    onCheckedChange={(value) => updateNotificationSetting('email', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Importação Bem-sucedida</Label>
                    <p className="text-xs text-muted-foreground">Avisar quando produtos forem importados</p>
                  </div>
                  <Switch
                    checked={appSettings.notifications.importSuccess}
                    onCheckedChange={(value) => updateNotificationSetting('importSuccess', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Erros de Importação</Label>
                    <p className="text-xs text-muted-foreground">Avisar sobre falhas nas operações</p>
                  </div>
                  <Switch
                    checked={appSettings.notifications.importError}
                    onCheckedChange={(value) => updateNotificationSetting('importError', value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Automação
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Sincronização Automática</Label>
                    <p className="text-xs text-muted-foreground">Manter produtos sincronizados</p>
                  </div>
                  <Switch
                    checked={appSettings.automation.autoSync}
                    onCheckedChange={(value) => updateAutomationSetting('autoSync', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequência de Backup</Label>
                  <Select value={appSettings.automation.backupFrequency} onValueChange={(value) => updateAutomationSetting('backupFrequency', value)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={handleAppUpdate} variant="outline" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Preferências
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-card/95 backdrop-blur-sm border-destructive/20 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h3 className="font-medium text-destructive mb-2">Excluir Conta</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Todos os seus dados, configurações e histórico serão permanentemente removidos. 
                Esta ação não pode ser desfeita.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Conta Permanentemente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings