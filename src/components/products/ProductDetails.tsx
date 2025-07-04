'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  AlertCircle,
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
import { productService } from '@/services/productService'

interface ProductDetailsProps {
  product?: Product | null
  error?: string | null
  loading?: boolean
  slug?: string
}

// Helper function to clean string data that might have extra quotes
const cleanString = (str: string | undefined): string => {
  if (!str) return '';
  return str.replace(/^["']|["']$/g, '').trim();
};

// Helper function to sanitize product data
const sanitizeProduct = (product: Product): Product => {
  return {
    ...product,
    name: cleanString(product.name),
    description: cleanString(product.description),
    // Ensure stock is a number
    stock: Number(product.stock) || 0,
    // Ensure price is a number
    price: Number(product.price) || 0,
    // Ensure images is an array
    images: Array.isArray(product.images) ? product.images : [],
    // Ensure category exists
    category: product.category || { id: '', name: 'Uncategorized', createdAt: '', updatedAt: '' }
  };
};

export default function ProductDetails({ 
  product: initialProduct, 
  error: initialError, 
  loading: initialLoading = false,
  slug
}: ProductDetailsProps) {
  const router = useRouter()
  
  // Component state
  const [product, setProduct] = useState<Product | null>(
    initialProduct ? sanitizeProduct(initialProduct) : null
  )
  const [error, setError] = useState<string | null>(initialError || null)
  const [loading, setLoading] = useState(initialLoading)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const { addToCart, loading: cartLoading } = useCart()

  // Fetch product effect
  useEffect(() => {
    const fetchProduct = async () => {
      // If product is already provided, don't fetch
      if (initialProduct) {
        setProduct(sanitizeProduct(initialProduct))
        return
      }

      // If no slug provided, return early
      if (!slug || typeof slug !== 'string') {
        setError('Invalid product URL')
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching product with slug:', slug)
        
        const productData = await productService.getProductBySlug(slug)
        
        if (!productData) {
          throw new Error('Product not found')
        }
        
        // Sanitize the product data before setting it
        const sanitizedProduct = sanitizeProduct(productData)
        console.log('Sanitized product data:', sanitizedProduct)
        
        setProduct(sanitizedProduct)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load product details'
        setError(errorMessage)
        
        // Redirect to 404 page if product not found
        if (err instanceof Error && err.message.includes('not found')) {
          router.replace('/404')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug, router, initialProduct])

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImage(0)
  }, [product?.id])

  // Memoized derived values
  const isOutOfStock = useMemo(() => {
    // console.log('Checking stock:', product?.stock, 'Type:', typeof product?.stock)
    return !product || product.stock <= 0
  }, [product])
  
  const canAddToCart = useMemo(() => {
    const result = !isOutOfStock && !cartLoading && product !== null
    // console.log('Can add to cart:', result, {
    //   isOutOfStock,
    //   cartLoading,
    //   hasProduct: product !== null,
    //   productStock: product?.stock
    // })
    return result
  }, [isOutOfStock, cartLoading, product])
  
  const maxQuantityReached = useMemo(() => 
    product ? quantity >= product.stock : true, 
    [quantity, product]
  )

  const productImages = useMemo(() => 
    product?.images?.length ? product.images : ['/placeholder-product.jpg'], 
    [product?.images]
  )

  // Handlers
  const handleAddToCart = useCallback(async () => {
    if (!product || !canAddToCart) {
      console.log('Cannot add to cart:', { product: !!product, canAddToCart })
      return
    }
    
    try {
      console.log('Adding to cart:', { productId: product.id, quantity })
      await addToCart(product.id, quantity)
      toast.success('Product added to cart')
    } catch (err) {
      toast.error('Failed to add product to cart')
      console.error('Failed to add to cart:', err)
    }
  }, [product, quantity, addToCart, canAddToCart])

  const handleShare = useCallback(async () => {
    if (!product) return
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description || '',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Product link copied to clipboard')
      }
    } catch (err) {
      console.error('Sharing failed:', err)
      toast.error('Failed to share product')
    }
  }, [product])

  const incrementQuantity = useCallback(() => {
    if (!product || maxQuantityReached) return
    setQuantity(prev => Math.min(product.stock, prev + 1))
  }, [product, maxQuantityReached])

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(1, prev - 1))
  }, [])

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index)
  }, [])

  const toggleWishlist = useCallback(() => {
    setIsWishlisted(prev => !prev)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }, [isWishlisted])

  // Debug logging
  useEffect(() => {
    if (product) {
      console.log('Product state updated:', {
        id: product.id,
        name: product.name,
        stock: product.stock,
        stockType: typeof product.stock,
        price: product.price,
        isOutOfStock,
        canAddToCart
      })
    }
  }, [product, isOutOfStock, canAddToCart])

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
            <AlertCircle className="h-8 w-8 text-pink-500" />
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

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={productImages[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${
                    selectedImage === index
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selectedImage === index ? 'true' : 'false'}
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

          <Alert className={isOutOfStock ? "bg-red-50" : "bg-green-50"}>
            <AlertDescription className={isOutOfStock ? "text-red-600" : "text-green-600"}>
              {isOutOfStock ? (
                <span>✗ Out of stock</span>
              ) : (
                <span>✓ In stock ({product.stock} available)</span>
              )}
            </AlertDescription>
          </Alert>

          {!isOutOfStock && (
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
                disabled={maxQuantityReached}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {cartLoading ? 'Adding...' : (
              isOutOfStock ? 'Out of Stock' : 'Add to Cart'
            )}
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={toggleWishlist}
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
            <h2 className="font-semibold text-gray-900">Product Description</h2>
            <p className="text-gray-600">
              {product.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}