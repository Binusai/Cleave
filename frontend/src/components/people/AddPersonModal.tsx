import { useState, useEffect, type FormEvent } from 'react'
import { fetchCategories, createCategory } from '../../api/people'
import './AddPersonModal.css'

interface Props {
  onClose: () => void
  onAdd: (data: any) => Promise<void>
}

export default function AddPersonModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch {}
  }

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const cat = await createCategory(newCategory.trim())
      setCategories([...categories, cat])
      setCategoryId(cat.id)
      setNewCategory('')
    } catch {}
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onAdd({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category_id: categoryId,
        notes: notes.trim(),
      })
    } catch {
      setError('Failed to add person')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Person</h2>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="add-error">{error}</div>}
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Email</label>
              <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group flex-1">
              <label>Phone</label>
              <input type="text" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}>
              <option value="">None</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="new-category-row">
              <input type="text" placeholder="New category..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <button type="button" onClick={handleCreateCategory}>Add</button>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} placeholder="Any notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn-create" disabled={loading}>
            {loading ? 'Adding...' : 'Add Person'}
          </button>
        </form>
      </div>
    </div>
  )
}