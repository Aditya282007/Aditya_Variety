import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader, CardFooter } from '../components/Card'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Loader2, ChevronLeft, Package, User, MapPin, Phone, Clock, ArrowDown, ArrowUp, MoreHorizontal } from 'lucide-react'

const STATUSES = ['pending', 'confirmed', 'fulfilled', 'cancelled'] as const
type OrderStatus = typeof STATUSES[number]

export function AdminOrderDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login', { replace: true })
    }
    if (user?.role === 'admin' && id) {
      fetchOrder()
    }
  }, [user, authLoading, navigate, id])

  const fetchOrder = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await orderAPI.getById(id)
      setOrder(res)
    } catch (err) {
      showToast('error', 'Failed to load order')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || order.status === newStatus) return
    setUpdating(true)
    try {
      await orderAPI.updateStatus(order._id, newStatus)
      showToast('success', `Order status updated to ${newStatus}`)
      setOrder(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      showToast('error', 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      confirmed: 'info',
      fulfilled: 'success',
      cancelled: 'danger'
    }
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="grid gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-sage-100 rounded w-1/3 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-sage-100 rounded w-full" />
                  <div className="h-4 bg-sage-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin' || !order) return null

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sage-600 hover:text-brand-600 mb-4">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">Order Details</h1>
              <p className="text-sage-600 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-xl text-sage-950">Order Items</h2>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-sage-100">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 hover:bg-sage-50">
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-sage-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 mx-auto my-auto text-sage-300" aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sage-900 truncate">{item.name}</p>
                        <p className="text-sm text-sage-500">{formatPrice(item.price)} × {item.qty}</p>
                      </div>
                      <p className="font-semibold text-sage-950 self-center">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-xl text-sage-950">Status History</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-50 border border-brand-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-sage-900">Order Placed</p>
                      <p className="text-sm text-sage-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {order.updatedAt !== order.createdAt && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-sage-50 border border-sage-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium text-sage-900">Last Updated</p>
                        <p className="text-sm text-sage-500">
                          {new Date(order.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                          · Status: {order.status}
                        </p>
                      </div>
                    </div>
                  )}
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
                <div className="flex justify-between text-sm">
                  <span className="text-sage-600">Subtotal</span>
                  <span className="font-medium text-sage-900">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sage-600">Delivery</span>
                  <span className="font-medium text-sage-900">Included</span>
                </div>
                <div className="border-t border-sage-100 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-sage-950">Total</span>
                    <span className="text-brand-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <div className="space-y-2">
                  {STATUSES.map(status => (
                    <Button
                      key={status}
                      variant={order.status === status ? 'primary' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(status)}
                      disabled={updating || order.status === status}
                      loading={updating && order.status === status}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <h2 className="font-semibold text-xl text-sage-950">Customer Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-sage-50/50">
                  <User className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-sage-500">Name</p>
                    <p className="font-medium text-sage-900">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-sage-50/50">
                  <Phone className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-sage-500">Phone</p>
                    <p className="font-medium text-sage-900">{order.customerPhone}</p>
                  </div>
                </div>
                {order.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-sage-50/50">
                    <MapPin className="h-5 w-5 text-brand-600 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-sage-500">Address</p>
                      <p className="font-medium text-sage-900">{order.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    confirmed: 'info',
    fulfilled: 'success',
    cancelled: 'danger'
  }
  return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>
}