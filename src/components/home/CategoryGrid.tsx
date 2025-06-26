'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { productService } from '@/services/productService'
import { Category } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories()
        if (response.success && response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-effect animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-pink-200 rounded mb-2"></div>
                  <div className="h-4 bg-pink-100 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of hardware categories to find exactly what you need
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description || 'Explore our collection'}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}