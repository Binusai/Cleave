import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import GroupCard from '../components/groups/GroupCard'
import CreateGroupModal from '../components/groups/CreateGroupModal'
import { fetchGroups, createGroup } from '../api/groups'
import './GroupsPage.css'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await fetchGroups()
      setGroups(data)
    } catch (err) {
      console.error('Failed to load groups:', err)
    }
  }

  const handleCreate = async (data: { name: string; description: string; group_type: string }) => {
    try {
      await createGroup(data)
      setShowModal(false)
      loadGroups()
    } catch (err) {
      console.error('Failed to create group:', err)
    }
  }

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div className="dashboard-content">
          <div className="groups-header">
            <div>
              <h1>Groups</h1>
              <p className="groups-subtitle">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-create-group" onClick={() => setShowModal(true)}>
              <i className="bx bx-plus"></i>
              Create Group
            </button>
          </div>

          {groups.length > 0 ? (
            <div className="groups-grid-full">
              {groups.map((group: any) => (
                <GroupCard key={group.id} {...group} />
              ))}
            </div>
          ) : (
            <div className="groups-empty">
              <i className="bx bx-group"></i>
              <h3>No groups yet</h3>
              <p>Create a group to start splitting expenses with friends and family.</p>
              <button className="btn-create-group" onClick={() => setShowModal(true)}>
                <i className="bx bx-plus"></i>
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}