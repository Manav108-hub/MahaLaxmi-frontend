'use client'

import { useState } from 'react'
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

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/lib/types'

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart, loading: cartLoading } = useCart()

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || '',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === index
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category.name}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price}
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <Alert>
                <AlertDescription className="text-green-600">
                  ✓ In stock ({product.stock} available)
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription className="text-red-600">
                  ✗ Out of stock
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity:</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartLoading}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={toggleWishlist}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${
                    isWishlisted ? 'fill-current text-red-500' : ''
                  }`}
                />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Separator />
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Free delivery on orders above ₹500</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>1 year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-4 h-4 text-orange-600" />
                <span>Easy 7-day return policy</span>s
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-3">
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
