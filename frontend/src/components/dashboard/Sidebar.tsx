import { useAuth } from '../../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const menuItems = [
  { icon: 'bx-grid-alt', label: 'Dashboard', path: '/dashboard' },
  { icon: 'bx-user-voice', label: 'People', path: '/people' },
  { icon: 'bx-group', label: 'Groups', path: '/groups' },
  { icon: 'bx-receipt', label: 'Expenses', path: '/expenses' },
  { icon: 'bx-transfer', label: 'Settlements', path: '/settlements' },
  { icon: 'bx-line-chart', label: 'Analytics', path: '/analytics' },
  { icon: 'bx-bulb', label: 'AI Insights', path: '/ai/insights' },
  { icon: 'bx-bell', label: 'Notifications', path: '/notifications' },
]

const bottomItems = [
  { icon: 'bx-user-circle', label: 'Profile', path: '/profile' },
  { icon: 'bx-cog', label: 'Settings', path: '/settings' },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNav = (path: string) => {
    navigate(path)
    if (onMobileClose) onMobileClose()
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={onMobileClose}
      />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

        {/* Menu header */}
        <div className="sidebar-menu-header">
          <button className="sidebar-menu-btn desktop-only" onClick={onToggle} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
            <i className="bx bx-menu"></i>
            {!collapsed && <span>Menu</span>}
          </button>
          <button className="sidebar-menu-btn mobile-only" onClick={onMobileClose}>
            <i className="bx bx-x"></i>
            {<span>Close</span>}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <i className={`bx ${item.icon}`}></i>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {bottomItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <i className={`bx ${item.icon}`}></i>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
          <button className="sidebar-item logout" onClick={logout}>
            <i className="bx bx-log-out"></i>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}