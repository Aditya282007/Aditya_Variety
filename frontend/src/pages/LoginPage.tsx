import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader } from '../components/Card'
import { cn } from '../utils/cn'
import { Store, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
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
      showToast('success', 'Welcome back!')
      navigate(redirect, { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid phone or password'
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
          <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="Variety Store Home">
            <Store className="h-10 w-10 text-brand-600" aria-hidden="true" />
            <span className="font-display font-semibold text-2xl text-sage-950">Variety Store</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-sage-950">Welcome back</h1>
          <p className="text-sage-600 mt-2">Sign in to continue shopping</p>
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
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                    <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                }
              />

              <Button type="submit" className="w-full" size="lg" loading={loading || authLoading}>
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sage-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-sage-500">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" disabled={loading || authLoading}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-sage-600 mt-6">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${redirect}`} className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}