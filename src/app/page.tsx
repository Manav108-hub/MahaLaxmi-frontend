import HeroSection from '@/components/home/HeroSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CategoryGrid from '@/components/home/CategoryGrid'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
    </div>
  )
}