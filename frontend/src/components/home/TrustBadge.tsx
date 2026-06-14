import './TrustBadge.css'

export default function TrustBadge() {
  return (
    <div className="trust-badge">
      <div className="trust-badge-avatars">
        <div className="trust-avatar" />
        <div className="trust-avatar" />
        <div className="trust-avatar" />
        <div className="trust-avatar" />
      </div>
      <span className="trust-badge-text">Trusted by over 10,000 groups</span>
    </div>
  )
}