import HeroSection from '@/components/home/HeroSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CategoryGrid from '@/components/home/CategoryGrid'

// Add caching without changing anything else
export const revalidate = 300; // 5 minutes

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
    </div>
  )
}