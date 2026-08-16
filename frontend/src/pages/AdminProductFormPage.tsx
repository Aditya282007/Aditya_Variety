import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader, CardFooter } from '../components/Card'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Loader2, ArrowLeft, Image, X, Package } from 'lucide-react'

const CATEGORIES = ['Groceries', 'Household', 'Snacks', 'Beverages', 'Personal Care', 'Stationery']

export function AdminProductFormPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login', { replace: true })
    }
    if (isEditing && user?.role === 'admin') {
      fetchProduct()
    }
  }, [user, authLoading, navigate, isEditing, id])

  const fetchProduct = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await productAPI.getById(id)
      const product = res.data
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        imageUrl: product.imageUrl || ''
      })
      if (product.imageUrl) setImagePreview(product.imageUrl)
    } catch (err) {
      showToast('error', 'Failed to load product')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = 'Valid price is required'
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!isEditing && !imageFile && !formData.imageUrl) newErrors.image = 'Image is required for new products'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Image must be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, imageUrl: '' }))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('price', formData.price)
      formDataToSend.append('stock', formData.stock)
      formDataToSend.append('category', formData.category)
      if (imageFile) formDataToSend.append('image', imageFile)
      else if (formData.imageUrl) formDataToSend.append('imageUrl', formData.imageUrl)

      if (isEditing) {
        await productAPI.update(id!, formDataToSend)
        showToast('success', 'Product updated')
      } else {
        await productAPI.create(formDataToSend)
        showToast('success', 'Product created')
      }
      navigate('/admin/products')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (isEditing && loading)) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="grid gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-sage-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <Link to="/admin/products" className="inline-flex items-center gap-2 text-sage-600 hover:text-brand-600 mb-4">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Back to Products
          </Link>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <CardHeader>
              <h2 className="font-semibold text-xl text-sage-950">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                name="name"
                label="Product Name"
                placeholder="e.g., Basmati Rice 1kg"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border bg-white text-sage-900 placeholder-sage-400 transition-all duration-200 resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                    errors.description ? 'border-red-300 focus:ring-red-500' : 'border-sage-200'
                  )}
                  placeholder="Describe the product..."
                  disabled={loading}
                />
                {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="price"
                  type="number"
                  label="Price (₹)"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
                <Input
                  name="stock"
                  type="number"
                  label="Stock Quantity"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  error={errors.stock}
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border bg-white text-sage-900 transition-all duration-200 appearance-none',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                    errors.category ? 'border-red-300 focus:ring-red-500' : 'border-sage-200'
                  )}
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {errors.category && <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>}
              </div>
            </CardContent>

            <CardHeader>
              <h2 className="font-semibold text-xl text-sage-950">Product Image</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-square max-w-xs rounded-xl overflow-hidden bg-sage-50 border-2 border-dashed border-sage-200">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <label className="flex h-full items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div className="flex flex-col items-center gap-2 text-sage-500 p-4">
                      <Image className="h-10 w-10" aria-hidden="true" />
                      <span className="font-medium">Upload Image</span>
                      <span className="text-sm">PNG, JPG up to 5MB</span>
                    </div>
                  </label>
                )}
              </div>
              {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
              {formData.imageUrl && !imagePreview && !imageFile && (
                <p className="text-sm text-sage-500">Current image will be kept if no new image is uploaded.</p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-8">
              <Link to="/admin/products">
                <Button variant="secondary" type="button" disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={loading} className="ml-auto sm:ml-0">
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}