import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LogProvider } from './contexts/LogContext.tsx'

createRoot(document.getElementById("root")!).render(
  <LogProvider>
    <App />
  </LogProvider>
);
