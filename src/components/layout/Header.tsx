'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

// Cache navigation items since they rarely change
const navigationCache = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Categories', href: '/categories' },
  { name: 'Products', href: '/products' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout, isAuthenticated } = useAuth()
  const { getTotalItems } = useCart()

  // Memoize cart count to prevent unnecessary re-renders
  const cartItemCount = useMemo(() => {
    try {
      return getTotalItems() || 0
    } catch {
      return 0
    }
  }, [getTotalItems])

  // Memoize navigation rendering
  const navigationItems = useMemo(() => 
    navigationCache.map((item) => (
      <Link
        key={item.name}
        href={item.href}
        className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
      >
        {item.name}
      </Link>
    )), 
    []
  )

  // Memoize mobile navigation
  const mobileNavigationItems = useMemo(() =>
    navigationCache.map((item) => (
      <Link
        key={item.name}
        href={item.href}
        className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        {item.name}
      </Link>
    )),
    []
  )

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-pink-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ML</span>
            </div>
            <span className="text-xl font-bold gradient-text">MahaLaxmi Hardware</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-pink-100">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-pink-500">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-pink-100">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center w-full">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center w-full">
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  size="sm"
                  className="border-pink-300 text-pink-600 hover:bg-pink-50 flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                <Link href="/login">Login</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-pink-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-200">
            <nav className="flex flex-col space-y-2">
              {mobileNavigationItems}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-2 text-left text-red-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}