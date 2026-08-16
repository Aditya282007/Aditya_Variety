import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productAPI, orderAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Package, ShoppingCart, AlertTriangle, Users, Plus, Loader2, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

export function AdminDashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalOrdersToday: 0, pendingOrders: 0, lowStockCount: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login', { replace: true })
    }
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user, authLoading, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, ordersRes, lowStockRes] = await Promise.all([
        orderAPI.getDashboardStats(),
        orderAPI.getAll({ limit: 5 }),
        productAPI.getLowStock()
      ])
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data.orders || [])
      setLowStockProducts(lowStockRes.data || [])
    } catch (err) {
      showToast('error', 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Orders Today', value: stats.totalOrdersToday, icon: ShoppingCart, color: 'brand', trend: null },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Package, color: 'warning', trend: null },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, color: 'danger', trend: null }
  ]

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
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-sage-100 rounded w-1/3 mb-2" />
                <div className="h-12 bg-sage-100 rounded w-1/4" />
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6"><div className="h-6 bg-sage-100 rounded w-1/3 mb-4" /><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-12 bg-sage-100 rounded" />))}</div></div>
            <div className="card p-6"><div className="h-6 bg-sage-100 rounded w-1/3 mb-4" /><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-12 bg-sage-100 rounded" />))}</div></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">Admin Dashboard</h1>
            <p className="text-sage-600 mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Product
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline">
                View All Orders
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={stat.label} className="animate-in stagger-{index + 1}">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sage-600">{stat.label}</p>
                    <p className="font-display font-bold text-3xl text-sage-950 mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', `bg-${stat.color}-100 text-${stat.color}-600`)}>
                    <stat.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold text-xl text-sage-950">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-brand-600 hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length > 0 ? (
                <div className="divide-y divide-sage-100">
                  {recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      to={`/admin/orders/${order._id}`}
                      className="flex items-center justify-between p-4 hover:bg-sage-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                          <Package className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-900">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm text-sage-500">{order.customerName} · {order.items.length} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="font-semibold text-sage-950">{formatPrice(order.total)}</span>
                        <ChevronRight className="h-4 w-4 text-sage-400" aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Package className="h-10 w-10" />}
                  title="No orders yet"
                  description="Orders will appear here as customers place them."
                  className="py-12"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold text-xl text-sage-950">Low Stock Products</h2>
              <Link to="/admin/products?lowStock=true" className="text-sm text-brand-600 hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockProducts.length > 0 ? (
                <div className="divide-y divide-sage-100">
                  {lowStockProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/admin/products/${product._id}/edit`}
                      className="flex items-center justify-between p-4 hover:bg-sage-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-600">
                          <Package className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-900">{product.name}</p>
                          <p className="text-sm text-sage-500">{product.category} · {formatPrice(product.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="warning">{product.stock} left</Badge>
                        <ChevronRight className="h-4 w-4 text-sage-400" aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<AlertTriangle className="h-10 w-10 text-sage-400" />}
                  title="All stocked up!"
                  description="No products are running low on stock."
                  className="py-12"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}