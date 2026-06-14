import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

interface NavbarProps {
  showActions?: boolean
}

export default function Navbar({ showActions = true }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img src="/images/logo.png" alt="Cleave" />
        </Link>
        {showActions && (
          <div className="nav-actions">
            <Link to="/auth" className="nav-link">Log in</Link>
            <Link to="/auth" className="nav-cta">Get started</Link>
          </div>
        )}
      </div>
    </nav>
  )
}