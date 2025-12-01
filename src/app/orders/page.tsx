'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { orderService } from '@/services/orderService'
import { Order } from '@/lib/types'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Package, Eye, Calendar, CreditCard } from 'lucide-react'
import Image from "next/image";

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-pink-200 rounded w-1/4"></div>
            <div className="h-3 bg-pink-100 rounded w-3/4"></div>
            <div className="h-3 bg-pink-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const EmptyOrders = () => (
  <div className="text-center py-16">
    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
    <Button asChild className="bg-pink-500 hover:bg-pink-600">
      <Link href="/products">Browse Products</Link>
    </Button>
  </div>
)

const OrderCard = ({ order }: { order: Order }) => {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
      case 'RETURNED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600'
      case 'FAILED':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <Card className="glass-effect border-pink-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">Order ID:</span>
              <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.deliveryStatus)}`}>
                {order.deliveryStatus}
              </span>
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {order.orderItems.length} item(s) • {formatPrice(order.totalAmount)}
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="flex gap-2">
            {order.orderItems.slice(0, 3).map((item) => (
              <div key={item.id} className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={500} // set your desired width
                  height={500} // set your desired height
                  className="w-full h-full object-cover"
                  priority // optional: improves LCP for above-the-fold images
                />
              </div>
            ))}
            {order.orderItems.length > 3 && (
              <div className="w-16 h-16 bg-pink-100 rounded flex items-center justify-center">
                <span className="text-sm font-medium text-pink-600">
                  +{order.orderItems.length - 3}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await orderService.getUserOrders()

        console.log('Orders response:', response)

        if (response.success && response.data) {
          setOrders(response.data.orders || [])
        } else {
          setError(response.error || 'Failed to fetch orders')
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">My Orders</h1>
          <Button asChild variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}