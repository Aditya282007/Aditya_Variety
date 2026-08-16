import type { HTMLAttributes, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white rounded-2xl shadow-card border border-sage-100 overflow-hidden transition-shadow duration-300 hover:shadow-soft',
      elevated: 'bg-white rounded-2xl shadow-soft border border-sage-100 overflow-hidden',
      outlined: 'bg-white rounded-2xl border-2 border-sage-200 overflow-hidden'
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-4 border-b border-sage-100', className)} {...props}>
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-4 border-t border-sage-100 bg-sage-50/50', className)} {...props}>
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'