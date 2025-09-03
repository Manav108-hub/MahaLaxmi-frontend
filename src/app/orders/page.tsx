'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { orderService } from '@/services/orderService'
import { Order } from '@/lib/types'
import Link from 'next/link'

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              <div className="h-4 bg-pink-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-pink-100 rounded w-32"></div>
            </div>
            <div className="h-6 bg-pink-100 rounded w-16"></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex gap-2">
                <div className="w-12 h-12 bg-pink-100 rounded"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-pink-200 rounded w-24"></div>
                  <div className="h-3 bg-pink-100 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const EmptyOrders = () => (
  <div className="text-center py-16 glass-effect rounded-lg">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
    <p className="text-gray-600 mb-6">Your order history will appear here once you start shopping</p>
    <Button asChild className="bg-pink-500 hover:bg-pink-600">
      <Link href="/products">Start Shopping</Link>
    </Button>
  </div>
)

const OrderItem = ({ item }: { item: Order['orderItems'][0] }) => (
  <div className="flex gap-2">
    <div className="relative w-12 h-12 bg-pink-100 rounded overflow-hidden">
      <img 
        src={item.product.images[0]} 
        alt={item.product.name}
        className="object-cover w-full h-full"
      />
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-gray-800">{item.product.name}</h4>
      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
    </div>
  </div>
)

const OrderCard = ({ order }: { order: Order }) => (
  <Card className="glass-effect border-pink-200">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
          order.deliveryStatus === 'DELIVERED' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {order.deliveryStatus}
        </span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {order.orderItems.slice(0, 2).map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
        {order.orderItems.length > 2 && (
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500">
              +{order.orderItems.length - 2} more items
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="font-bold">
            {order.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-pink-300 text-pink-600 hover:bg-pink-50">
          <Link href={`/orders/${order.id}`}>View Details</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
)

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getUserOrders()
        if (response.success && response.data) {
          setOrders(response.data.orders)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
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
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}