import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff, Zap } from "lucide-react"
import heroImage from "@/assets/hero-stealth.jpg"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      navigate("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={heroImage} 
          alt="STEALTHIFY.AI Platform" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-foreground">STEALTHIFY</h1>
                <p className="text-accent font-semibold">.AI</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              Transforme réplicas em produtos aprovados pela Shopify
            </h2>
            <p className="text-muted-foreground text-lg">
              Camufle produtos automaticamente e mantenha o Shopify Payments funcionando sem riscos.
            </p>
            <div className="flex items-center gap-4 justify-center pt-4">
              <div className="flex items-center gap-2 text-accent">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">100% Automatizado</span>
              </div>
              <div className="flex items-center gap-2 text-accent">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Totalmente Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-stealth">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">STEALTHIFY</h1>
                <p className="text-accent text-sm font-semibold">.AI</p>
              </div>
            </div>
          </div>

          <Card className="shadow-card border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
              <CardDescription>
                Entre na sua conta para acessar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link 
                      to="/forgot-password" 
                      className="text-accent hover:text-accent-purple transition-colors"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link 
                    to="/register" 
                    className="text-accent hover:text-accent-purple transition-colors font-medium"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground">
              Plataforma confiada por mais de 1000+ empresários
            </p>
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <span>✓ Integração WooCommerce</span>
              <span>✓ Shopify Payments Seguro</span>
              <span>✓ Camuflagem Automática</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login