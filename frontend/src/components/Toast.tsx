import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../utils/cn'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: ToastType, message: string, duration?: number) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const IconComponents = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
}

const colors = {
  success: 'bg-sage-100 text-sage-800 border-sage-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-brand-100 text-brand-800 border-brand-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200'
}

const iconColors = {
  success: 'text-sage-600',
  error: 'text-red-600',
  info: 'text-brand-600',
  warning: 'text-amber-600'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => {
          const IconComponent = IconComponents[toast.type]
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-soft min-w-[280px] max-w-md animate-in slide-in-from-right',
                colors[toast.type]
              )}
              role="alert"
            >
              <IconComponent className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} aria-hidden="true" />
              <p className="text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}