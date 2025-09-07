'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { productService } from '@/services/productService'
import ProductCard from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'

// Simple cache for featured products
const featuredCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedFeatured = () => {
  const cached = featuredCache.get('featured');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedFeatured = (data: Product[]) => {
  featuredCache.set('featured', { data, timestamp: Date.now() });
};

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

const SectionHeader = () => (
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Discover our most popular and high-quality hardware products
    </p>
  </div>
)

const ViewAllButton = () => (
  <div className="text-center">
    <Button asChild size="lg" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
      <Link href="/products">View All Products</Link>
    </Button>
  </div>
)

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Check cache first
        const cachedProducts = getCachedFeatured();
        if (cachedProducts) {
          setProducts(cachedProducts);
          setLoading(false);
          return;
        }
        
        const response = await productService.getProducts()
        if (response.success && response.data) {
          const featuredProducts = response.data.slice(0, 8);
          setProducts(featuredProducts)
          
          // Cache the result
          setCachedFeatured(featuredProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4">
        <SectionHeader />
        
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <ViewAllButton />
          </>
        )}
      </div>
    </section>
  )
}