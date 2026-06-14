import './TopGroups.css'

interface Props {
  groups: { id: number; name: string; total_spent: number; expense_count: number; settlement_rate: number; member_count: number }[]
  formatCurrency: (val: number) => string
}

export default function TopGroups({ groups, formatCurrency }: Props) {
  const maxSpent = groups.length > 0 ? Math.max(...groups.map((g) => g.total_spent), 1) : 1

  return (
    <div className="top-groups-card">
      <h3 className="top-groups-title">Top Spending Groups</h3>
      <div className="top-groups-list">
        {groups.map((group) => (
          <div key={group.id} className="top-group-row">
            <div className="top-group-info">
              <span className="top-group-name">{group.name}</span>
              <span className="top-group-meta">{group.member_count} members · {group.expense_count} expenses</span>
            </div>
            <div className="top-group-bar-wrapper">
              <div className="top-group-bar" style={{ width: `${(group.total_spent / maxSpent) * 100}%` }} />
            </div>
            <span className="top-group-amount">{formatCurrency(group.total_spent)}</span>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="empty-list">No group data for this period</div>
        )}
      </div>
    </div>
  )
}