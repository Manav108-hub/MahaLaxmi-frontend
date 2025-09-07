'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import Image from 'next/image'
import { ShoppingCart, Heart, Share2, Minus, Plus, Truck, Shield, RotateCcw, AlertCircle } from 'lucide-react'
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

// Cache for sanitized products
const sanitizedProductCache = new Map<string, Product>()

const sanitizeProduct = (product: Product): Product => {
  const cacheKey = product.id
  
  if (sanitizedProductCache.has(cacheKey)) {
    return sanitizedProductCache.get(cacheKey)!
  }
  
  const sanitized = {
    ...product,
    name: product.name?.replace(/^["']|["']$/g, '').trim() || '',
    description: product.description?.replace(/^["']|["']$/g, '').trim() || '',
    stock: Number(product.stock) || 0,
    price: Number(product.price) || 0,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category || { id: '', name: 'Uncategorized', createdAt: '', updatedAt: '' }
  }
  
  sanitizedProductCache.set(cacheKey, sanitized)
  return sanitized
}

// Memoized static components
const LoadingState = memo(() => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  </div>
))
LoadingState.displayName = 'LoadingState'

const ErrorState = memo(({ error, onBrowseProducts }: { error: string; onBrowseProducts: () => void }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
        <AlertCircle className="h-8 w-8 text-pink-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{error}</h3>
      <p className="text-gray-600 mb-4">The product you requested could not be found.</p>
      <Button variant="default" onClick={onBrowseProducts} className="bg-pink-600 hover:bg-pink-700">
        Browse Products
      </Button>
    </div>
  </div>
))
ErrorState.displayName = 'ErrorState'

const ImageGallery = memo(({ images, productName, selectedImage, onImageSelect }: {
  images: string[]
  productName: string
  selectedImage: number
  onImageSelect: (index: number) => void
}) => {
  const displayImages = useMemo(() => 
    images.length ? images : ['/placeholder-product.jpg'], 
    [images]
  )
  
  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
        <Image
          src={displayImages[selectedImage]}
          alt={productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${
                selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image 
                src={image} 
                alt={`${productName} ${index + 1}`} 
                fill 
                className="object-cover" 
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
ImageGallery.displayName = 'ImageGallery'

const QuantitySelector = memo(({ quantity, maxQuantity, onIncrement, onDecrement }: {
  quantity: number
  maxQuantity: number
  onIncrement: () => void
  onDecrement: () => void
}) => (
  <div className="flex items-center gap-3">
    <Button variant="outline" size="sm" onClick={onDecrement} disabled={quantity <= 1}>
      <Minus className="w-4 h-4" />
    </Button>
    <span className="w-12 text-center font-medium">{quantity}</span>
    <Button variant="outline" size="sm" onClick={onIncrement} disabled={quantity >= maxQuantity}>
      <Plus className="w-4 h-4" />
    </Button>
  </div>
))
QuantitySelector.displayName = 'QuantitySelector'

const ProductFeatures = memo(() => (
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
))
ProductFeatures.displayName = 'ProductFeatures'

function ProductDetails({ product: initialProduct, error: initialError, loading: initialLoading = false, slug }: ProductDetailsProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(
    initialProduct ? sanitizeProduct(initialProduct) : null
  )
  const [error, setError] = useState<string | null>(initialError || null)
  const [loading, setLoading] = useState(initialLoading)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const { addToCart, loading: cartLoading } = useCart()

  // Memoized expensive calculations
  const isOutOfStock = useMemo(() => !product || product.stock <= 0, [product])
  const canAddToCart = useMemo(() => !isOutOfStock && !cartLoading && product !== null, [isOutOfStock, cartLoading, product])
  const maxQuantityReached = useMemo(() => product ? quantity >= product.stock : true, [quantity, product])
  const formattedPrice = useMemo(() => product ? formatPrice(product.price) : '', [product])

  useEffect(() => {
    const fetchProduct = async () => {
      if (initialProduct) {
        setProduct(sanitizeProduct(initialProduct))
        return
      }

      if (!slug || typeof slug !== 'string') {
        setError('Invalid product URL')
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const productData = await productService.getProductBySlug(slug)
        if (!productData) throw new Error('Product not found')
        
        setProduct(sanitizeProduct(productData))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load product details'
        setError(errorMessage)
        
        if (err instanceof Error && err.message.includes('not found')) {
          router.replace('/404')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug, router, initialProduct])

  useEffect(() => setSelectedImage(0), [product?.id])

  const handleAddToCart = useCallback(async () => {
    if (!product || !canAddToCart) return
    
    try {
      await addToCart(product.id, quantity)
      toast.success('Product added to cart')
    } catch (err) {
      toast.error('Failed to add product to cart')
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
      toast.error('Failed to share product')
    }
  }, [product])

  const incrementQuantity = useCallback(() => {
    if (!product || maxQuantityReached) return
    setQuantity(prev => Math.min(product.stock, prev + 1))
  }, [product, maxQuantityReached])

  const decrementQuantity = useCallback(() => setQuantity(prev => Math.max(1, prev - 1)), [])

  const toggleWishlist = useCallback(() => {
    setIsWishlisted(prev => !prev)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }, [isWishlisted])

  const handleBrowseProducts = useCallback(() => router.push('/products'), [router])

  if (loading) return <LoadingState />
  if (error || !product) return <ErrorState error={error || 'Product not found'} onBrowseProducts={handleBrowseProducts} />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImageGallery
          images={product.images}
          productName={product.name}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
        />

        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{product.category?.name || 'Uncategorized'}</Badge>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div className="text-3xl font-bold text-pink-600">{formattedPrice}</div>

          <Alert className={isOutOfStock ? "bg-red-50" : "bg-green-50"}>
            <AlertDescription className={isOutOfStock ? "text-red-600" : "text-green-600"}>
              {isOutOfStock ? '✗ Out of stock' : `✓ In stock (${product.stock} available)`}
            </AlertDescription>
          </Alert>

          {!isOutOfStock && (
            <QuantitySelector
              quantity={quantity}
              maxQuantity={product.stock}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
            />
          )}

          <Button className="w-full" onClick={handleAddToCart} disabled={!canAddToCart}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {cartLoading ? 'Adding...' : (isOutOfStock ? 'Out of Stock' : 'Add to Cart')}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={toggleWishlist}>
              <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator />
          <ProductFeatures />
          <Separator />

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-900">Product Description</h2>
            <p className="text-gray-600">{product.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ProductDetails)