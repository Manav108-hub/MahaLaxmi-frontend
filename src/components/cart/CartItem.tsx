'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { CartItem as CartItemType } from '@/lib/types'

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const { id: cartItemId, product, quantity } = item;

  console.log('🛒 CartItem render:', { cartItemId, productName: product?.name, quantity });

  const handleIncrement = async () => {
    console.log('➕ handleIncrement clicked:', { cartItemId, currentQuantity: quantity });
    
    if (quantity >= (product?.stock || 0)) {
      console.log('❌ Max stock reached');
      return;
    }
    
    setIsUpdating(true);
    try {
      console.log('📡 Calling updateQuantity...');
      const result = await updateQuantity(cartItemId, quantity + 1);
      console.log('📡 updateQuantity result:', result);
    } catch (error) {
      console.error('❌ Failed to increase quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  const handleDecrement = async () => {
    console.log('➖ handleDecrement clicked:', { cartItemId, currentQuantity: quantity });
    
    if (quantity <= 1) {
      console.log('❌ Min quantity reached');
      return;
    }
    
    setIsUpdating(true);
    try {
      console.log('📡 Calling updateQuantity...');
      const result = await updateQuantity(cartItemId, quantity - 1);
      console.log('📡 updateQuantity result:', result);
    } catch (error) {
      console.error('❌ Failed to decrease quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  const handleRemove = async () => {
    console.log('🗑️ handleRemove clicked:', { cartItemId });
    
    setIsUpdating(true);
    try {
      console.log('📡 Calling removeItem...');
      const result = await removeItem(cartItemId);
      console.log('📡 removeItem result:', result);
    } catch (error) {
      console.error('❌ Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b border-pink-200">
      <div className="relative w-20 h-20 bg-pink-100 rounded-lg overflow-hidden">
        <img 
          src={product?.images?.[0] || '/placeholder-image.jpg'} 
          alt={product?.name || 'Product'}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{product?.name || 'Unknown Product'}</h3>
        <p className="text-sm text-gray-600">
          {product?.category?.name || 'No category'}
        </p>
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
            disabled={isUpdating || quantity >= (product?.stock || 0)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-pink-600">
          {formatPrice((product?.price || 0) * quantity)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-500"
          onClick={handleRemove}
          disabled={isUpdating}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}