import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { fetchGroups } from '../api/groups'
import './MembersPage.css'

interface MemberInfo {
  user_id: number
  name: string
  email: string
  role: string
  group_name: string
  group_id: number
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberInfo[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [qrModal, setQrModal] = useState<{ show: boolean; link: string }>({ show: false, link: '' })

  useEffect(() => {
    loadAllMembers()
  }, [])

  const loadAllMembers = async () => {
    try {
      const groups = await fetchGroups()
      const allMembers: MemberInfo[] = []

      for (const group of groups) {
        if (group.members) {
          for (const m of group.members) {
            allMembers.push({
              user_id: m.user,
              name: m.user_name,
              email: m.user_email,
              role: m.role,
              group_name: group.name,
              group_id: group.id,
            })
          }
        }
      }

      const unique = allMembers.filter(
        (m, i, arr) => arr.findIndex((x) => x.user_id === m.user_id && x.group_id === m.group_id) === i
      )
      setMembers(unique)
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }

  const showQr = (groupId: number) => {
    const link = `${window.location.origin}/groups/${groupId}`
    setQrModal({ show: true, link })
  }

  const grouped = members.reduce((acc: Record<string, MemberInfo[]>, m) => {
    if (!acc[m.group_name]) acc[m.group_name] = []
    acc[m.group_name].push(m)
    return acc
  }, {})

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar/>
        <div className="dashboard-content">
          <div className="members-header">
            <div>
              <h1>Members</h1>
              <p className="members-subtitle">{members.length} members across {Object.keys(grouped).length} groups</p>
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="members-empty">
              <i className="bx bx-user-voice"></i>
              <h3>No members yet</h3>
              <p>Create a group and add members to get started.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, groupMembers]) => (
              <div key={groupName} className="member-group-section">
                <div className="member-group-header">
                  <h3>{groupName}</h3>
                  <span>{groupMembers.length} member{groupMembers.length > 1 ? 's' : ''}</span>
                  <button
                    className="btn-qr"
                    onClick={() => showQr(groupMembers[0].group_id)}
                  >
                    <i className="bx bx-qr"></i> Share Group
                  </button>
                </div>
                <div className="member-list">
                  {groupMembers.map((m) => (
                    <div key={`${m.user_id}-${m.group_id}`} className="member-row">
                      <div className="member-avatar-sm">
                        {m.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="member-info-flex">
                        <span className="member-name-text">{m.name}</span>
                        <span className="member-email-text">{m.email}</span>
                      </div>
                      <span className={`member-role-badge ${m.role}`}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {qrModal.show && (
        <div className="modal-overlay" onClick={() => setQrModal({ show: false, link: '' })}>
          <div className="modal-container qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Group</h2>
              <button className="modal-close" onClick={() => setQrModal({ show: false, link: '' })}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="qr-code-section">
              <p>Scan this QR code to join the group</p>
              <div className="qr-placeholder">
                <i className="bx bx-qr" style={{ fontSize: 120, color: '#1E3A8A' }}></i>
              </div>
              <div className="invite-link-box" style={{ marginTop: 16 }}>
                <input type="text" value={qrModal.link} readOnly />
                <button onClick={() => { navigator.clipboard.writeText(qrModal.link) }}>
                  <i className="bx bx-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}