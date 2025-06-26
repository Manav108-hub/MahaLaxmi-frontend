import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, Clock, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            About MahaLaxmi Hardware
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With over a decade of experience, we have been serving the community with 
            quality hardware products and exceptional customer service.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2010, MahaLaxmi Hardware began as a small family business with a 
                simple mission: to provide quality hardware products at affordable prices while 
                delivering exceptional customer service.
              </p>
              <p>
                Over the years, we have grown from a single store to a trusted name in the 
                hardware industry, serving thousands of customers across the region. Our commitment 
                to quality and customer satisfaction has remained unchanged throughout our journey.
              </p>
              <p>
                Today, we continue to expand our product range and improve our services, always 
                keeping our customers&apos; needs at the heart of everything we do.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">ML</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Since 2010</h3>
              <p className="text-gray-600">Serving the community</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="glass-effect border-pink-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Quality</h3>
                <p className="text-gray-600 text-sm">
                  We source only the finest products from trusted manufacturers
                </p>
              </CardContent>
            </Card>
            <Card className="glass-effect border-pink-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Service</h3>
                <p className="text-gray-600 text-sm">
                  Exceptional customer service is at the heart of our business
                </p>
              </CardContent>
            </Card>
            <Card className="glass-effect border-pink-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Reliability</h3>
                <p className="text-gray-600 text-sm">
                  Dependable products and services you can count on
                </p>
              </CardContent>
            </Card>
            <Card className="glass-effect border-pink-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Care</h3>
                <p className="text-gray-600 text-sm">
                  We genuinely care about our customers and community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="glass-effect border-pink-200">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our mission is to be the most trusted hardware partner in the region by providing 
                  high-quality products, competitive prices, and exceptional customer service. 
                  We strive to support our community&apos;s construction and home improvement needs 
                  while building lasting relationships with our customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}