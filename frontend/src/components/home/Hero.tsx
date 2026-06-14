import TrustBadge from './TrustBadge'
import AbstractShapes from './AbstractShapes'
import LaptopMockup from './LaptopMockup'
import './Hero.css'

export default function Hero() {
  return (
    <div className="hero">
      <AbstractShapes />
      
      <div className="hero-content">
        <TrustBadge />
        
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

      <LaptopMockup />
    </div>
  )
}