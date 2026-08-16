import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '../utils/cn'
import { Badge } from './Badge'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory?: string
  productCounts?: Record<string, number>
}

export function CategoryFilter({ categories, selectedCategory, productCounts }: CategoryFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const allCount = useMemo(() => {
    if (!productCounts) return 0
    return Object.values(productCounts).reduce((sum, count) => sum + count, 0)
  }, [productCounts])

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.delete('page')
    setSearchParams(params)
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Product categories">
      <button
        onClick={() => handleCategoryClick('all')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          selectedCategory === 'all' || !selectedCategory
            ? 'bg-brand-600 text-white shadow-soft'
            : 'bg-sage-100 text-sage-700 hover:bg-sage-200 hover:text-sage-900'
        )}
        aria-pressed={selectedCategory === 'all' || !selectedCategory}
      >
        All
        {allCount > 0 && (
          <Badge variant="default" className="ml-1.5 bg-white/20 text-white">
            {allCount}
          </Badge>
        )}
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selectedCategory === category
              ? 'bg-brand-600 text-white shadow-soft'
              : 'bg-sage-100 text-sage-700 hover:bg-sage-200 hover:text-sage-900'
          )}
          aria-pressed={selectedCategory === category}
        >
          {category}
          {productCounts && productCounts[category] !== undefined && (
            <Badge variant="default" className={cn('ml-1.5', selectedCategory === category ? 'bg-white/20 text-white' : '')}>
              {productCounts[category]}
            </Badge>
          )}
        </button>
      ))}
    </div>
  )
}