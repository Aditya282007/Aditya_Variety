import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import { orderAPI } from '../services/api'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader, CardFooter } from '../components/Card'
import { Input } from '../components/Input'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Truck, Shield, RotateCcw, Phone, User, MapPin, MessageSquare, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

export function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, getTotal, getItemCount, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', landmark: '', city: '', pincode: '' })
  const [errors, setErrors] = useState({ name: '', phone: '', address: '', city: '', pincode: '' })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout', { replace: true })
    }
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, phone: user.phone }))
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items, navigate])

  // Auto-redirect to WhatsApp when order is created
  useEffect(() => {
    if (orderCreated && whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }, [orderCreated, whatsappUrl])

  const subtotal = getTotal()
  const delivery = subtotal >= 500 ? 0 : 50
  const total = subtotal + delivery

  const validateForm = () => {
    const newErrors = { name: '', phone: '', address: '', city: '', pincode: '' }
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode'
    setErrors(newErrors)
    return !Object.values(newErrors).some(e => e)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        qty: item.qty
      }))

      const res = await orderAPI.create(orderItems)
      const order = res.data

      clearCart()
      setOrderCreated(true)

      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '91XXXXXXXXXX'
      const message = encodeURIComponent(
        `Hi Variety Store,\n\n` +
        `I'd like to confirm my order #${order._id.slice(-8).toUpperCase()}:\n\n` +
        `${order.items.map((item: any) => `${item.name} × ${item.qty} = ${formatPrice(item.price * item.qty)}`).join('\n')}\n\n` +
        `Total: ${formatPrice(order.total)}\n\n` +
        `Customer: ${order.customerName}\n` +
        `Phone: ${order.customerPhone}\n` +
        `Address: ${formData.address}${formData.landmark ? `, ${formData.landmark}` : ''}, ${formData.city} - ${formData.pincode}\n\n` +
        `Please confirm availability and delivery time.`
      )
      setWhatsappUrl(`https://wa.me/${whatsappNumber}?text=${message}`)

      showToast('success', 'Order placed! Redirecting to WhatsApp...')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : name === 'pincode' ? value.replace(/\D/g, '').slice(0, 6) : value }))
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="container animate-pulse space-y-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="h-4 bg-sage-100 rounded w-1/4 mb-4" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 h-20 bg-sage-100 rounded" />
                    <div className="col-span-2 space-y-3">
                      <div className="h-4 bg-sage-100 rounded w-3/4" />
                      <div className="h-3 bg-sage-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-6 h-64">
              <div className="space-y-3">
                <div className="h-4 bg-sage-100 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-8 bg-sage-100 rounded w-full" />
                  <div className="h-8 bg-sage-100 rounded w-full" />
                </div>
                <div className="h-8 bg-sage-100 rounded w-full" />
                <div className="h-12 bg-brand-100 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || items.length === 0) return null

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex h-20 w-20 items-center justify-center mx-auto mb-6 rounded-full bg-sage-100 text-sage-600">
            <CheckCircle className="h-10 w-10" aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-3xl text-sage-950 mb-2">Order Placed!</h1>
          <p className="text-sage-600 mb-8">Your order has been created. Complete your purchase on WhatsApp.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            <MessageSquare className="h-6 w-6" aria-hidden="true" />
            Continue on WhatsApp
          </a>
          <p className="mt-4 text-sm text-sage-500">
            Or <a href="/account/orders" className="text-brand-600 hover:underline">view your orders</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">Checkout</h1>
          <p className="text-sage-600 mt-1">{getItemCount()} item{getItemCount() !== 1 ? 's' : ''} · {formatPrice(total)} total</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-xl text-sage-950 flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    Contact Information
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    disabled={loading}
                  />
                  <Input
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    inputMode="numeric"
                    maxLength={10}
                    required
                    disabled={loading}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-xl text-sage-950 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    Delivery Address
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    name="address"
                    label="Street Address"
                    placeholder="House/Flat No., Building, Street"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                    disabled={loading}
                  />
                  <Input
                    name="landmark"
                    label="Landmark (Optional)"
                    placeholder="Nearest landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      name="city"
                      label="City"
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                      required
                      disabled={loading}
                    />
                    <Input
                      name="pincode"
                      type="text"
                      label="Pincode"
                      placeholder="123456"
                      value={formData.pincode}
                      onChange={handleChange}
                      error={errors.pincode}
                      inputMode="numeric"
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-xl text-sage-950 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    Order via WhatsApp
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sage-600 text-sm mb-4">
                    We'll redirect you to WhatsApp with a pre-filled message containing your order details.
                    Confirm with our team and they'll arrange delivery.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info"><MessageSquare className="h-3 w-3 mr-1" /> WhatsApp Order</Badge>
                    <Badge variant="success"><Truck className="h-3 w-3 mr-1" /> Home Delivery</Badge>
                    <Badge variant="warning"><Shield className="h-3 w-3 mr-1" /> Pay on Delivery</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <h2 className="font-semibold text-xl text-sage-950">Order Summary</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-sage-50">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <svg className="h-8 w-8 mx-auto my-auto text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sage-900 truncate">{item.name}</p>
                          <p className="text-sm text-sage-500">{formatPrice(item.price)} × {item.qty}</p>
                        </div>
                        <p className="font-semibold text-sage-900 self-center">{formatPrice(item.price * item.qty)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-sage-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-600">Subtotal</span>
                      <span className="font-medium text-sage-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-600">Delivery</span>
                      <span className="font-medium text-sage-900">
                        {delivery === 0 ? (
                          <span className="text-sage-600">Free</span>
                        ) : (
                          formatPrice(delivery)
                        )}
                      </span>
                    </div>
                    {subtotal < 500 && subtotal > 0 && (
                      <p className="text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-lg">
                        Add {formatPrice(500 - subtotal)} more for free delivery!
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <div className="flex justify-between text-lg font-bold text-sage-950 mb-4">
                    <span>Total</span>
                    <span className="text-brand-600">{formatPrice(total)}</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={loading}
                  >
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    Place Order on WhatsApp
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="col-span-3 p-4 rounded-xl bg-sage-50/50 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-sage-600">
                    <div className="flex items-center gap-2"><Truck className="h-4 w-4" /><span>Free Delivery ₹500+</span></div>
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span>Quality Guaranteed</span></div>
                    <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /><span>Easy Returns</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}