import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { User, Package, Settings, LogOut, Loader2, ChevronRight, Save, UserPlus, Package as PackageIcon, History } from 'lucide-react'

export function AccountPage() {
  const { user, logout, updateProfile, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({ name: '', phone: '', password: '', confirmPassword: '' })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/account', { replace: true })
    }
    if (user) {
      setFormData({ name: user.name, phone: user.phone, password: '', confirmPassword: '' })
      fetchOrders()
    }
  }, [user, authLoading, navigate])

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const res = await orderAPI.getMyOrders()
      setOrders(res.data || [])
    } catch (err) {
      showToast('error', 'Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  const validateProfile = () => {
    const newErrors = { name: '', phone: '', password: '', confirmPassword: '' }
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return !Object.values(newErrors).some(e => e)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProfile()) return

    setProfileLoading(true)
    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        ...(formData.password ? { password: formData.password } : {})
      })
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      showToast('success', 'Profile updated successfully')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    }))
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      confirmed: 'info',
      fulfilled: 'success',
      cancelled: 'danger'
    }
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-6 bg-sage-100 rounded w-1/3 mb-4" />
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">My Account</h1>
          <p className="text-sage-600 mt-1">Manage your orders and profile</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <User className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sage-900">{user.name}</h2>
                    <p className="text-sm text-sage-500">{user.phone}</p>
                    {user.role === 'admin' && (
                      <Badge variant="info" className="mt-1">Admin</Badge>
                    )}
                  </div>
                </div>

                <nav className="space-y-1" aria-label="Account navigation">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      activeTab === 'orders'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-sage-600 hover:bg-sage-50 hover:text-sage-900'
                    )}
                  >
                    <PackageIcon className="h-5 w-5" aria-hidden="true" />
                    My Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      activeTab === 'profile'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-sage-600 hover:bg-sage-50 hover:text-sage-900'
                    )}
                  >
                    <Settings className="h-5 w-5" aria-hidden="true" />
                    Profile Settings
                  </button>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-900 transition-colors"
                    >
                      <UserPlus className="h-5 w-5" aria-hidden="true" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    Logout
                  </button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1">
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-2xl text-sage-950">Order History</h2>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-4 bg-sage-100 rounded w-1/4 mb-4" />
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-4 bg-sage-100 rounded" />
                            <div className="h-4 bg-sage-100 rounded" />
                            <div className="h-4 bg-sage-100 rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order._id}>
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                                <Package className="h-5 w-5" aria-hidden="true" />
                              </div>
                              <div>
                                <p className="font-semibold text-sage-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                                <p className="text-sm text-sage-500">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(order.status)}
                              <Link
                                to={`/account/orders/${order._id}`}
                                className="btn-outline text-sm"
                              >
                                View Details
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {order.items.slice(0, 3).map((item: any, idx: number) => (
                              <span key={idx} className="text-sm text-sage-600">
                                {item.name} × {item.qty}
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-sm text-sage-500">+{order.items.length - 3} more</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-sage-100">
                            <span className="font-semibold text-sage-900">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </span>
                            <span className="font-display font-bold text-xl text-brand-600">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Package className="h-12 w-12" />}
                    title="No orders yet"
                    description="When you place orders, they'll appear here."
                    action={{
                      label: 'Start Shopping',
                      onClick: () => navigate('/products'),
                      variant: 'primary'
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="font-display font-semibold text-2xl text-sage-950 mb-6">Profile Settings</h2>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-xl text-sage-950">Personal Information</h3>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                      <Input
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                        disabled={profileLoading}
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
                        disabled={profileLoading}
                      />
                      <div className="pt-4 border-t border-sage-100">
                        <h4 className="font-medium text-sage-900 mb-3">Change Password</h4>
                        <p className="text-sm text-sage-500 mb-4">Leave blank to keep current password</p>
                        <Input
                          name="password"
                          type="password"
                          label="New Password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          error={errors.password}
                          autoComplete="new-password"
                          disabled={profileLoading}
                          helperText="Minimum 6 characters"
                        />
                        <Input
                          name="confirmPassword"
                          type="password"
                          label="Confirm New Password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          error={errors.confirmPassword}
                          autoComplete="new-password"
                          disabled={profileLoading}
                        />
                      </div>
                      <Button type="submit" loading={profileLoading}>
                        <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="mt-6 border-red-200">
                  <CardHeader>
                    <h3 className="font-semibold text-xl text-red-700 flex items-center gap-2">
                      <User className="h-5 w-5" aria-hidden="true" />
                      Danger Zone
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sage-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="danger" onClick={() => { if (confirm('Are you sure? This cannot be undone.')) logout() }}>
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}