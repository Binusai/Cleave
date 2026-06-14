import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import AddPersonModal from '../components/people/AddPersonModal'
import { fetchContacts, createContact, toggleFavorite, fetchCategories } from '../api/people'
import './PeoplePage.css'

export default function PeoplePage() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterFavorite, setFilterFavorite] = useState(false)

  useEffect(() => {
    loadContacts()
    loadCategories()
  }, [search, filterCategory, filterFavorite])

  const loadContacts = async () => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (filterCategory) params.append('category', filterCategory)
    if (filterFavorite) params.append('favorite', 'true')
    try {
      const data = await fetchContacts(params.toString())
      setContacts(data)
    } catch (err) {
      console.error('Failed to load contacts:', err)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch {}
  }

  const handleAdd = async (data: any) => {
    await createContact(data)
    setShowAddModal(false)
    loadContacts()
  }

  const handleToggleFavorite = async (id: number) => {
    await toggleFavorite(id)
    loadContacts()
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div className="dashboard-content">
          <div className="people-header">
            <div>
              <h1>People</h1>
              <p className="people-subtitle">Manage your financial network</p>
            </div>
            <button className="btn-create-group" onClick={() => setShowAddModal(true)}>
              <i className="bx bx-plus"></i> Add Person
            </button>
          </div>

          <div className="people-filters">
            <div className="people-search">
              <i className="bx bx-search"></i>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button
              className={`filter-fav-btn ${filterFavorite ? 'active' : ''}`}
              onClick={() => setFilterFavorite(!filterFavorite)}
            >
              <i className="bx bx-star"></i> Favorites
            </button>
          </div>

          <div className="people-grid">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="person-card"
                onClick={() => navigate(`/people/${contact.id}`)}
              >
                <div className="person-card-top">
                  <div className="person-avatar">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    className={`fav-btn ${contact.is_favorite ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(contact.id) }}
                  >
                    <i className={`bx ${contact.is_favorite ? 'bxs-star' : 'bx-star'}`}></i>
                  </button>
                </div>
                <h3 className="person-name">{contact.name}</h3>
                {contact.category_name && (
                  <span className="person-category">{contact.category_name}</span>
                )}
                {contact.email && <span className="person-email">{contact.email}</span>}
                <div className="person-stats">
                  <span>{contact.shared_groups_count} groups</span>
                  <span className={contact.net_balance >= 0 ? 'positive' : 'negative'}>
                    {contact.net_balance >= 0 ? '+' : ''}{formatCurrency(contact.net_balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {contacts.length === 0 && (
            <div className="people-empty">
              <i className="bx bx-user-voice"></i>
              <h3>No people yet</h3>
              <p>Add people to your financial network to easily split expenses.</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPersonModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
    </div>
  )
}