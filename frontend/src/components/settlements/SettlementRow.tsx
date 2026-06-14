import './SettlementRow.css'

interface Props {
  settlement: any
  onComplete: (id: number) => void
  onRemind: (id: number) => void
  onIgnore: (id: number) => void
  currentUserId: number
}

export default function SettlementRow({ settlement }: Props) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="settlement-row">
      <div className="settlement-row-left">
        <div className={`settlement-avatar ${settlement.type}`}>
          {settlement.name.charAt(0)}
        </div>
        <div className="settlement-row-info">
          <div className="settlement-row-name">
            <span>{settlement.name}</span>
            <span className={`status-pill ${settlement.type === 'owed_to_you' ? 'green' : 'red'}`}>
              {settlement.type === 'owed_to_you' ? 'Owes You' : 'You Owe'}
            </span>
          </div>
          <span className="settlement-row-group">
            {settlement.groupName} • {settlement.expenseName}
          </span>
        </div>
      </div>

      <div className="settlement-row-right">
        <div className="settlement-row-amount">
          <span className={`amount-value ${settlement.type === 'owed_to_you' ? 'green' : 'red'}`}>
            {settlement.type === 'owed_to_you' ? '+' : '-'}{formatCurrency(settlement.amount)}
          </span>
          <span className="amount-date">{timeAgo(settlement.date)}</span>
        </div>
        <div className="settlement-row-actions">
          {settlement.type === 'owed_to_you' ? (
            <>
              <button className="btn-outline">
                <i className="bx bx-bell"></i> Remind
              </button>
              <button className="btn-filled">
                Settle
              </button>
            </>
          ) : (
            <button className="btn-filled">
              Pay
            </button>
          )}
        </div>
      </div>
    </div>
  )
}