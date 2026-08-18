import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { productAPI } from '../services/api'
import { ProductCard } from '../components/ProductCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'
import { Card, CardContent } from '../components/Card'
import { Button } from '../components/Button'
import { cn } from '../utils/cn'
import { Sparkles, Truck, Shield, RotateCcw, Package, Search, ChevronRight } from 'lucide-react'

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll({ limit: 8 }),
          productAPI.getCategories()
        ])
        setFeaturedProducts(productsRes.products || [])
        setCategories(categoriesRes || [])

        const counts: Record<string, number> = {}
        productsRes.products?.forEach((p: any) => {
          counts[p.category] = (counts[p.category] || 0) + 1
        })
        setCategoryCounts(counts)
      } catch (err) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹500' },
    { icon: Shield, title: 'Quality Guaranteed', desc: 'Fresh & authentic products' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: Sparkles, title: 'Daily Offers', desc: 'New deals every day' }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-sage-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-sage-100 rounded w-3/4" />
                <div className="h-3 bg-sage-100 rounded w-1/2" />
                <div className="h-6 bg-sage-100 rounded w-1/4 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-cream-50 to-white py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-800 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              New arrivals every week
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-sage-950 leading-tight mb-6">
              Your Neighborhood{' '}
              <span className="text-brand-600">Variety Store</span>
            </h1>
            <p className="text-lg md:text-xl text-sage-600 mb-10 max-w-2xl mx-auto">
              Fresh groceries, household essentials, snacks & more — delivered to your doorstep. Simple, honest shopping for everyday needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Now
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center p-6 bg-white/50 rounded-2xl border border-sage-100 animate-in stagger-{index + 1}">
                <div className="flex h-12 w-12 items-center justify-center mx-auto mb-4 rounded-xl bg-brand-100 text-brand-600">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-sage-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-sage-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="page-title">Featured Products</h2>
            <p className="page-subtitle">Handpicked favorites from our aisles</p>
          </div>
          <Link to="/products" className="btn-outline self-end">
            View All
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} className="animate-in stagger-{index + 1}" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No products yet"
            description="Check back soon for new arrivals!"
          />
        )}
      </section>

      <section className="section bg-sage-50/50">
        <div className="container">
          <div className="mb-8">
            <h2 className="page-title">Shop by Category</h2>
            <p className="page-subtitle">Find exactly what you need</p>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            productCounts={categoryCounts}
          />
        </div>
      </section>

      <section className="section container">
        <div className="card bg-gradient-to-r from-brand-600 to-brand-700 p-8 md:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="h-12 w-12 mx-auto text-white/20 mb-6" aria-hidden="true" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-brand-100 mb-8 text-lg">
              We're always adding new products. Let us know what you'd like to see on our shelves.
            </p>
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
                Suggest a Product
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}