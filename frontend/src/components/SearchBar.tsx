import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { cn } from '../utils/cn'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = 'Search products...', className }: SearchBarProps) {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }
    params.delete('page')
    setSearchParams(params)
  }

  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.delete('page')
    setSearchParams(params)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full max-w-md', className)}>
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" aria-hidden="true" />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 rounded-xl border border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-sage-400 hover:text-sage-600 rounded-lg hover:bg-sage-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  )
}