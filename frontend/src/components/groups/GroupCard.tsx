import { useNavigate } from 'react-router-dom'
import './GroupCard.css'

interface GroupCardProps {
  id: number
  name: string
  member_count: number
  total_expenses: number
  user_balance: number
  group_type: string
  last_activity: string
}

const typeIcons: Record<string, string> = {
  trip: 'bx-map',
  family: 'bx-home-heart',
  friends: 'bx-group',
  couple: 'bx-heart',
  roommates: 'bx-building-house',
  office: 'bx-briefcase',
  event: 'bx-calendar-star',
  custom: 'bx-shapes',
}

const typeColors: Record<string, string> = {
  trip: '#EEF2FF',
  family: '#ECFDF5',
  friends: '#FEF3C7',
  couple: '#FCE7F3',
  roommates: '#E0E7FF',
  office: '#F1F5F9',
  event: '#FEF9C3',
  custom: '#F8FAFC',
}

export default function GroupCard({ id, name, member_count, total_expenses, user_balance, group_type }: GroupCardProps) {
  const navigate = useNavigate()
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="group-card" onClick={() => navigate(`/groups/${id}`)}>
      <div className="group-card-header">
        <div className="group-card-icon" style={{ background: typeColors[group_type] || '#F8FAFC' }}>
          <i className={`bx ${typeIcons[group_type] || 'bx-shapes'}`}></i>
        </div>
        <div className="group-card-info">
          <h3>{name}</h3>
          <span className="group-card-type">{group_type.charAt(0).toUpperCase() + group_type.slice(1)}</span>
        </div>
        <i className="bx bx-chevron-right group-card-arrow"></i>
      </div>
      <div className="group-card-stats">
        <div className="group-stat">
          <span className="stat-label">Members</span>
          <span className="stat-value">{member_count}</span>
        </div>
        <div className="group-stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{formatCurrency(total_expenses)}</span>
        </div>
        <div className="group-stat">
          <span className="stat-label">Your Balance</span>
          <span className={`stat-value ${user_balance >= 0 ? 'positive' : 'negative'}`}>
            {user_balance >= 0 ? '+' : ''}{formatCurrency(user_balance)}
          </span>
        </div>
      </div>
    </div>
  )
}