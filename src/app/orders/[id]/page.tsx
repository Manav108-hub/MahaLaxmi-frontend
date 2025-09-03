'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { orderService } from '@/services/orderService'
import { Order } from '@/lib/types'
import Link from 'next/link'

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="glass-effect animate-pulse">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-pink-100 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                <div className="h-3 bg-pink-100 rounded w-1/2"></div>
                <div className="h-3 bg-pink-100 rounded w-1/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="glass-effect animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-pink-200 rounded w-1/2"></div>
          <div className="h-3 bg-pink-100 rounded w-3/4"></div>
          <div className="h-3 bg-pink-100 rounded w-full"></div>
          <div className="h-3 bg-pink-100 rounded w-2/3"></div>
        </div>
      </CardContent>
    </Card>
  </div>
)

const OrderNotFound = () => (
  <div className="text-center py-16">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h1>
    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
    <Button asChild variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
      <Link href="/orders">Back to Orders</Link>
    </Button>
  </div>
)

const OrderItem = ({ item }: { item: Order['orderItems'][0] }) => (
  <div className="flex gap-4 border-b border-pink-200 pb-4 last:border-b-0">
    <div className="relative w-16 h-16 bg-pink-100 rounded overflow-hidden">
      <img 
        src={item.product.images[0]} 
        alt={item.product.name}
        className="object-cover w-full h-full"
      />
    </div>
    <div className="flex-1">
      <h3 className="font-medium text-gray-800">{item.product.name}</h3>
      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
      <p className="text-sm text-pink-600 font-bold mt-1">
        {item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
      </p>
    </div>
    <div className="text-right">
      <p className="font-bold text-pink-600">
        {(item.price * item.quantity).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
      </p>
    </div>
  </div>
)

const ShippingAddress = ({ address }: { address: Order['shippingAddress'] }) => (
  <Card className="glass-effect border-pink-200">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
      <div className="space-y-2">
        <p className="font-medium">{address.name}</p>
        <p>{address.address}</p>
        <p>{address.city}, {address.state} - {address.pincode}</p>
        <p>{address.phone}</p>
      </div>
    </CardContent>
  </Card>
)

const OrderSummary = ({ order }: { order: Order }) => {
  const getStatusColor = (status: string) => 
    status === 'PAID' || status === 'DELIVERED' ? 'text-green-600' : 'text-yellow-600'

  return (
    <Card className="glass-effect border-pink-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Status</span>
            <span className={`font-medium ${getStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Status</span>
            <span className={`font-medium ${getStatusColor(order.deliveryStatus)}`}>
              {order.deliveryStatus}
            </span>
          </div>
          <div className="pt-3 border-t border-pink-200 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-pink-600">
              {order.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrderDetailsPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return
      
      try {
        const response = await orderService.getOrderById(params.id as string)
        if (response.success && response.data) {
          setOrder(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">
            {order ? `Order #${order.id.slice(0, 8)}` : 'Order Details'}
          </h1>
          <Button asChild variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : !order ? (
          <OrderNotFound />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-effect border-pink-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <OrderItem key={item.id} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <ShippingAddress address={order.shippingAddress} />
            </div>
            
            <OrderSummary order={order} />
          </div>
        )}
      </div>
    </div>
  )
}