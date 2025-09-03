'use client'

import { useState, useEffect, useMemo } from 'react'
import { Filter, SortAsc, Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import ProductCard from '@/components/products/ProductCard'
import { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  categories?: string[]
  onFilterChange?: (filters: ProductFilters) => void
}

interface ProductFilters {
  category?: string
  priceRange?: [number, number]
  sortBy?: string
  inStock?: boolean
}

const PRICE_RANGES = [
  { label: 'Under ₹500', value: '0-500' },
  { label: '₹500 - ₹1,000', value: '500-1000' },
  { label: '₹1,000 - ₹2,500', value: '1000-2500' },
  { label: '₹2,500 - ₹5,000', value: '2500-5000' },
  { label: 'Above ₹5,000', value: '5000-999999' }
]

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Name A-Z', value: 'name-asc' },
  { label: 'Name Z-A', value: 'name-desc' },
  { label: 'Price: Low to High', value: 'price-low-high' },
  { label: 'Price: High to Low', value: 'price-high-low' },
  { label: 'Newest First', value: 'newest' }
]

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const EmptyResults = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <Card>
    <CardContent className="p-12 text-center">
      <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
      <Button variant="outline" onClick={onClearFilters}>Clear Filters</Button>
    </CardContent>
  </Card>
)

const FilterPanel = ({ 
  filters, 
  categories, 
  onFilterUpdate, 
  onClearFilters, 
  activeFiltersCount 
}: {
  filters: ProductFilters
  categories: string[]
  onFilterUpdate: (key: keyof ProductFilters, value: any) => void
  onClearFilters: () => void
  activeFiltersCount: number
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold mb-3">Category</h3>
      <Select value={filters.category || 'all'} onValueChange={(value) => onFilterUpdate('category', value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <h3 className="font-semibold mb-3">Price Range</h3>
      <Select
        value={filters.priceRange ? `${filters.priceRange[0]}-${filters.priceRange[1]}` : 'all'}
        onValueChange={(value) => {
          if (value === 'all') {
            onFilterUpdate('priceRange', undefined)
          } else {
            const [min, max] = value.split('-').map(Number)
            onFilterUpdate('priceRange', [min, max])
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Prices" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Prices</SelectItem>
          {PRICE_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="inStock"
        checked={filters.inStock || false}
        onChange={(e) => onFilterUpdate('inStock', e.target.checked || undefined)}
        className="rounded border-gray-300"
      />
      <label htmlFor="inStock" className="text-sm font-medium">In Stock Only</label>
    </div>

    {activeFiltersCount > 0 && (
      <Button variant="outline" onClick={onClearFilters} className="w-full">
        Clear All Filters
      </Button>
    )}
  </div>
)

const ViewModeToggle = ({ viewMode, onViewModeChange }: {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}) => (
  <div className="hidden sm:flex border rounded-lg p-1">
    <Button
      variant={viewMode === 'grid' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onViewModeChange('grid')}
    >
      <Grid3X3 className="w-4 h-4" />
    </Button>
    <Button
      variant={viewMode === 'list' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onViewModeChange('list')}
    >
      <List className="w-4 h-4" />
    </Button>
  </div>
)

export default function ProductGrid({ products, loading = false, categories = [], onFilterChange }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category.name.toLowerCase() === filters.category?.toLowerCase()
      )
    }

    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange![0] && product.price <= filters.priceRange![1]
      )
    }

    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0)
    }

    if (filters.sortBy && filters.sortBy !== 'default') {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-low-high': return a.price - b.price
          case 'price-high-low': return b.price - a.price
          case 'name-asc': return a.name.localeCompare(b.name)
          case 'name-desc': return b.name.localeCompare(a.name)
          case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          default: return 0
        }
      })
    }

    return filtered
  }, [products, filters])

  const activeFiltersCount = useMemo(() => 
    Object.values(filters).filter(value => value !== undefined && value !== 'all').length,
    [filters]
  )

  useEffect(() => {
    onFilterChange?.(filters)
  }, [filters, onFilterChange])

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }))
  }

  const clearFilters = () => setFilters({})

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 px-1.5 py-0.5 text-xs">{activeFiltersCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel
                  filters={filters}
                  categories={categories}
                  onFilterUpdate={updateFilter}
                  onClearFilters={clearFilters}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-sm text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filters.sortBy || 'default'} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-48">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block w-64 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                {activeFiltersCount > 0 && <Badge>{activeFiltersCount}</Badge>}
              </div>
              <Separator className="mb-4" />
              <FilterPanel
                filters={filters}
                categories={categories}
                onFilterUpdate={updateFilter}
                onClearFilters={clearFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <EmptyResults onClearFilters={clearFilters} />
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} layout={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}