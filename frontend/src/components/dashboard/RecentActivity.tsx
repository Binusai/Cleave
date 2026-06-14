import './RecentActivity.css'

interface Activity {
  type: string
  id: number
  title?: string
  amount: number
  group_name: string
  paid_by?: string
  payer?: string
  payee?: string
  status?: string
  date: string
}

export default function RecentActivity({ activities }: { activities: Activity[] }) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const getIcon = (type: string) => {
    if (type === 'expense') return 'bx-receipt'
    if (type === 'settlement') return 'bx-transfer'
    return 'bx-bell'
  }

  const getDescription = (activity: Activity) => {
    if (activity.type === 'expense') {
      return `${activity.paid_by} paid ${formatCurrency(activity.amount)} for ${activity.title}`
    }
    if (activity.type === 'settlement') {
      return `${activity.payer} settled ${formatCurrency(activity.amount)} with ${activity.payee}`
    }
    return ''
  }

  return (
    <div className="activity-card">
      <div className="activity-header">
        <h3>Recent Activity</h3>
      </div>
      <div className="activity-list">
        {activities.length > 0 ? activities.map((activity) => (
          <div key={`${activity.type}-${activity.id}`} className="activity-item">
            <div className={`activity-icon ${activity.type}`}>
              <i className={`bx ${getIcon(activity.type)}`}></i>
            </div>
            <div className="activity-body">
              <p className="activity-desc">{getDescription(activity)}</p>
              <span className="activity-group">{activity.group_name}</span>
            </div>
            <span className="activity-time">{timeAgo(activity.date)}</span>
          </div>
        )) : (
          <div className="activity-empty">
            <i className="bx bx-time-five"></i>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}