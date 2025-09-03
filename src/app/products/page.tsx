'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Product, Category } from '@/lib/types'
import { productService } from '@/services/productService'
import ProductCard from '@/components/products/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

type SortOption = 'name' | 'price-low' | 'price-high'

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="glass-effect rounded-lg p-4 animate-pulse">
        <div className="h-48 bg-pink-200 rounded mb-4"></div>
        <div className="h-4 bg-pink-200 rounded mb-2"></div>
        <div className="h-6 bg-pink-100 rounded"></div>
      </div>
    ))}
  </div>
)

const EmptyResults = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
      <Filter className="h-8 w-8 text-pink-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
    <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
    <Button
      variant="outline"
      className="border-pink-300 text-pink-600 hover:bg-pink-50"
      onClick={onClearFilters}
    >
      Clear Filters
    </Button>
  </div>
)

const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories
}: {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  categories: Category[]
}) => (
  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
    <div className="relative w-full sm:w-auto">
      <Input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 w-full sm:w-64"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
    </div>

    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name">Sort by Name</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')

  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || 'all'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ])

        if (Array.isArray(productsRes.products)) {
          setProducts(productsRes.products)
        } else {
          console.error('Unexpected products data format:', productsRes)
        }

        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data)
        } else if (Array.isArray(categoriesRes)) {
          setCategories(categoriesRes)
        }

        setSelectedCategory(categoryFromUrl)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryFromUrl])

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price
          case 'price-high':
            return b.price - a.price
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [products, searchTerm, selectedCategory, sortBy])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Products</h1>
            <p className="text-gray-600 mt-2">Find all the products you need</p>
          </div>
          
          <FiltersSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={categories}
          />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  description: product.description || 'No description available',
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyResults onClearFilters={clearFilters} />
        )}
      </div>
    </div>
  )
}