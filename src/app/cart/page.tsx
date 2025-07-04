'use client'
import { useCart } from '@/hooks/useCart'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const {
    cartItems,
    loading,
    error,
    totalAmount, // Use totalAmount instead of getTotalAmount
    isEmpty
  } = useCart()

  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <CartSummary
            cartItems={[]}
            totalAmount={0} // Pass totalAmount directly
            loading={true}
          />
        </div>
      </div>
    )
  }

  if (error || isEmpty) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-8">
          {error || 'Your cart is empty'}
        </p>
        <Button asChild>
          <Link href="/products">
            Browse Products
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <CartSummary
          cartItems={cartItems}
          totalAmount={totalAmount} // Pass totalAmount directly instead of getTotalAmount
          loading={loading}
        />
      </div>
    </div>
  )
}