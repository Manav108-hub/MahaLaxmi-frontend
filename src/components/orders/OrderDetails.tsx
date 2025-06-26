import { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div>
        <h2 className="text-xl font-bold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex gap-4 border-b pb-4">
              <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                <img 
                  src={item.product.images[0]} 
                  alt={item.product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm text-pink-600 font-bold mt-1">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-pink-600">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Shipping Address */}
      <div>
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div className="space-y-2">
          <p className="font-medium">{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          <p>{order.shippingAddress.phone}</p>
        </div>
      </div>
      
      {/* Order Summary */}
      <div>
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Order ID</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Status</span>
            <span className={order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery Status</span>
            <span className={order.deliveryStatus === 'DELIVERED' ? 'text-green-600' : 'text-yellow-600'}>
              {order.deliveryStatus}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-pink-600">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}