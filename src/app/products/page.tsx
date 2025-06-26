'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Product, Category } from '@/lib/types'
import { productService } from '@/services/productService'
import ProductCard from '@/components/products/ProductCard'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || 'all'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ])

        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data)
        }
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data)
        }
        setSelectedCategory(categoryFromUrl === '' ? 'all' : categoryFromUrl)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [categoryFromUrl])

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold gradient-text">Products</h1>
            <p className="text-gray-600 mt-2">
              Find all the hardware products you need
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val)
              }}
            >
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

            <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
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
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="glass-effect rounded-lg p-4 animate-pulse"
              >
                <div className="h-48 bg-pink-200 rounded mb-4"></div>
                <div className="h-4 bg-pink-200 rounded mb-2"></div>
                <div className="h-6 bg-pink-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
              <Filter className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}