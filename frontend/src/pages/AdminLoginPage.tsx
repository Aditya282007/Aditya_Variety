import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader } from '../components/Card'
import { cn } from '../utils/cn'
import { Store, Lock, Loader2 } from 'lucide-react'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({ phone: '', password: '' })
  const [errors, setErrors] = useState({ phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = { phone: '', password: '' }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return !newErrors.phone && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await login(formData.phone.replace(/\D/g, ''), formData.password)
      showToast('success', 'Welcome to Admin Dashboard')
      navigate('/admin', { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid credentials'
      showToast('error', message)
      setErrors(prev => ({ ...prev, password: message }))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value }))
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6" aria-label="Variety Store Admin">
            <Store className="h-10 w-10 text-brand-600" aria-hidden="true" />
            <span className="font-display font-semibold text-2xl text-sage-950">Admin Panel</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-sage-950">Admin Sign In</h1>
          <p className="text-sage-600 mt-2">Enter your admin credentials</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-xl text-sage-950">Sign In</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} noValidate>
              <Input
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                disabled={loading || authLoading}
              />
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
                disabled={loading || authLoading}
                helperText={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                }
              />

              <Button type="submit" className="w-full" size="lg" loading={loading || authLoading}>
                <Lock className="h-5 w-5 mr-2" aria-hidden="true" />
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-sage-600 mt-6">
          <a href="/" className="font-medium text-brand-600 hover:underline">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  )
}