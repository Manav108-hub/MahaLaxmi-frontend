import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wrench, Shield, Truck } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-white to-pink-100 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">MahaLaxmi Hardware</span>
            <br />
            <span className="text-gray-800">Your Trusted Hardware Partner</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover quality hardware products for all your construction and home improvement needs. 
            From tools to materials, we have everything you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
              <Link href="/products">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              <Link href="/categories">
                Browse Categories
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 glass-effect rounded-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Quality Tools</h3>
              <p className="text-gray-600 text-center">
                Premium quality tools and equipment from trusted brands
              </p>
            </div>
            <div className="flex flex-col items-center p-6 glass-effect rounded-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Warranty</h3>
              <p className="text-gray-600 text-center">
                Comprehensive warranty on all products for peace of mind
              </p>
            </div>
            <div className="flex flex-col items-center p-6 glass-effect rounded-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-center">
                Quick and reliable delivery to your doorstep
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}