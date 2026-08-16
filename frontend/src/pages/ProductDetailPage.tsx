import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import { Card, CardContent } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { cn, formatPrice } from '../utils/cn'
import { Package, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw, Minus, Plus, Share2, Heart } from 'lucide-react'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await productAPI.getById(id)
        setProduct(res.data)
        setQty(1)
      } catch (err) {
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      qty
    })
    showToast('success', `${product.name} added to cart`)
  }

  const incrementQty = () => {
    if (qty < product?.stock) setQty(qty + 1)
  }

  const decrementQty = () => {
    if (qty > 1) setQty(qty - 1)
  }

  const isOutOfStock = product?.stock === 0
  const isLowStock = product?.stock && product.stock > 0 && product.stock < 5

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-sage-100 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-4 bg-sage-100 rounded w-1/3" />
            <div className="h-8 bg-sage-100 rounded w-3/4" />
            <div className="h-6 bg-sage-100 rounded w-1/4" />
            <div className="space-y-3">
              <div className="h-10 bg-sage-100 rounded w-full" />
              <div className="h-10 bg-sage-100 rounded w-full" />
            </div>
            <div className="h-12 bg-sage-100 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Product not found"
          description="This product doesn't exist or has been removed."
          action={{
            label: 'Back to Products',
            onClick: () => window.history.back(),
            variant: 'primary'
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white border-b border-sage-100 py-4" aria-label="Breadcrumb">
        <div className="container">
          <ol className="flex items-center gap-2 text-sm text-sage-600" role="list">
            <li><Link to="/" className="hover:text-brand-600">Home</Link></li>
            <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4" aria-hidden="true" /><Link to="/products" className="hover:text-brand-600">Products</Link></li>
            <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4" aria-hidden="true" /><Link to={`/products?category=${product.category}`} className="hover:text-brand-600">{product.category}</Link></li>
            <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4" aria-hidden="true" /><span className="text-sage-900 truncate max-w-xs" aria-current="page">{product.name}</span></li>
          </ol>
        </div>
      </nav>

      <section className="py-8 md:py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="sticky top-24">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-sage-50 border border-sage-100">
                {product.imageUrl && !imageError ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-24 w-24 text-sage-300" aria-hidden="true" />
                  </div>
                )}
                {(isOutOfStock || isLowStock) && (
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isOutOfStock && <Badge variant="danger" className="px-3 py-1 text-sm">Out of Stock</Badge>}
                    {isLowStock && !isOutOfStock && <Badge variant="warning" className="px-3 py-1 text-sm">Only {product.stock} left</Badge>}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <button
                    key={i}
                    className="aspect-square rounded-xl border-2 border-sage-200 bg-sage-50 transition-colors hover:border-brand-300"
                    aria-label={`View image ${i + 1}`}
                  >
                    <Package className="h-8 w-8 mx-auto my-auto text-sage-300" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Link to={`/products?category=${product.category}`} className="text-sm font-medium text-brand-600 hover:underline mb-2 inline-block">
                  {product.category}
                </Link>
                <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="font-display font-bold text-3xl md:text-4xl text-brand-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isLowStock && !isOutOfStock && (
                  <Badge variant="warning" className="text-sm px-3 py-1">
                    <span className="mr-1">⚠</span> Only {product.stock} left in stock
                  </Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="danger" className="text-sm px-3 py-1">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="prose prose-sage max-w-none border-t border-sage-100 pt-6">
                <h3 className="font-semibold text-sage-900 mb-3">Description</h3>
                <p className="text-sage-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-sage-100 pt-6 space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-sage-700 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-sage-200 rounded-xl overflow-hidden">
                      <button
                        onClick={decrementQty}
                        disabled={qty <= 1}
                        className="px-4 py-3 text-sage-600 hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        value={qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          setQty(Math.min(Math.max(val, 1), product.stock || 1))
                        }}
                        min={1}
                        max={product.stock || 1}
                        className="w-16 text-center text-lg font-semibold text-sage-900 border-x border-sage-200 focus:outline-none"
                        aria-label="Quantity"
                      />
                      <button
                        onClick={incrementQty}
                        disabled={qty >= (product.stock || 1)}
                        className="px-4 py-3 text-sage-600 hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm text-sage-500">
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    size="lg"
                    className="flex-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
                    <Heart className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden sm:inline">Wishlist</span>
                  </Button>
                </div>
              </div>

              <div className="border-t border-sage-100 pt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-sage-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <Truck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sage-900">Free Delivery</p>
                    <p className="text-sm text-sage-600">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-sage-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sage-900">Quality Guaranteed</p>
                    <p className="text-sm text-sage-600">Fresh & authentic</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-sage-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-sage-900">Easy Returns</p>
                    <p className="text-sm text-sage-600">7-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}