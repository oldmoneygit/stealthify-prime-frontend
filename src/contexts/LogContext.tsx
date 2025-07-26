import React, { createContext, useContext, useState, ReactNode } from 'react'

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DEBUG'

export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  source: string
  message: string
  details?: any
}

interface LogContextType {
  logs: LogEntry[]
  addLog: (level: LogLevel, source: string, message: string, details?: any) => void
  clearLogs: () => void
  exportLogs: () => string
}

const LogContext = createContext<LogContextType | undefined>(undefined)

export const useLog = () => {
  const context = useContext(LogContext)
  if (!context) {
    throw new Error('useLog must be used within a LogProvider')
  }
  return context
}

interface LogProviderProps {
  children: ReactNode
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = (level: LogLevel, source: string, message: string, details?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      source,
      message,
      details
    }
    
    setLogs(prev => [newLog, ...prev]) // Mais recentes primeiro
    
    // Limitar a 1000 logs para performance
    setLogs(prev => prev.slice(0, 1000))
  }

  const clearLogs = () => {
    setLogs([])
    addLog('INFO', 'SYSTEM', 'Logs limpos pelo usuário')
  }

  const exportLogs = () => {
    return logs.map(log => {
      const timestamp = log.timestamp.toISOString()
      const details = log.details ? `\nDetalhes: ${JSON.stringify(log.details, null, 2)}` : ''
      return `[${timestamp}] [${log.level}] [${log.source}] ${log.message}${details}`
    }).join('\n\n')
  }

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs, exportLogs }}>
      {children}
    </LogContext.Provider>
  )
}