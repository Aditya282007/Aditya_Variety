import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader, CardFooter } from '../components/Card'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { ProductCard } from '../components/ProductCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { SearchBar } from '../components/SearchBar'
import { formatPrice } from '../utils/cn'
import { cn } from '../utils/cn'
import { Plus, Loader2, ChevronRight, Trash2, Edit, Package, Filter, X, AlertTriangle } from 'lucide-react'

export function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const selectedCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const showLowStock = searchParams.get('lowStock') === 'true'
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login', { replace: true })
    }
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user, authLoading, navigate, selectedCategory, searchQuery, currentPage, showLowStock])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 20
        }),
        productAPI.getCategories()
      ])
      setProducts(productsRes.data.products || [])
      setCategories(categoriesRes.data || [])
      setPagination({
        totalPages: productsRes.data.totalPages || 1,
        currentPage: productsRes.data.currentPage || 1,
        total: productsRes.data.total || 0
      })

      const counts: Record<string, number> = {}
      productsRes.data.products?.forEach((p: any) => {
        counts[p.category] = (counts[p.category] || 0) + 1
      })
      setCategoryCounts(counts)
    } catch (err) {
      showToast('error', 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') params.delete('category')
    else params.set('category', category)
    params.delete('page')
    params.delete('lowStock')
    setSearchParams(params)
  }

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query.trim()) params.set('search', query.trim())
    else params.delete('search')
    params.delete('page')
    setSearchParams(params)
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeletingId(id)
    try {
      await productAPI.delete(id)
      showToast('success', 'Product deleted')
      fetchData()
    } catch (err) {
      showToast('error', 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const hasFilters = selectedCategory !== 'all' || searchQuery || showLowStock

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="aspect-square bg-sage-100 rounded-lg" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-sage-100 rounded w-3/4" />
                  <div className="h-3 bg-sage-100 rounded w-1/2" />
                  <div className="h-6 bg-sage-100 rounded w-1/4" />
                </div>
              </div>
            ))}
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
            <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">Products</h1>
            <p className="text-sage-600 mt-1">{pagination.total} product{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <SearchBar placeholder="Search products..." className="w-full md:w-80" />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                productCounts={categoryCounts}
              />
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto md:ml-0">
                  <X className="h-4 w-4 mr-1" aria-hidden="true" />
                  Clear
                </Button>
              )}
              <Link to={`/admin/products?lowStock=true`} className={cn('btn-secondary', showLowStock && 'bg-amber-100 text-amber-800 border-amber-200')}>
                <AlertTriangle className="h-4 w-4 mr-1" aria-hidden="true" />
                Low Stock
              </Link>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      variant="compact"
                      className="animate-in stagger-{index + 1}"
                    >
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="p-2 rounded-lg bg-white/90 text-sage-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          aria-label="Edit product"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(product._id) }}
                          disabled={deletingId === product._id}
                          className="p-2 rounded-lg bg-white/90 text-sage-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label="Delete product"
                        >
                          {deletingId === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </ProductCard>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
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
              </>
            ) : (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title={searchQuery ? `No results for "${searchQuery}"` : selectedCategory !== 'all' ? `No products in "${selectedCategory}"` : showLowStock ? 'No low stock products' : 'No products yet'}
                description={searchQuery ? 'Try a different search term.' : 'Add your first product to get started.'}
                action={{ label: 'Add Product', onClick: () => navigate('/admin/products/new'), variant: 'primary' }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}