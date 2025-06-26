'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const {
    cartItems,
    loading,
    getTotalAmount,
    getTotalItems,
    fetchCart,
    removeItem,
    updateQuantity
  } = useCart()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto text-center">
          <div className="max-w-md mx-auto">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button className="px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <div key={item.id}>
                      <CartItem
                        product={item.product}
                        quantity={item.quantity}
                      />
                      {index < cartItems.length - 1 && (
                        <hr className="my-6 border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link href="/products">
                    <Button variant="outline">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Summary Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CartSummary
                cartItems={cartItems}
                getTotalAmount={getTotalAmount}
                loading={loading}
              />

              {/* Security Message */}
              <div className="mt-4 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
