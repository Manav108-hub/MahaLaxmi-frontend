'use client'

import { useState, memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { CartItem as CartItemType } from '@/lib/types'

interface CartItemProps {
  item: CartItemType;
}

// Memoized product image component
const ProductImage = memo(({ product }: { product: CartItemType['product'] }) => (
  <div className="relative w-20 h-20 bg-pink-100 rounded-lg overflow-hidden">
    <img 
      src={product?.images?.[0] || '/placeholder-image.jpg'} 
      alt={product?.name || 'Product'}
      className="object-cover w-full h-full"
      loading="lazy"
    />
  </div>
))
ProductImage.displayName = 'ProductImage'

// Memoized product info component
const ProductInfo = memo(({ product }: { product: CartItemType['product'] }) => (
  <div className="flex-1">
    <h3 className="font-medium text-gray-800">{product?.name || 'Unknown Product'}</h3>
    <p className="text-sm text-gray-600">
      {product?.category?.name || 'No category'}
    </p>
  </div>
))
ProductInfo.displayName = 'ProductInfo'

// Memoized quantity controls
const QuantityControls = memo(({ 
  quantity, 
  isUpdating, 
  onDecrement, 
  onIncrement, 
  maxStock 
}: {
  quantity: number
  isUpdating: boolean
  onDecrement: () => void
  onIncrement: () => void
  maxStock: number
}) => (
  <div className="mt-2 flex items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 border-pink-300"
      onClick={onDecrement}
      disabled={isUpdating || quantity <= 1}
    >
      <Minus className="h-3 w-3" />
    </Button>
    <span className="w-8 text-center">{quantity}</span>
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 border-pink-300"
      onClick={onIncrement}
      disabled={isUpdating || quantity >= maxStock}
    >
      <Plus className="h-3 w-3" />
    </Button>
  </div>
))
QuantityControls.displayName = 'QuantityControls'

// Memoized price and remove section
const PriceSection = memo(({ 
  formattedTotal, 
  isUpdating, 
  onRemove 
}: {
  formattedTotal: string
  isUpdating: boolean
  onRemove: () => void
}) => (
  <div className="text-right">
    <p className="font-bold text-pink-600">{formattedTotal}</p>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-gray-400 hover:text-red-500"
      onClick={onRemove}
      disabled={isUpdating}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
))
PriceSection.displayName = 'PriceSection'

function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const { id: cartItemId, product, quantity } = item

  // Memoize expensive calculations
  const formattedTotal = useMemo(() => 
    formatPrice((product?.price || 0) * quantity), 
    [product?.price, quantity]
  )
  
  const maxStock = useMemo(() => product?.stock || 0, [product?.stock])

  const handleIncrement = useCallback(async () => {
    console.log('➕ handleIncrement clicked:', { cartItemId, currentQuantity: quantity })
    
    if (quantity >= maxStock) {
      console.log('❌ Max stock reached')
      return
    }
    
    setIsUpdating(true)
    try {
      console.log('📡 Calling updateQuantity...')
      const result = await updateQuantity(cartItemId, quantity + 1)
      console.log('📡 updateQuantity result:', result)
    } catch (error) {
      console.error('❌ Failed to increase quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [cartItemId, quantity, maxStock, updateQuantity])

  const handleDecrement = useCallback(async () => {
    console.log('➖ handleDecrement clicked:', { cartItemId, currentQuantity: quantity })
    
    if (quantity <= 1) {
      console.log('❌ Min quantity reached')
      return
    }
    
    setIsUpdating(true)
    try {
      console.log('📡 Calling updateQuantity...')
      const result = await updateQuantity(cartItemId, quantity - 1)
      console.log('📡 updateQuantity result:', result)
    } catch (error) {
      console.error('❌ Failed to decrease quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [cartItemId, quantity, updateQuantity])

  const handleRemove = useCallback(async () => {
    console.log('🗑️ handleRemove clicked:', { cartItemId })
    
    setIsUpdating(true)
    try {
      console.log('📡 Calling removeItem...')
      const result = await removeItem(cartItemId)
      console.log('📡 removeItem result:', result)
    } catch (error) {
      console.error('❌ Failed to remove item:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [cartItemId, removeItem])

  console.log('🛒 CartItem render:', { cartItemId, productName: product?.name, quantity })

  return (
    <div className="flex items-center gap-4 p-4 border-b border-pink-200">
      <ProductImage product={product} />
      
      <ProductInfo product={product} />
      
      <QuantityControls
        quantity={quantity}
        isUpdating={isUpdating}
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        maxStock={maxStock}
      />
      
      <PriceSection
        formattedTotal={formattedTotal}
        isUpdating={isUpdating}
        onRemove={handleRemove}
      />
    </div>
  )
}

export default memo(CartItem)