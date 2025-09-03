'use client'

import { useCart } from '@/hooks/useCart'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const LoadingSkeleton = () => (
  <div className="grid lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <CartSummary cartItems={[]} totalAmount={0} loading />
  </div>
)

const EmptyCart = ({ error }: { error?: string | null }) => (
  <div className="text-center">
    <p className="text-gray-600 mb-8">{error || 'Your cart is empty'}</p>
    <Button asChild>
      <Link href="/products">Browse Products</Link>
    </Button>
  </div>
)

export default function CartPage() {
  const { cartItems, loading, error, totalAmount, isEmpty } = useCart()

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {loading ? (
        <LoadingSkeleton />
      ) : error || isEmpty ? (
        <EmptyCart error={error} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <CartSummary cartItems={cartItems} totalAmount={totalAmount} loading={loading} />
        </div>
      )}
    </div>
  )
}