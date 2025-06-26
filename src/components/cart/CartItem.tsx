'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/types'

interface CartItemProps {
  product: Product
  quantity: number
}

export default function CartItem({ product, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleIncrement = async () => {
    if (quantity >= product.stock) return
    
    setIsUpdating(true)
    try {
      await updateQuantity(product.id, quantity + 1)
    } catch (error) {
      console.error('Failed to increase quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDecrement = async () => {
    if (quantity <= 1) return
    
    setIsUpdating(true)
    try {
      await updateQuantity(product.id, quantity - 1)
    } catch (error) {
      console.error('Failed to decrease quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b border-pink-200">
      <div className="relative w-20 h-20 bg-pink-100 rounded-lg overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.category.name}</p>
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-pink-300"
            onClick={handleDecrement}
            disabled={isUpdating || quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-pink-300"
            onClick={handleIncrement}
            disabled={isUpdating || quantity >= product.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-pink-600">{formatPrice(product.price * quantity)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-500"
          onClick={() => removeItem(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}