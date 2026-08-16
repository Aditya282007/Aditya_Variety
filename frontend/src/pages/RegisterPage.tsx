import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader } from '../components/Card'
import { cn } from '../utils/cn'
import { Store, User, Lock, Mail, Loader2 } from 'lucide-react'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const navigate = useNavigate()
  const { register, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = { name: '', phone: '', password: '', confirmPassword: '' }
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return !Object.values(newErrors).some(e => e)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await register(formData.name.trim(), formData.phone.replace(/\D/g, ''), formData.password)
      showToast('success', 'Account created successfully!')
      navigate(redirect, { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed'
      showToast('error', message)
      if (message.includes('phone')) setErrors(prev => ({ ...prev, phone: message }))
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="Variety Store Home">
            <Store className="h-10 w-10 text-brand-600" aria-hidden="true" />
            <span className="font-display font-semibold text-2xl text-sage-950">Variety Store</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-sage-950">Create an account</h1>
          <p className="text-sage-600 mt-2">Join us for a better shopping experience</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-xl text-sage-950">Sign Up</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} noValidate>
              <Input
                name="name"
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
                disabled={loading || authLoading}
              />
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
                autoComplete="new-password"
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
                    <span className="text-sm text-sage-500">Min. 6 characters</span>
                  </div>
                }
              />
              <Input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                disabled={loading || authLoading}
              />

              <Button type="submit" className="w-full" size="lg" loading={loading || authLoading}>
                Create Account
              </Button>
            </form>

            <p className="text-xs text-sage-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-sage-600 mt-6">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`} className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}