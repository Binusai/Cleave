import { useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import Hero from '../components/home/Hero'
import {
  WhyCleave,
  FeatureShowcase,
  GlobalFinance,
  AISection,
  TrustSection,
  SocialProof,
  FinalCTA,
} from '../components/home/Sections'
import { useReveal } from '../hooks/useReveal'
import './HomePage.css'

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const laptopRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useReveal()

  useEffect(() => {
    const container = containerRef.current
    const heroContent = heroContentRef.current
    const laptop = laptopRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollY = window.scrollY

      // Faster expansion over 300px of scroll
      const maxScroll = 300
      const progress = Math.max(0, Math.min(1, scrollY / maxScroll))

      // easeOutCubic for snappy start, smooth finish
      const eased = 1 - Math.pow(1 - progress, 3)

      const currentWidth = 92 + (100 - 92) * eased
      const currentRadius = 40 * (1 - eased)
      const borderOpacity = 1 - eased
      const shadowOpacity = 0.06 * (1 - eased)

      container.style.width = `${currentWidth}vw`
      container.style.borderRadius = `${currentRadius}px`
      container.style.borderColor = `rgba(226, 230, 234, ${borderOpacity})`
      container.style.boxShadow = `0 8px 30px rgba(22, 32, 44, ${shadowOpacity})`

      // Hero text: fade out and lift slightly as box expands
      if (heroContent) {
        const textOpacity = 1 - eased
        const textShift = -eased * 40
        heroContent.style.opacity = `${textOpacity}`
        heroContent.style.transform = `translateY(${textShift}px)`
        heroContent.style.pointerEvents = eased > 0.6 ? 'none' : 'auto'
      }

      // Laptop: scales up and comes into sharp focus (blur -> clear)
      if (laptop) {
        const scale = 1 + eased * 0.18
        const liftY = -eased * 60
        const blur = (1 - eased) * 6

        laptop.style.transform = `translateY(${liftY}px) scale(${scale})`
        laptop.style.filter = `blur(${blur}px)`
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Layout showNavActions={true}>
      <div className="home-page">
        <div ref={containerRef} className="home-container">
          <Hero contentRef={heroContentRef} ref={laptopRef} />

          <div ref={sectionsRef}>
            <WhyCleave />
            <FeatureShowcase />
            <GlobalFinance />
            <AISection />
            <TrustSection />
            <SocialProof />
            <FinalCTA />
          </div>
        </div>
      </div>
    </Layout>
  )
}
