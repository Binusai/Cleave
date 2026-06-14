import './ExpenseList.css'

interface Expense {
  id: number
  title: string
  amount: number
  paid_by_name: string
  category_name: string
  split_type: string
  expense_date: string
  splits: any[]
}

interface Props {
  expenses: Expense[]
  onDelete: (id: number) => void
}

const splitTypeLabels: Record<string, string> = {
  equal: 'Equal',
  exact: 'Exact',
  percentage: '%',
  shares: 'Shares',
}

export default function ExpenseList({ expenses, onDelete }: Props) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (expenses.length === 0) {
    return (
      <div className="expenses-empty">
        <i className="bx bx-receipt"></i>
        <h3>No expenses yet</h3>
        <p>Add your first expense to start tracking group spending.</p>
      </div>
    )
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <div key={expense.id} className="expense-item">
          <div className="expense-left">
            <div className="expense-icon">
              <i className="bx bx-receipt"></i>
            </div>
            <div className="expense-info">
              <h4>{expense.title}</h4>
              <div className="expense-meta">
                <span>{expense.paid_by_name} paid</span>
                <span className="dot-sep">·</span>
                <span>{formatDate(expense.expense_date)}</span>
                <span className="dot-sep">·</span>
                <span className="split-badge">{splitTypeLabels[expense.split_type] || expense.split_type}</span>
                {expense.category_name && (
                  <>
                    <span className="dot-sep">·</span>
                    <span>{expense.category_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="expense-right">
            <span className="expense-amount">{formatCurrency(expense.amount)}</span>
            <button className="expense-delete-btn" onClick={() => onDelete(expense.id)}>
              <i className="bx bx-trash"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}