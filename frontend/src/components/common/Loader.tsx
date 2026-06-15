import { useLoading } from '../../context/LoadingContext'
import './Loader.css'

export default function Loader() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="cleave-loader-overlay">
      <div className="cleave-loader">
        <div className="loader-coin-stack">
          <div className="coin coin-1">₹</div>
          <div className="coin coin-2">₹</div>
          <div className="coin coin-3">₹</div>
          <div className="coin coin-4">₹</div>
        </div>
        <div className="loader-ring">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="3"
              strokeDasharray="214"
              strokeDashoffset="0"
              strokeLinecap="round"
              className="loader-ring-circle"
            />
          </svg>
        </div>
        <p className="loader-text">Preparing your finances</p>
        <div className="loader-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  )
}
