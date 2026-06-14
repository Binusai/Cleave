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
  const sectionsRef = useReveal()

  useEffect(() => {
    const container = containerRef.current
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
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Layout showNavActions={true}>
      <div className="home-page">
        <div ref={containerRef} className="home-container">
          <Hero />

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