import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { memo } from 'react'

// Cache static footer data since it rarely changes
const companyInfo = {
  phone: '+91 98765 43210',
  email: 'info@mahalaxmihardware.com',
  address: '123 Hardware Street, Mumbai, Maharashtra',
  description: 'Your trusted partner for all hardware needs. Quality products, competitive prices, and exceptional service for over a decade.'
}

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Categories', href: '/categories' },
  { name: 'Products', href: '/products' },
]

const customerServiceLinks = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'Track Order', href: '/orders' },
  { name: 'Returns', href: '/returns' },
  { name: 'Support', href: '/support' },
]

function Footer() {
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
              {companyInfo.description}
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{companyInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{companyInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{companyInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 hover:text-pink-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {customerServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 hover:text-pink-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
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

// Memoize the entire footer since it's static content
export default memo(Footer)