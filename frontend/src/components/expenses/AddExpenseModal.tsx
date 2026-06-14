import { useState, type FormEvent } from 'react'
import './AddExpenseModal.css'

interface Member {
  user: number
  user_name: string
  user_email: string
}

interface Category {
  id: number
  name: string
  icon: string
  color: string
}

interface Props {
  groupId: number
  members: Member[]
  categories: Category[]
  onClose: () => void
  onAdd: (data: any) => Promise<void>
}

export default function AddExpenseModal({ groupId, members, categories, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<number>(members[0]?.user || 0)
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'SGD', symbol: 'S$' },
    { code: 'AED', symbol: 'د.إ' },
  ]

  const [currency, setCurrency] = useState('INR')

  const [participants, setParticipants] = useState<any[]>(
    members.map((m) => ({
      user_id: m.user,
      user_name: m.user_name,
      is_included: true,
      amount: 0,
      percentage: 0,
      shares: 1,
    }))
  )

  const toggleParticipant = (userId: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, is_included: !p.is_included } : p))
    )
  }

  const updateParticipantValue = (userId: number, field: string, value: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, [field]: parseFloat(value) || 0 } : p))
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) {
      setError('Title and amount are required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data: any = {
        title: title.trim(),
        currency: currency,
        amount: parseFloat(amount),
        paid_by: paidBy,
        split_type: splitType,
        expense_date: expenseDate,
        notes: notes.trim(),
        participants: participants
          .filter((p) => splitType === 'equal' || p.is_included)
          .map((p) => ({
            user_id: p.user_id,
            is_included: p.is_included,
            amount: p.amount,
            percentage: p.percentage,
            shares: p.shares,
          })),
      }
      if (categoryId) data.category_id = categoryId
      await onAdd(data)
    } catch {
      setError('Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Expense</h2>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="add-error">{error}</div>}

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Title</label>
              <input type="text" placeholder="e.g., Dinner at Beach" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group" style={{ width: 100 }}>
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ width: 150 }}>
              <label>Amount</label>
              <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Paid By</label>
              <select value={paidBy} onChange={(e) => setPaidBy(parseInt(e.target.value))}>
                {members.map((m) => (
                  <option key={m.user} value={m.user}>{m.user_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Category</label>
              <select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Date</label>
              <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
            </div>
            <div className="form-group flex-1">
              <label>Split Type</label>
              <select value={splitType} onChange={(e) => setSplitType(e.target.value as any)}>
                <option value="equal">Equal</option>
                <option value="exact">Exact Amount</option>
                <option value="percentage">Percentage</option>
                <option value="shares">Shares</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Participants</label>
            <div className="participants-list">
              {participants.map((p) => (
                <div key={p.user_id} className="participant-row">
                  <label className="participant-check">
                    <input
                      type="checkbox"
                      checked={p.is_included}
                      onChange={() => toggleParticipant(p.user_id)}
                      disabled={splitType !== 'equal'}
                    />
                    <span>{p.user_name}</span>
                  </label>
                  {splitType === 'exact' && p.is_included && (
                    <input
                      type="number"
                      className="participant-input"
                      placeholder="₹"
                      value={p.amount || ''}
                      onChange={(e) => updateParticipantValue(p.user_id, 'amount', e.target.value)}
                    />
                  )}
                  {splitType === 'percentage' && p.is_included && (
                    <input
                      type="number"
                      className="participant-input"
                      placeholder="%"
                      value={p.percentage || ''}
                      onChange={(e) => updateParticipantValue(p.user_id, 'percentage', e.target.value)}
                    />
                  )}
                  {splitType === 'shares' && p.is_included && (
                    <input
                      type="number"
                      className="participant-input"
                      placeholder="shares"
                      value={p.shares || ''}
                      onChange={(e) => updateParticipantValue(p.user_id, 'shares', e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={2} placeholder="Any notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <button type="submit" className="btn-create" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}