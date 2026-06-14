import { useState, useEffect, type FormEvent } from 'react'
import apiClient from '../../api/client'
import { fetchContacts } from '../../api/people'
import './AddMemberModal.css'

interface Props {
  groupId: number
  onClose: () => void
  onAdded: () => void
}

interface Contact {
  id: number
  name: string
  email: string
  category_name: string
}

export default function AddMemberModal({ groupId, onClose, onAdded }: Props) {
  const [mode, setMode] = useState<'select' | 'manual'>('select')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await fetchContacts()
      setContacts(data)
      const cats = ['All', ...new Set(data.map((c: Contact) => c.category_name).filter(Boolean))]
      setCategories(cats as string[])
    } catch {}
  }

  const filteredContacts = contacts.filter((c) => {
    const matchCat = selectedCategory === 'All' || c.category_name === selectedCategory
    const matchSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  const groupedContacts = filteredContacts.reduce((acc: Record<string, Contact[]>, c) => {
    const cat = c.category_name || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  const handleSelectAndAdd = async () => {
    if (!selectedContact) return
    setLoading(true)
    setError('')
    try {
      await apiClient.post(`/groups/${groupId}/add-member/`, {
        name: selectedContact.name,
        email: selectedContact.email || `${selectedContact.name.toLowerCase().replace(/\s+/g, '.')}@cleave.local`,
      })
      onAdded()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleManualAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await apiClient.post(`/groups/${groupId}/add-member/`, {
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@cleave.local`,
      })
      onAdded()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container add-member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Member</h2>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>

        <div className="mode-tabs">
          <button className={`mode-tab ${mode === 'select' ? 'active' : ''}`} onClick={() => setMode('select')}>
            <i className="bx bx-list-ul"></i> Select from People
          </button>
          <button className={`mode-tab ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
            <i className="bx bx-user-plus"></i> Add Manually
          </button>
        </div>

        {error && <div className="add-error">{error}</div>}

        {mode === 'select' ? (
          <div className="select-member-section">
            <div className="select-filters">
              <div className="select-search">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="contacts-list">
              {Object.keys(groupedContacts).length === 0 ? (
                <p className="no-contacts">No people found. Add them first in People page.</p>
              ) : (
                Object.entries(groupedContacts).map(([cat, catContacts]) => (
                  <div key={cat} className="contact-category-group">
                    <span className="contact-category-label">{cat}</span>
                    {catContacts.map((c) => (
                      <div
                        key={c.id}
                        className={`contact-select-item ${selectedContact?.id === c.id ? 'selected' : ''}`}
                        onClick={() => setSelectedContact(c)}
                      >
                        <div className="contact-select-avatar">{c.name.charAt(0).toUpperCase()}</div>
                        <div className="contact-select-info">
                          <span className="contact-select-name">{c.name}</span>
                          {c.email && <span className="contact-select-email">{c.email}</span>}
                        </div>
                        {selectedContact?.id === c.id && <i className="bx bx-check-circle"></i>}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <button
              className="btn-create"
              disabled={!selectedContact || loading}
              onClick={handleSelectAndAdd}
            >
              {loading ? 'Adding...' : `Add ${selectedContact?.name || 'Member'}`}
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualAdd}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Email (optional)</label>
              <input type="email" placeholder="member@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}