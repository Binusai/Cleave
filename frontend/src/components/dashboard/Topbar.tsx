import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUnreadCount, fetchNotifications } from '../../api/notifications'
import { fetchProfile } from '../../api/profile'
import { fetchSummary } from '../../api/dashboard'
import './Topbar.css'

interface TopbarProps {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate()
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showQuickAddDropdown, setShowQuickAddDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const quickAddRef = useRef<HTMLDivElement>(null)
  const [balance, setBalance] = useState<any>({ net_balance: 0 })

  useEffect(() => {
    loadUnreadCount()
    loadProfile()
    loadBalance()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setShowQuickAddDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const data = await fetchUnreadCount()
      setUnreadCount(data.unread_count)
    } catch {}
  }

  const loadProfile = async () => {
    try {
      const data = await fetchProfile()
      setProfile(data)
    } catch {}
  }

  const loadBalance = async () => {
    try {
      const data = await fetchSummary()
      setBalance(data)
    } catch {}
  }

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications('limit=5')
      setNotifications(data)
    } catch {}
  }

  const handleNotifClick = () => {
    setShowNotifDropdown(!showNotifDropdown)
    setShowProfileDropdown(false)
    setShowQuickAddDropdown(false)
    if (!showNotifDropdown) loadNotifications()
  }

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown)
    setShowNotifDropdown(false)
    setShowQuickAddDropdown(false)
  }

  const handleQuickAddClick = () => {
    setShowQuickAddDropdown(!showQuickAddDropdown)
    setShowNotifDropdown(false)
    setShowProfileDropdown(false)
  }

  const handleQuickAddOption = (path: string) => {
    setShowQuickAddDropdown(false)
    navigate(path)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn mobile-only" onClick={onMenuClick}>
          <i className="bx bx-menu"></i>
        </button>
        <div className="topbar-logo" onClick={() => navigate('/dashboard')}>
          <img src="/images/logo.png" alt="Cleave" />
        </div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-quickadd-wrapper" ref={quickAddRef}>
          <button className="topbar-btn quick-add" onClick={handleQuickAddClick}>
            <i className="bx bx-plus"></i>
            <span>Quick Add</span>
            <i className={`bx bx-chevron-${showQuickAddDropdown ? 'up' : 'down'}`}></i>
          </button>

          {showQuickAddDropdown && (
            <div className="topbar-dropdown quickadd-dropdown">
              <button className="quickadd-item" onClick={() => handleQuickAddOption('/groups/new')}>
                <span className="quickadd-item-icon" style={{ background: 'var(--accent-light)' }}>
                  <i className="bx bx-group" style={{ color: 'var(--primary)' }}></i>
                </span>
                <span className="quickadd-item-label">Add Group</span>
                <i className="bx bx-chevron-right quickadd-arrow"></i>
              </button>
              <button className="quickadd-item" onClick={() => handleQuickAddOption('/people/new')}>
                <span className="quickadd-item-icon" style={{ background: 'var(--success-bg)' }}>
                  <i className="bx bx-user-plus" style={{ color: '#15803D' }}></i>
                </span>
                <span className="quickadd-item-label">Add Person</span>
                <i className="bx bx-chevron-right quickadd-arrow"></i>
              </button>
              <button className="quickadd-item" onClick={() => handleQuickAddOption('/expenses/new')}>
                <span className="quickadd-item-icon" style={{ background: 'var(--warning-bg)' }}>
                  <i className="bx bx-receipt" style={{ color: '#A16207' }}></i>
                </span>
                <span className="quickadd-item-label">Add Expense</span>
                <i className="bx bx-chevron-right quickadd-arrow"></i>
              </button>
            </div>
          )}
        </div>

        <div className="topbar-notif-wrapper" ref={notifRef}>
          <button className="topbar-icon-btn" onClick={handleNotifClick}>
            <i className="bx bx-bell"></i>
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>

          {showNotifDropdown && (
            <div className="topbar-dropdown notif-dropdown">
              <div className="dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="dropdown-badge">{unreadCount} new</span>}
              </div>
              <div className="dropdown-list">
                {notifications.length === 0 ? (
                  <div className="dropdown-empty">
                    <i className="bx bx-bell-check"></i>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} className={`dropdown-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => navigate('/notifications')}>
                      <div className="dropdown-item-icon" style={{
                        background: n.notification_type === 'settlement' ? 'var(--accent-light)' :
                          n.notification_type === 'expense' ? 'var(--success-bg)' : 'var(--hover-bg)'
                      }}>
                        <i className={`bx ${n.notification_type === 'settlement' ? 'bx-transfer-alt' :
                          n.notification_type === 'expense' ? 'bx-receipt' : 'bx-bell'}`}></i>
                      </div>
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-title">{n.title}</span>
                        <span className="dropdown-item-time">{n.time_ago}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="dropdown-view-all" onClick={() => navigate('/notifications')}>
                View All Notifications
              </button>
            </div>
          )}
        </div>

        <div className="topbar-balance">
          <span className="balance-label">Balance</span>
          <span className={`balance-amount ${(balance.net_balance || 0) >= 0 ? 'positive' : 'negative'}`}>
            {(balance.net_balance || 0) >= 0 ? '+' : ''}{formatCurrency(balance.net_balance || 0)}
          </span>
        </div>

        <div className="topbar-profile-wrapper" ref={profileRef}>
          <button className="topbar-profile" onClick={handleProfileClick}>
            <div className="profile-avatar">
              {profile?.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>

          {showProfileDropdown && profile && (
            <div className="topbar-dropdown profile-dropdown">
              <div className="profile-dropdown-hero">
                <div className="profile-dropdown-avatar-lg">
                  {profile.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="profile-dropdown-name">{profile.user.full_name}</span>
                <span className="profile-dropdown-email">{profile.user.email}</span>
              </div>
              <div className="profile-dropdown-stats">
                <div className="profile-stat">
                  <span>{profile.active_groups}</span>
                  <span>Groups</span>
                </div>
                <div className="profile-stat">
                  <span>{formatCurrency(profile.total_expenses)}</span>
                  <span>Total Spent</span>
                </div>
              </div>
              <button className="dropdown-view-all" onClick={() => navigate('/profile')}>
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
