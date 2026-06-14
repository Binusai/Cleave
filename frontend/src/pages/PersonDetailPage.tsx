import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { fetchContactDetail, toggleFavorite } from '../api/people'
import './PersonDetailPage.css'

export default function PersonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (id) loadContact(parseInt(id))
  }, [id])

  const loadContact = async (contactId: number) => {
    try {
      const data = await fetchContactDetail(contactId)
      setContact(data)
    } catch (err) {
      console.error('Failed to load contact:', err)
    }
  }

  const handleToggleFavorite = async () => {
    if (!id) return
    await toggleFavorite(parseInt(id))
    loadContact(parseInt(id))
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  if (!contact) return null

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar/>
        <div className="dashboard-content">
          <div className="detail-header">
            <button className="back-btn" onClick={() => navigate('/people')}>
              <i className="bx bx-arrow-back"></i> Back to People
            </button>
            <button className={`fav-btn-big ${contact.is_favorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
              <i className={`bx ${contact.is_favorite ? 'bxs-star' : 'bx-star'}`}></i>
              {contact.is_favorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>

          <div className="person-profile-card">
            <div className="person-profile-top">
              <div className="person-profile-avatar">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="person-profile-info">
                <h1>{contact.name}</h1>
                {contact.category_name && (
                  <span className="person-profile-category">{contact.category_name}</span>
                )}
                {contact.contact_user_email && (
                  <span className="person-profile-joined">
                    <i className="bx bx-check-circle"></i> On Cleave
                  </span>
                )}
              </div>
            </div>

            <div className="person-profile-contact">
              {contact.email && (
                <div className="contact-info-item">
                  <i className="bx bx-envelope"></i>
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="contact-info-item">
                  <i className="bx bx-phone"></i>
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.notes && (
                <div className="contact-info-item">
                  <i className="bx bx-note"></i>
                  <span>{contact.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="person-summary-cards">
            <div className="person-summary-card negative">
              <span className="card-label">You Owe</span>
              <span className="card-value">
                {contact.net_balance < 0 ? formatCurrency(Math.abs(contact.net_balance)) : formatCurrency(0)}
              </span>
            </div>
            <div className="person-summary-card positive">
              <span className="card-label">Owes You</span>
              <span className="card-value">
                {contact.net_balance > 0 ? formatCurrency(contact.net_balance) : formatCurrency(0)}
              </span>
            </div>
            <div className={`person-summary-card ${contact.net_balance >= 0 ? 'positive' : 'negative'}`}>
              <span className="card-label">Net Balance</span>
              <span className="card-value">
                {contact.net_balance >= 0 ? '+' : ''}{formatCurrency(contact.net_balance)}
              </span>
            </div>
            <div className="person-summary-card neutral">
              <span className="card-label">Shared Groups</span>
              <span className="card-value">{contact.shared_groups_count}</span>
            </div>
          </div>

          <div className="person-detail-section">
            <h3>Shared Groups</h3>
            {contact.shared_groups_count > 0 ? (
              <p className="muted-text">Groups you share with {contact.name} will appear here.</p>
            ) : (
              <div className="empty-state-sm">
                <i className="bx bx-group"></i>
                <p>No shared groups yet. Add {contact.name} to a group to start splitting expenses.</p>
              </div>
            )}
          </div>

          <div className="person-detail-section">
            <h3>Recent Activity</h3>
            <div className="empty-state-sm">
              <i className="bx bx-time-five"></i>
              <p>Activity with {contact.name} will appear here once you start adding expenses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}