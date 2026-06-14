import './SmartSuggestion.css'

interface Props {
  payer: string
  payee: string
  payerOwes: number
  payeeOwes: number
  net: number
}

export default function SmartSuggestion({ payer, payee, payerOwes, payeeOwes, net }: Props) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="smart-suggestion">
      <div className="smart-suggestion-content">
        <div className="smart-icon">
          <i className="bx bx-shuffle"></i>
        </div>
        <div className="smart-info">
          <h4>Smart Settlement</h4>
          <p>
            {payer} owes you {formatCurrency(payerOwes)} and you owe them {formatCurrency(payeeOwes)}.
            Settle the net difference of <strong>{formatCurrency(net)}</strong>.
          </p>
        </div>
      </div>
      <button className="btn-settle-now">Settle Now</button>
    </div>
  )
}