import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productAPI } from '../services/api'
import { ProductCard } from '../components/ProductCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { cn } from '../utils/cn'
import { Package, Filter, X } from 'lucide-react'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 })

  const selectedCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 20
        }),
        productAPI.getCategories()
      ])
      setProducts(productsRes.products || [])
      setCategories(categoriesRes || [])
      setPagination({
        totalPages: productsRes.totalPages || 1,
        currentPage: productsRes.currentPage || 1,
        total: productsRes.total || 0
      })

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
  }, [selectedCategory, searchQuery, currentPage])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    productAPI.getCategories().then(res => setCategories(res || []))
  }, [])

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.delete('page')
    setSearchParams(params)
  }

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }
    params.delete('page')
    setSearchParams(params)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    setSearchParams(params)
  }

  const hasFilters = selectedCategory !== 'all' || searchQuery

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-8">
        <div className="container animate-pulse space-y-6">
          <div className="h-8 bg-sage-100 rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <section className="bg-white border-b border-sage-100 py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-sage-950">
                All Products
              </h1>
              <p className="text-sage-600 mt-1">
                {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
              </p>
            </div>
            <SearchBar placeholder="Search products..." className="w-full md:w-80" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              productCounts={categoryCounts}
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto md:ml-0">
                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} className="animate-in stagger-{index + 1}" />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.currentPage === pageNum ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          aria-label={`Page ${pageNum}`}
                          aria-current={pagination.currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Package className="h-12 w-12" />}
              title="No products found"
              description={searchQuery
                ? `No products match "${searchQuery}". Try a different search term.`
                : selectedCategory !== 'all'
                ? `No products in "${selectedCategory}" category yet.`
                : "We're still stocking our shelves. Check back soon!"}
              action={{
                label: hasFilters ? 'Clear filters' : 'Browse Categories',
                onClick: hasFilters ? clearFilters : () => {},
                variant: 'outline'
              }}
            />
          )}
        </div>
      </section>
    </div>
  )
}