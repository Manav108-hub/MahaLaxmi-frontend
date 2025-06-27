'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productService } from '@/services/productService'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ProductDetails from '@/components/products/ProductDetails'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!slug || typeof slug !== 'string') {
          throw new Error('Invalid product URL')
        }

        const productData = await productService.getProductBySlug(slug)
        setProduct(productData)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
          <p className="text-gray-600">{error || 'The product you requested could not be found.'}</p>
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()} 
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              variant="default" 
              onClick={() => router.push('/products')}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <ProductDetails product={product} />
}