import { cn } from '../utils/cn'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center text-center py-16 px-4', className)}>
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-400 mb-6">
          {icon}
        </div>
      )}
      <h3 className="font-display font-medium text-2xl text-sage-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sage-600 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}