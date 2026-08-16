import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Card, CardContent, CardFooter } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'
import { cn } from '../utils/cn'
import { ShoppingCart, Package } from 'lucide-react'

interface ProductCardProps {
  product: {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    category: string
    imageUrl: string
  }
  variant?: 'default' | 'compact'
  className?: string
  children?: React.ReactNode
}

export function ProductCard({ product, variant = 'default', className, children }: ProductCardProps) {
  const { addItem } = useCart()
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock < 5

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) {
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (variant === 'compact') {
    return (
      <Link to={`/products/${product._id}`} className="group flex gap-3 p-3 rounded-xl hover:bg-sage-50 transition-colors relative">
        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-sage-50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package className="h-8 w-8 text-sage-300 mx-auto my-auto" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sage-900 truncate group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-sage-500 truncate mt-0.5">{product.category}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-sage-900">{formatPrice(product.price)}</span>
            {isLowStock && <Badge variant="warning">Low Stock</Badge>}
            {isOutOfStock && <Badge variant="danger">Out of Stock</Badge>}
          </div>
        </div>
        {children && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {children}
          </div>
        )}
      </Link>
    )
  }

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <Link to={`/products/${product._id}`} className="block" aria-label={`View ${product.name}`}>
        <div className="relative aspect-square overflow-hidden bg-sage-50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-sage-300" aria-hidden="true" />
            </div>
          )}
          {(isOutOfStock || isLowStock) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isOutOfStock && <Badge variant="danger">Out of Stock</Badge>}
              {isLowStock && !isOutOfStock && <Badge variant="warning">Low Stock</Badge>}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex-1 flex flex-col">
        <Link to={`/products/${product._id}`} className="block">
          <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="font-display font-medium text-lg text-sage-900 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-sage-600 line-clamp-2 flex-1 mb-3">
            {product.description}
          </p>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-sage-100">
          <span className="font-display font-semibold text-xl text-sage-950">
            {formatPrice(product.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full"
          aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}