'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productService } from '@/services/productService'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ProductDetails from '@/components/products/ProductDetails'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Simple cache for product details
const productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedProduct = (slug: string) => {
  const cached = productCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedProduct = (slug: string, data: Product) => {
  productCache.set(slug, { data, timestamp: Date.now() });
};

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

const ErrorState = ({ error, onGoBack, onBrowseProducts }: {
  error: string | null
  onGoBack: () => void
  onBrowseProducts: () => void
}) => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex flex-col items-center justify-center gap-6 text-center px-4">
    <div className="max-w-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
      <p className="text-gray-600">{error || 'The product you requested could not be found.'}</p>
      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant="outline"
          onClick={onGoBack}
          className="border-pink-300 text-pink-600 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button 
          variant="default"
          onClick={onBrowseProducts}
          className="bg-pink-600 hover:bg-pink-700"
        >
          Browse Products
        </Button>
      </div>
    </div>
  </div>
)

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug || typeof slug !== 'string') {
        setError('Invalid product URL')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Check cache first
        const cachedProduct = getCachedProduct(slug);
        if (cachedProduct) {
          setProduct(cachedProduct);
          setLoading(false);
          return;
        }
        
        const productData = await productService.getProductBySlug(slug)
        setProduct(productData)
        
        // Cache the result
        setCachedProduct(slug, productData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load product details'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  const handleGoBack = () => router.back()
  const handleBrowseProducts = () => router.push('/products')

  if (loading) return <LoadingState />
   
  if (error || !product) {
    return (
      <ErrorState 
        error={error}
        onGoBack={handleGoBack}
        onBrowseProducts={handleBrowseProducts}
      />
    )
  }

  return <ProductDetails product={product} />
}