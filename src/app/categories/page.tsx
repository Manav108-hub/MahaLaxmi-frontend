'use client'

import { useEffect, useState, memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { productService } from '@/services/productService'
import { Category } from '@/lib/types'
import { ArrowRight, Package } from 'lucide-react'

// Cache for categories data
const categoriesCache = new Map<string, { data: Category[]; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Memoized loading skeleton
const LoadingSkeleton = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Product Categories</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-effect animate-pulse">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-pink-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-pink-200 rounded mb-2"></div>
              <div className="h-4 bg-pink-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
))
LoadingSkeleton.displayName = 'LoadingSkeleton'

// Memoized error state
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Product Categories</h1>
      </div>
      <div className="text-center py-12 bg-pink-50 rounded-lg">
        <Package className="h-16 w-16 text-pink-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Categories</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
))
ErrorState.displayName = 'ErrorState'

// Memoized category card
const CategoryCard = memo(({ category }: { category: Category }) => (
  <Link key={category.id} href={`/products?category=${category.id}`}>
    <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-pink-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-pink-600" />
          </div>
          <ArrowRight className="h-5 w-5 text-pink-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {category.name}
        </h3>
        <p className="text-gray-600">
          {category.description || 'Explore our wide range of products in this category'}
        </p>
        <div className="mt-4 text-sm text-pink-600 font-medium">
          View Products →
        </div>
      </CardContent>
    </Card>
  </Link>
))
CategoryCard.displayName = 'CategoryCard'

// Memoized empty state
const EmptyState = memo(({ onRefresh }: { onRefresh: () => void }) => (
  <div className="text-center py-12">
    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
    <p className="text-gray-500">We currently don&apos;t have any categories available</p>
    <button
      onClick={onRefresh}
      className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
    >
      Refresh
    </button>
  </div>
))
EmptyState.displayName = 'EmptyState'

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch function with caching
  const fetchCategories = useCallback(async () => {
    const cacheKey = 'categories_list'
    
    // Check cache first
    const cached = categoriesCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setCategories(cached.data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await productService.getCategories()
      console.log('Categories API Response:', response)

      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data)
        
        // Cache the successful response
        categoriesCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })
      } else {
        console.error('Unexpected categories data format:', response)
        setError('Received categories in unexpected format')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setError('An error occurred while fetching categories')
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoized retry handler
  const handleRetry = useCallback(() => {
    // Clear cache on retry
    categoriesCache.clear()
    fetchCategories()
  }, [fetchCategories])

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Debugging: Log current state
  useEffect(() => {
    console.log('Current categories state:', categories)
  }, [categories])

  // Memoized rendered categories
  const renderedCategories = useMemo(() => 
    categories.map((category) => (
      <CategoryCard key={category.id} category={category} />
    )), 
    [categories]
  )

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={handleRetry} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Product Categories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our comprehensive range of hardware categories to find exactly what you need
          </p>
        </div>

        {categories.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderedCategories}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(CategoriesPage)