import dynamic from 'next/dynamic'

// Lazy load heavy components for better performance
const HeroSection = dynamic(() => import('@/components/home/HeroSection'), {
  loading: () => (
    <div className="h-[500px] bg-gradient-to-br from-pink-50 to-white animate-pulse" />
  )
})

const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'), {
  loading: () => (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
})

const CategoryGrid = dynamic(() => import('@/components/home/CategoryGrid'), {
  loading: () => (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
})

// Cache for 1 hour
export const revalidate = 3600

export default function HomePage() {
  return (
    <div>
      <div className="fade-in">
        <HeroSection />
      </div>
      <div className="slide-in-up">
        <CategoryGrid />
      </div>
      <div className="slide-in-up">
        <FeaturedProducts />
      </div>
    </div>
  )
}