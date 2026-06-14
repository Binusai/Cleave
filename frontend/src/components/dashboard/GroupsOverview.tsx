import './GroupsOverview.css'
import { useNavigate } from 'react-router-dom'

interface GroupData {
  id: number
  name: string
  member_count: number
  total_expenses: number
  balance: number
  last_activity: string
  image: string | null
}

export default function GroupsOverview({ groups }: { groups: GroupData[] }) {
  const navigate = useNavigate()
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return `${Math.floor(days / 7)}w ago`
  }

  const groupColors = ['#EEF2FF', '#ECFDF5', '#FEF3C7', '#FCE7F3', '#E0E7FF', '#D1FAE5']

  return (
    <div className="groups-card">
      <div className="groups-header">
        <h3>Your Groups</h3>
        <button className="groups-view-all" onClick={() => navigate('/groups')}>View All</button>
      </div>
      <div className="groups-grid">
        {groups.length > 0 ? groups.slice(0, 6).map((group, i) => (
          <div
            key={group.id}
            className="group-item"
            style={{ background: groupColors[i % groupColors.length] }}
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <div className="group-item-top">
              <div className="group-avatar">
                {group.image ? (
                  <img src={group.image} alt={group.name} />
                ) : (
                  <span>{group.name.charAt(0)}</span>
                )}
              </div>
              <div className="group-info">
                <h4>{group.name}</h4>
                <span>{group.member_count} members</span>
              </div>
            </div>
            <div className="group-item-bottom">
              <div className="group-balance-info">
                <span className="group-expense-label">Total</span>
                <span className="group-expense-value">{formatCurrency(group.total_expenses)}</span>
              </div>
              <div className={`group-your-balance ${group.balance >= 0 ? 'positive' : 'negative'}`}>
                {group.balance >= 0 ? 'You are owed' : 'You owe'}
                <span>{formatCurrency(Math.abs(group.balance))}</span>
              </div>
            </div>
            <div className="group-last-active">{timeAgo(group.last_activity)}</div>
          </div>
        )) : (
          <div className="groups-empty">
            <i className="bx bx-group"></i>
            <p>No groups yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}