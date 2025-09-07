import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, Clock, Heart } from 'lucide-react'
import { Metadata } from 'next'

// Enable static generation for better performance
export const dynamic = 'force-static'

// Cache metadata
export const metadata: Metadata = {
  title: 'About Us - MahaLaxmi Hardware | Our Story & Values',
  description: 'Learn about MahaLaxmi Hardware\'s journey since 2010, our values of quality, service, reliability, and care. Trusted hardware partner serving the community.',
  keywords: 'about mahalaxmi hardware, hardware store history, quality hardware, customer service, trusted hardware partner',
  openGraph: {
    title: 'About MahaLaxmi Hardware - Our Story & Values',
    description: 'Discover our journey since 2010 and commitment to quality hardware products and exceptional service.',
    type: 'website',
  },
}

// Static data - cached outside component
const companyValues = [
  {
    icon: Award,
    title: 'Quality',
    description: 'We source only the finest products from trusted manufacturers'
  },
  {
    icon: Users,
    title: 'Service', 
    description: 'Exceptional customer service is at the heart of our business'
  },
  {
    icon: Clock,
    title: 'Reliability',
    description: 'Dependable products and services you can count on'
  },
  {
    icon: Heart,
    title: 'Care',
    description: 'We genuinely care about our customers and community'
  }
]

const storyContent = [
  "Founded in 2010, MahaLaxmi Hardware began as a small family business with a simple mission: to provide quality hardware products at affordable prices while delivering exceptional customer service.",
  "Over the years, we have grown from a single store to a trusted name in the hardware industry, serving thousands of customers across the region. Our commitment to quality and customer satisfaction has remained unchanged throughout our journey.",
  "Today, we continue to expand our product range and improve our services, always keeping our customers' needs at the heart of everything we do."
]

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
              {storyContent.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
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
            {companyValues.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card key={index} className="glass-effect border-pink-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
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
                  We strive to support our community's construction and home improvement needs 
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