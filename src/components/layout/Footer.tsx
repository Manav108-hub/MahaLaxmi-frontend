import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-50 to-white border-t border-pink-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <span className="text-xl font-bold gradient-text">MahaLaxmi Hardware</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Your trusted partner for all hardware needs. Quality products, competitive prices, and exceptional service for over a decade.
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>info@mahalaxmihardware.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>123 Hardware Street, Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-pink-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2024 MahaLaxmi Hardware. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}