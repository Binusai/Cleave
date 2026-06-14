import './HygieneScore.css'

interface Props {
  score: number
}

export default function HygieneScore({ score }: Props) {
  return (
    <div className="sidebar-card hygiene-card">
      <h3 className="sidebar-card-title">Financial Hygiene</h3>
      <div className="hygiene-ring-container">
        <div className="hygiene-ring">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#16A34A"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
            />
          </svg>
          <div className="hygiene-score-text">
            <span className="hygiene-score-number">{score}</span>
            <span className="hygiene-score-total">/100</span>
          </div>
        </div>
        <p className="hygiene-label">Great Score</p>
        <p className="hygiene-sub">You&apos;re among the top 20% of Cleave users</p>
      </div>
    </div>
  )
}