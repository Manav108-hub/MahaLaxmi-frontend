import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/lib/types'

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            order.deliveryStatus === 'DELIVERED' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.deliveryStatus}
          </span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {order.orderItems.slice(0, 2).map((item) => (
          <div key={item.id} className="flex gap-2">
            <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
              <img 
                src={item.product.images[0]} 
                alt={item.product.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">{item.product.name}</h4>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
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
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-bold">{formatPrice(order.totalAmount)}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/orders/${order.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  )
}