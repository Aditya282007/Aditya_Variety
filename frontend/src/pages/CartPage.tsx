import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card, CardContent, CardFooter, CardHeader } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Minus, Plus, Trash2, Truck, Shield, RotateCcw, ArrowRight } from 'lucide-react'

export function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, updateQty, removeItem, getTotal, getItemCount, clearCart } = useCart()
  const { showToast } = useToast()

  const handleCheckout = () => {
    if (!user) {
      showToast('info', 'Please log in to checkout')
      window.location.href = '/login?redirect=/checkout'
      return
    }
    window.location.href = '/checkout'
  }

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card">
              <div className="p-4 flex gap-4">
                <div className="h-20 w-20 bg-sage-100 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-sage-100 rounded w-3/4" />
                  <div className="h-3 bg-sage-100 rounded w-1/2" />
                  <div className="h-8 bg-sage-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="container">
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="Your cart is empty"
            description="Looks like you haven't added any products yet. Start shopping to fill your cart!"
            action={{
              label: 'Continue Shopping',
              onClick: () => window.location.href = '/products',
              variant: 'primary'
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">
            Shopping Cart
          </h1>
          <p className="text-sage-600 mt-1">
            {getItemCount()} item{getItemCount() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4" role="list" aria-label="Cart items">
              {items.map((item, index) => (
                <Card key={item.productId} className="animate-in stagger-{index + 1}">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-sage-50">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg className="h-10 w-10 mx-auto my-auto text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sage-900 truncate">{item.name}</h3>
                        <p className="text-sm text-sage-600 mt-1">{formatPrice(item.price)} each</p>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center border border-sage-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQty(item.productId, item.qty - 1)}
                              disabled={item.qty <= 1}
                              className="px-3 py-2 text-sage-600 hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="px-4 py-2 text-center font-semibold text-sage-900 w-12">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.productId, item.qty + 1)}
                              disabled={item.qty >= item.stock}
                              className="px-3 py-2 text-sage-600 hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>

                          <span className="text-sm text-sage-500">
                            {item.stock > 0 ? `${item.stock} available` : 'Out of stock'}
                          </span>
                        </div>

                        <p className="mt-2 font-semibold text-sage-950">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-sage-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h2 className="font-display font-semibold text-xl text-sage-950">Order Summary</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-600">Subtotal ({getItemCount()} items)</span>
                    <span className="font-medium text-sage-900">{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-600">Delivery</span>
                    <span className="font-medium text-sage-900">
                      {getTotal() >= 500 ? 'Free' : formatPrice(50)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-600">Discount</span>
                    <span className="font-medium text-brand-600">-₹0</span>
                  </div>
                </div>

                <div className="border-t border-sage-100 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-sage-950">Total</span>
                    <span className="text-brand-600">
                      {formatPrice(getTotal() >= 500 ? getTotal() : getTotal() + 50)}
                    </span>
                  </div>
                  {getTotal() < 500 && getTotal() > 0 && (
                    <p className="text-sm text-brand-600 mt-2">
                      Add {formatPrice(500 - getTotal())} more for free delivery!
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="space-y-3 pt-6">
                <Button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  size="lg"
                  className="w-full"
                >
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/products'}>
                  Continue Shopping
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="col-span-3 p-4 rounded-xl bg-sage-50/50 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-sage-600">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  <span>Secure Checkout</span>
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  <span>Free Delivery ₹500+</span>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}