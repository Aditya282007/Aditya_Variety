import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Loader2, ChevronRight, Package, Filter, X, ArrowDown, ArrowUp } from 'lucide-react'

const STATUSES = ['pending', 'confirmed', 'fulfilled', 'cancelled'] as const
type OrderStatus = typeof STATUSES[number]
type FilterStatus = OrderStatus | 'all'

export function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 })

  const selectedStatus = (searchParams.get('status') || 'all') as FilterStatus
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      // Redirect handled by route guard
    }
    if (user?.role === 'admin') {
      fetchOrders()
    }
  }, [user, authLoading, selectedStatus, currentPage])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await orderAPI.getAll({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        page: currentPage,
        limit: 20
      })
      setOrders(res.orders || [])
      setPagination({
        totalPages: res.totalPages || 1,
        currentPage: res.currentPage || 1,
        total: res.total || 0
      })
    } catch (err) {
      showToast('error', 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      showToast('success', `Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (err) {
      showToast('error', 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusClick = (order: any, status: OrderStatus) => {
    if (order.status !== status && updatingId !== order._id) {
      handleStatusChange(order._id, status)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) params.set('page', page.toString())
    else params.delete('page')
    setSearchParams(params)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    setSearchParams(params)
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
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="h-4 bg-sage-100 rounded w-1/3 mb-2" />
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-4 bg-sage-100 rounded" />
                  <div className="h-4 bg-sage-100 rounded" />
                  <div className="h-4 bg-sage-100 rounded" />
                  <div className="h-4 bg-sage-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  const hasFilters = selectedStatus !== 'all'

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">All Orders</h1>
            <p className="text-sage-600 mt-1">{pagination.total} order{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', ...STATUSES] as const).map((status) => {
              const isAll = status === 'all'
              const statusValue = isAll ? 'all' : status
              return (
                <button
                  key={statusValue}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    if (isAll) params.delete('status')
                    else params.set('status', statusValue)
                    params.delete('page')
                    setSearchParams(params)
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    selectedStatus === statusValue
                      ? 'bg-brand-600 text-white'
                      : 'bg-sage-100 text-sage-700 hover:bg-sage-200 hover:text-sage-900'
                  )}
                >
{isAll ? 'All' : statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                </button>
              )
            })}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                        <Package className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <Link to={`/admin/orders/${order._id}`} className="font-semibold text-sage-900 hover:text-brand-600">
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                          <span className="text-sm text-sage-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-sage-600 mt-1">
                          {order.customerName} · {order.customerPhone} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:flex-row">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sage-950 text-lg">{formatPrice(order.total)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {STATUSES.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusClick(order, status)}
                            disabled={updatingId === order._id || order.status === status}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                              order.status === status
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-sage-100 text-sage-600 hover:bg-sage-200 hover:text-sage-900 disabled:opacity-50'
                            )}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                      <Link to={`/admin/orders/${order._id}`} className="btn-ghost p-2" aria-label="View details">
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pagination.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}>Previous</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) pageNum = i + 1
                    else if (pagination.currentPage <= 3) pageNum = i + 1
                    else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i
                    else pageNum = pagination.currentPage - 2 + i
                    return (
                      <Button key={pageNum} variant={pagination.currentPage === pageNum ? 'primary' : 'outline'} size="sm" onClick={() => handlePageChange(pageNum)} aria-label={`Page ${pageNum}`} aria-current={pagination.currentPage === pageNum ? 'page' : undefined}>{pageNum}</Button>
                    )
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages}>Next</Button>
              </nav>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No orders found"
            description={selectedStatus !== 'all' ? `No ${selectedStatus} orders` : 'No orders placed yet'}
            action={hasFilters ? { label: 'Clear filters', onClick: clearFilters, variant: 'outline' } : undefined}
          />
        )}
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