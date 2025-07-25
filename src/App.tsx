import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import Importer from "./pages/Importer";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component for authenticated routes
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between h-full px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full"></div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AuthLayout><Dashboard /></AuthLayout>} />
          <Route path="/integrations" element={<AuthLayout><Integrations /></AuthLayout>} />
          <Route path="/importer" element={<AuthLayout><Importer /></AuthLayout>} />
          <Route path="/logs" element={<AuthLayout><Logs /></AuthLayout>} />
          <Route path="/settings" element={<AuthLayout><Settings /></AuthLayout>} />
          <Route path="/support" element={<AuthLayout><Support /></AuthLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
