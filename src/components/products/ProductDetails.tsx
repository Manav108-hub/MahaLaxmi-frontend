'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProductDetailsProps {
  product?: Product | null;
  error?: string | null;
  loading?: boolean;
}

export default function ProductDetails({ 
  product, 
  error, 
  loading = false 
}: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart, loading: cartLoading } = useCart()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity)
      toast.success('Product added to cart')
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Failed to add to cart:', error)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name || '',
          text: product?.description || '',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Product link copied to clipboard')
      }
    } catch (error) {
      console.error('Sharing failed:', error)
    }
  }

  const incrementQuantity = () => {
    if (!product) return;
    setQuantity(prev => Math.min(product.stock, prev + 1))
  }

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
            <Alert className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'Product not found'}
          </h3>
          <p className="text-gray-600 mb-4">
            The product you requested could not be found.
          </p>
          <Button
            variant="default"
            onClick={() => router.push('/products')}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${
                    selectedImage === index
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image 
                    src={image} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    fill 
                    className="object-cover" 
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category?.name || 'Uncategorized'}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div className="text-3xl font-bold text-pink-600">
            {formatPrice(product.price)}
          </div>

          {product.stock > 0 ? (
            <Alert className="bg-green-50">
              <AlertDescription className="text-green-600 flex items-center gap-1">
                <span>✓</span> In stock ({product.stock} available)
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50">
              <AlertDescription className="text-red-600 flex items-center gap-1">
                <span>✗</span> Out of stock
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={decrementQuantity} 
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={incrementQuantity} 
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || cartLoading}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShare}
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Truck className="text-green-600 w-4 h-4" />
              Free delivery on orders above ₹500
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="text-blue-600 w-4 h-4" />
              1 year warranty included
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <RotateCcw className="text-orange-600 w-4 h-4" />
              Easy 7-day return policy
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Product Description</h3>
            <p className="text-gray-600">
              {product.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}