import './HealthScoreCard.css'

interface Props {
  health: {
    health_score: number
    health_label: string
    health_color: string
    settlement_discipline: number
    consistency: number
    organizer_score: number
    total_expenses_tracked: number
    completed_settlements: number
    spending_streak_days: number
  } | null
}

export default function HealthScoreCard({ health }: Props) {
  if (!health) return null

  return (
    <div className="health-card">
      <h3 className="health-title">Financial Health</h3>
      
      <div className="health-ring-container">
        <div className="health-ring">
          <svg width="130" height="130">
            <circle cx="65" cy="65" r="56" fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle
              cx="65" cy="65" r="56"
              fill="none"
              stroke={health.health_color}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - health.health_score / 100)}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
            />
          </svg>
          <div className="health-score-center">
            <span className="health-score-num" style={{ color: health.health_color }}>{Math.round(health.health_score)}</span>
            <span className="health-score-total">/100</span>
          </div>
        </div>
        <span className="health-label" style={{ color: health.health_color }}>{health.health_label}</span>
      </div>

      <div className="health-metrics">
        <div className="health-metric">
          <span className="metric-label">Settlement</span>
          <span className="metric-value">{Math.round(health.settlement_discipline)}%</span>
        </div>
        <div className="health-metric">
          <span className="metric-label">Consistency</span>
          <span className="metric-value">{Math.round(health.consistency)}%</span>
        </div>
        <div className="health-metric">
          <span className="metric-label">Organizer</span>
          <span className="metric-value">{Math.round(health.organizer_score)}%</span>
        </div>
        <div className="health-metric">
          <span className="metric-label">Streak</span>
          <span className="metric-value">{health.spending_streak_days}d</span>
        </div>
      </div>
    </div>
  )
}