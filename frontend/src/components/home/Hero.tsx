import { forwardRef } from 'react'
import AbstractShapes from './AbstractShapes'
import LaptopMockup from './LaptopMockup'
import './Hero.css'

interface HeroProps {
  contentRef?: React.Ref<HTMLDivElement>
}

const Hero = forwardRef<HTMLDivElement, HeroProps>(({ contentRef }, laptopRef) => {
  return (
    <div className="hero">
      {/* Background image layer (optional).
          If you have a reference background image, place it at:
          src/assets/hero-bg.jpg
          and uncomment the className below (or set the --hero-bg-url CSS var
          in Hero.css / inline style) */}
      <div className="hero-bg-image" />

      <AbstractShapes />

      <div className="hero-content" ref={contentRef}>
        <span className="hero-eyebrow">
          <i className="bx bxs-cloud eyebrow-logo" />
          #1 Shared Finance Platform
        </span>

        <div className="hero-headline">
          <h1>
            Shared money,{' '}
            <span className="accent">made simple</span>
          </h1>
          <p>
            Split expenses, track balances, and settle up with your group —
            without spreadsheets, awkward reminders, or mental math.
          </p>
        </div>

        <div className="hero-actions">
          <a href="/auth" className="btn-primary">
            Get started free
            <i className="bx bx-right-arrow-alt" />
          </a>
          <a href="#how-it-works" className="btn-secondary">
            See how it works
          </a>
        </div>
      </div>

      <LaptopMockup ref={laptopRef} />
    </div>
  )
})

Hero.displayName = 'Hero'
export default Hero
