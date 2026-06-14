import { useNavigate } from 'react-router-dom'
import './SettlementCard.css'

interface SummaryData {
  you_owe: number
  you_are_owed: number
  pending_settlements: number
  settlement_completion_rate: number
}

export default function SettlementCard({ summary }: { summary: SummaryData | null }) {
  const navigate = useNavigate()
  if (!summary) return null

  return (
    <div className="settlement-card">
      <div className="settlement-header">
        <h3>Settlements</h3>
        <span className={`settlement-badge ${summary.pending_settlements > 0 ? 'pending' : 'clear'}`}>
          {summary.pending_settlements > 0 ? `${summary.pending_settlements} pending` : 'All clear'}
        </span>
      </div>

      <div className="settlement-stats">
        <div className="settlement-stat">
          <span className="stat-label">Completion Rate</span>
          <div className="stat-bar-wrapper">
            <div className="stat-bar" style={{ width: `${summary.settlement_completion_rate}%` }}></div>
          </div>
          <span className="stat-value">{summary.settlement_completion_rate}%</span>
        </div>
      </div>

      {summary.you_owe > 0 && (
        <div className="settlement-alert alert-danger">
          <i className="bx bx-error-circle"></i>
          <span>You owe ₹{summary.you_owe.toLocaleString()}. Settle soon.</span>
        </div>
      )}
      {summary.you_are_owed > 0 && (
        <div className="settlement-alert alert-success">
          <i className="bx bx-check-circle"></i>
          <span>You're owed ₹{summary.you_are_owed.toLocaleString()}</span>
        </div>
      )}

      <button className="settlement-btn" onClick={() => navigate('/settlements')}>
        <i className="bx bx-transfer"></i>
        View All Settlements
      </button>
    </div>
  )
}