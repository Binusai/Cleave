import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { fetchNotifications, fetchNotificationSummary, markAsRead, markAllAsRead } from '../api/notifications'
import './NotificationsPage.css'

interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  reference_id: number | null
  reference_type: string
  is_read: boolean
  created_at: string
  time_ago: string
}

export default function NotificationsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeFilter])

  useEffect(() => {
    document.body.classList.add('no-background-pattern')
    return () => {
      document.body.classList.remove('no-background-pattern')
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const filterParams = new URLSearchParams()
      if (activeFilter === 'unread') filterParams.append('unread', 'true')
      else if (activeFilter !== 'all') filterParams.append('type', activeFilter)
      filterParams.append('limit', '50')

      const [notifData, summaryData] = await Promise.all([
        fetchNotifications(filterParams.toString()),
        fetchNotificationSummary(),
      ])
      setNotifications(notifData)
      setSummary(summaryData)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: number) => {
    await markAsRead(id)
    loadData()
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    loadData()
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      expense: 'bx-receipt',
      settlement: 'bx-transfer-alt',
      group: 'bx-group',
      invitation: 'bx-user-plus',
      analytics: 'bx-line-chart',
      ai: 'bx-bulb',
      system: 'bx-cog',
    }
    return icons[type] || 'bx-bell'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      expense: '#16A34A',
      settlement: '#1E3A5F',
      group: '#8B5CF6',
      invitation: '#F59E0B',
      analytics: '#3B82F6',
      ai: '#06B6D4',
      system: '#64748B',
    }
    return colors[type] || '#64748B'
  }

  const getTypeBg = (type: string) => {
    const bgs: Record<string, string> = {
      expense: '#DCFCE7',
      settlement: '#DBEAFE',
      group: '#EDE9FE',
      invitation: '#FEF3C7',
      analytics: '#DBEAFE',
      ai: '#CFFAFE',
      system: '#F1F5F9',
    }
    return bgs[type] || '#F1F5F9'
  }

  const groupByDate = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] }
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const weekAgo = new Date(today.getTime() - 7 * 86400000)

    items.forEach((item) => {
      const itemDate = new Date(item.created_at)
      if (itemDate >= today) groups['Today'].push(item)
      else if (itemDate >= yesterday) groups['Yesterday'].push(item)
      else if (itemDate >= weekAgo) groups['This Week'].push(item)
      else groups['Earlier'].push(item)
    })

    return Object.entries(groups).filter(([_, items]) => items.length > 0)
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'expense', label: 'Expenses' },
    { key: 'settlement', label: 'Settlements' },
    { key: 'group', label: 'Groups' },
    { key: 'invitation', label: 'Invitations' },
    { key: 'ai', label: 'AI Insights' },
    { key: 'system', label: 'System' },
  ]

  const grouped = groupByDate(notifications)

  return (
    <div className="dashboard">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div className="dashboard-content notifications-page">
          
          <div className="notifications-header">
            <div>
              <h1 className="notifications-title">Notifications</h1>
              <p className="notifications-subtitle">Stay updated with your financial activity.</p>
            </div>
            <div className="notifications-header-actions">
              <button className="btn-mark-all-read" onClick={handleMarkAllRead}>
                <i className="bx bx-check-double"></i> Mark All As Read
              </button>
            </div>
          </div>

          {summary && (
            <div className="notifications-summary-row">
              <div className="summary-card card-unread">
                <div className="summary-card-icon unread"><i className="bx bx-bell"></i></div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Unread</span>
                  <span className="summary-card-value unread">{summary.unread}</span>
                  <span className="summary-card-sub">Require attention</span>
                </div>
              </div>
              <div className="summary-card card-read">
                <div className="summary-card-icon read"><i className="bx bx-check-double"></i></div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Read</span>
                  <span className="summary-card-value read">{summary.read}</span>
                  <span className="summary-card-sub">Already reviewed</span>
                </div>
              </div>
              <div className="summary-card card-total">
                <div className="summary-card-icon total"><i className="bx bx-bell-check"></i></div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Total</span>
                  <span className="summary-card-value total">{summary.total}</span>
                  <span className="summary-card-sub">All activities</span>
                </div>
              </div>
            </div>
          )}

          <div className="notifications-filters">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
                {f.key === 'unread' && summary?.unread > 0 && (
                  <span className="filter-count">{summary.unread}</span>
                )}
              </button>
            ))}
          </div>

          <div className="notifications-layout">
            <div className="notifications-feed">
              {loading ? (
                <div className="notifications-loading">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="notifications-empty">
                  <div className="empty-icon">
                    <i className="bx bx-bell-check"></i>
                  </div>
                  <h3>You&apos;re all caught up.</h3>
                  <p>No new notifications right now.</p>
                </div>
              ) : (
                grouped.map(([group, items]) => (
                  <div key={group} className="notification-group">
                    <h3 className="notification-group-title">{group}</h3>
                    <div className="notification-list">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`notification-card ${!item.is_read ? 'unread' : ''}`}
                          onClick={() => !item.is_read && handleMarkRead(item.id)}
                        >
                          {!item.is_read && <span className="unread-dot" />}
                          <div
                            className="notification-icon"
                            style={{ background: getTypeBg(item.notification_type), color: getTypeColor(item.notification_type) }}
                          >
                            <i className={`bx ${getTypeIcon(item.notification_type)}`}></i>
                          </div>
                          <div className="notification-content">
                            <div className="notification-top">
                              <span className="notification-title">{item.title}</span>
                              <span className="notification-time">{item.time_ago}</span>
                            </div>
                            <p className="notification-message">{item.message}</p>
                            <span className="notification-type-label">{item.notification_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="notifications-sidebar">
              <div className="notif-quick-actions">
                <h3>Quick Actions</h3>
                <button className="quick-action-btn" onClick={handleMarkAllRead}>
                  <i className="bx bx-check-double"></i> Mark All As Read
                </button>
                <button className="quick-action-btn">
                  <i className="bx bx-cog"></i> Notification Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
