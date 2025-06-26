'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Product } from '@/lib/types'
import { productService } from '@/services/productService'
import { formatPrice, generateSlug, getProductFromSlug } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return
      
      try {
        const productsResponse = await productService.getProducts()
        if (productsResponse.success && productsResponse.data) {
          const foundProduct = getProductFromSlug(
            slug as string, 
            productsResponse.data
          )
          setProduct(foundProduct || null)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-pink-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-pink-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-pink-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-pink-200 rounded w-1/3"></div>
                <div className="h-4 bg-pink-200 rounded w-full"></div>
                <div className="h-4 bg-pink-200 rounded w-full"></div>
                <div className="h-10 bg-pink-200 rounded w-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center p-8 glass-effect rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-lg overflow-hidden glass-effect">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-pink-100">
                <span className="text-pink-400 text-4xl font-bold">{product.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-sm text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                {product.category.name}
              </span>
              <span className="text-sm text-gray-500">• {product.stock} in stock</span>
            </div>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <div className="mb-6">
              <span className="text-2xl font-bold text-pink-600">{formatPrice(product.price)}</span>
            </div>
            <div className="flex space-x-4">
              <Button 
                className="bg-pink-500 hover:bg-pink-600 flex-1"
                onClick={() => addToCart(product.id)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}