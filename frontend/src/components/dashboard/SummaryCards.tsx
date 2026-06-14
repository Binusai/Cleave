import './SummaryCards.css'

interface SummaryData {
  you_owe: number
  you_are_owed: number
  net_balance: number
  active_groups: number
  total_expenses_this_month: number
  pending_settlements: number
  settlement_completion_rate: number
  monthly_spending_trend: number
}

export default function SummaryCards({ data }: { data: SummaryData }) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const cards = [
    {
      label: 'You Owe',
      value: formatCurrency(data.you_owe),
      trend: null,
      color: 'danger',
      icon: 'bx-trending-down',
    },
    {
      label: 'You Are Owed',
      value: formatCurrency(data.you_are_owed),
      trend: null,
      color: 'success',
      icon: 'bx-trending-up',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(data.net_balance),
      trend: data.net_balance >= 0 ? 'positive' : 'negative',
      color: data.net_balance >= 0 ? 'success' : 'danger',
      icon: 'bx-wallet',
    },
    {
      label: 'Active Groups',
      value: data.active_groups.toString(),
      trend: null,
      color: 'primary',
      icon: 'bx-group',
    },
  ]

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div key={card.label} className={`summary-card card-${card.color}`}>
          <div className="summary-card-header">
            <span className="summary-label">{card.label}</span>
            <div className={`summary-icon icon-${card.color}`}>
              <i className={`bx ${card.icon}`}></i>
            </div>
          </div>
          <div className="summary-value">{card.value}</div>
          <div className="summary-footer">
            <span className="summary-subtitle">
              {card.label === 'Active Groups' ? `${data.pending_settlements} pending settlements` : ''}
              {card.label === 'Net Balance' && data.net_balance >= 0 ? 'You\'re in the green' : ''}
              {card.label === 'Net Balance' && data.net_balance < 0 ? 'Time to settle up' : ''}
              {card.label === 'You Owe' ? `${data.monthly_spending_trend > 0 ? '+' : ''}${data.monthly_spending_trend}% this month` : ''}
              {card.label === 'You Are Owed' ? `${data.settlement_completion_rate}% settled` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}