import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col" style={{ maxWidth: 280 }}>
            <div className="footer-brand">
              <img src="/images/logo.png" alt="Cleave logo" />
              <span>Cleave</span>
            </div>
            <p className="footer-tagline">
              Split expenses, settle up, and keep your group's money sorted — without the awkward math.
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="#">Features</Link>
            <Link to="#">How it works</Link>
            <Link to="#">Pricing</Link>
            <Link to="#">AI Assistant</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="#">About</Link>
            <Link to="#">Blog</Link>
            <Link to="#">Careers</Link>
            <Link to="#">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <Link to="#">Help Center</Link>
            <Link to="#">FAQ</Link>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Cleave. All rights reserved.</span>
          <div className="socials">
            <i className='bx bxl-twitter'></i>
            <i className='bx bxl-instagram'></i>
            <i className='bx bxl-linkedin'></i>
          </div>
        </div>
      </div>

      <svg className="footer-skyline" viewBox="0 0 1400 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,64 0,40 100,64" fill="#16202c"/>
        <polygon points="80,64 180,10 280,64" fill="#2f6f4f"/>
        <polygon points="240,64 340,28 420,64" fill="#5c6b7a"/>
        <polygon points="380,64 470,0 560,64" fill="#234f39"/>
        <polygon points="520,64 620,34 700,64" fill="#9fd8bc"/>
        <polygon points="660,64 760,12 840,64" fill="#16202c"/>
        <polygon points="800,64 880,30 980,64" fill="#2f6f4f"/>
        <polygon points="940,64 1040,4 1120,64" fill="#5c6b7a"/>
        <polygon points="1080,64 1160,38 1260,64" fill="#234f39"/>
        <polygon points="1220,64 1300,15 1400,64" fill="#2f6f4f"/>
        <polygon points="1350,64 1400,45 1400,64" fill="#16202c"/>
      </svg>
    </footer>
  )
}