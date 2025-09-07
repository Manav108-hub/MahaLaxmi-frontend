'use client'

import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface CartSummaryProps {
  cartItems: any[]
  totalAmount: number
  loading: boolean
}

// Memoized summary details component
const SummaryDetails = memo(({ totalAmount }: { totalAmount: number }) => {
  const formattedTotal = useMemo(() => formatPrice(totalAmount), [totalAmount])
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">{formattedTotal}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium">Free</span>
      </div>
      <div className="border-t border-pink-200 pt-4 flex justify-between">
        <span className="font-bold">Total</span>
        <span className="font-bold text-pink-600">{formattedTotal}</span>
      </div>
    </div>
  )
})
SummaryDetails.displayName = 'SummaryDetails'

// Memoized action buttons component
const ActionButtons = memo(({ loading, hasItems }: { loading: boolean; hasItems: boolean }) => (
  <div className="mt-6 space-y-3">
    <Button 
      asChild
      className="w-full bg-pink-500 hover:bg-pink-600"
      disabled={loading || !hasItems}
    >
      <Link href="/checkout">
        Proceed to Checkout
      </Link>
    </Button>
    <Button 
      variant="outline" 
      className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
      asChild
    >
      <Link href="/products">
        Continue Shopping
      </Link>
    </Button>
  </div>
))
ActionButtons.displayName = 'ActionButtons'

function CartSummary({ cartItems, totalAmount, loading }: CartSummaryProps) {
  // Memoize calculated values
  const hasItems = useMemo(() => cartItems.length > 0, [cartItems.length])
  
  return (
    <div className="lg:sticky lg:top-24 max-w-md w-full">
      <div className="bg-white rounded-lg shadow-md p-6 glass-effect">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
        
        <SummaryDetails totalAmount={totalAmount} />
        
        <ActionButtons loading={loading} hasItems={hasItems} />
      </div>
    </div>
  )
}

export default memo(CartSummary)