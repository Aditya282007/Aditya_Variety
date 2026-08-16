import { useState } from 'react'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader } from '../components/Card'
import { productAPI } from '../services/api'
import { Mail, Phone, MapPin, Sparkles, Send } from 'lucide-react'

export function ContactPage() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productName: '',
    productCategory: '',
    description: '',
    urgency: 'normal'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const categories = ['Groceries', 'Household', 'Snacks', 'Beverages', 'Personal Care', 'Stationery', 'Other']

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter 10-digit phone number'
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // For now, log to console and show success
      // In production, send to backend /api/suggestions or email service
      console.log('Product Suggestion:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showToast('success', 'Thanks! We\'ll review your suggestion and get back to you.')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', productName: '', productCategory: '', description: '', urgency: 'normal' })
    } catch (err) {
      showToast('error', 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex h-20 w-20 items-center justify-center mx-auto mb-6 rounded-full bg-sage-100 text-sage-600">
            <Sparkles className="h-10 w-10" aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-3xl text-sage-950 mb-2">Suggestion Submitted!</h1>
          <p className="text-sage-600 mb-8">Thank you for helping us improve our store. We'll review your suggestion and get back to you soon.</p>
          <Button onClick={() => setSubmitted(false)} variant="secondary">
            Submit Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12 md:py-20">
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <Sparkles className="h-12 w-12 mx-auto text-brand-600 mb-4" aria-hidden="true" />
          <h1 className="font-display font-bold text-4xl md:text-5xl text-sage-950 mb-4">
            Suggest a Product
          </h1>
          <p className="text-lg text-sage-600 max-w-xl mx-auto">
            Can't find what you need? Tell us what you'd like to see on our shelves and we'll do our best to stock it.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <h2 className="font-semibold text-2xl text-sage-950">Product Details</h2>
            <p className="text-sage-600 mt-1">Help us understand what you're looking for</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  label="Your Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  disabled={loading}
                />
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  disabled={loading}
                />
              </div>

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
                required
                disabled={loading}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="productName"
                  label="Product Name"
                  placeholder="e.g., Organic Almond Milk 1L"
                  value={formData.productName}
                  onChange={handleChange}
                  error={errors.productName}
                  required
                  disabled={loading}
                />
                <select
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-sage-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-sage-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="low">Low - Just an idea</option>
                  <option value="normal">Normal - Would buy regularly</option>
                  <option value="high">High - Need this soon!</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Description & Details</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  placeholder="Describe the product, brand preferences, size, quantity needed, or any other details..."
                  required
                  disabled={loading}
                />
                {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                <Send className="h-5 w-5 mr-2" aria-hidden="true" />
                Submit Suggestion
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-sage-100">
            <Mail className="h-10 w-10 mx-auto text-brand-600 mb-3" aria-hidden="true" />
            <h3 className="font-semibold text-sage-900 mb-1">Email Us</h3>
            <p className="text-sage-600 text-sm">hello@varietystore.in</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-100">
            <Phone className="h-10 w-10 mx-auto text-brand-600 mb-3" aria-hidden="true" />
            <h3 className="font-semibold text-sage-900 mb-1">Call Us</h3>
            <p className="text-sage-600 text-sm">+91 98765 43210</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-100">
            <MapPin className="h-10 w-10 mx-auto text-brand-600 mb-3" aria-hidden="true" />
            <h3 className="font-semibold text-sage-900 mb-1">Visit Us</h3>
            <p className="text-sage-600 text-sm">123 Main Street, Your City</p>
          </div>
        </div>
      </div>
    </div>
  )
}