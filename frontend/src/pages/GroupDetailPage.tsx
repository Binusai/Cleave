import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import MembersList from '../components/groups/MembersList'
import InviteModal from '../components/groups/InviteModal'
import { fetchCategories, createExpense } from '../api/expenses'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import AddMemberModal from '../components/groups/AddMemberModal'
import { fetchGroupDetail, fetchGroupBalances, deleteGroup } from '../api/groups'
import './GroupDetailPage.css'

export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState<any>(null)
  const [balances, setBalances] = useState<any[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'balances'>('overview')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    if (id) loadData(parseInt(id))
  }, [id])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  const loadData = async (groupId: number) => {
    try {
      const [groupData, balanceData] = await Promise.all([
        fetchGroupDetail(groupId),
        fetchGroupBalances(groupId),
      ])
      setGroup(groupData)
      setBalances(balanceData)
    } catch (err) {
      console.error('Failed to load group:', err)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this group? This cannot be undone.')) return
    try {
      await deleteGroup(parseInt(id))
      navigate('/groups')
    } catch (err) {
      console.error('Failed to delete group:', err)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  if (!group) return null

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
        <div className="dashboard-content">
          <div className="detail-header">
            <button className="back-btn" onClick={() => navigate('/groups')}>
              <i className="bx bx-arrow-back"></i> Back
            </button>
            <div className="detail-actions">
              {(group.user_role === 'owner' || group.user_role === 'admin') && (
                <button className="btn-add-member" onClick={() => setShowAddMember(true)}>
                  <i className="bx bx-user-plus"></i> Add Member
                </button>
              )}
              {(group.user_role === 'owner' || group.user_role === 'admin') && (
                <button className="btn-invite" onClick={() => setShowInvite(true)}>
                  <i className="bx bx-send"></i> Invite
                </button>
              )}
              {group.user_role === 'owner' && (
                <button className="btn-delete" onClick={handleDelete}>
                  <i className="bx bx-trash"></i>
                </button>
              )}
            </div>
          </div>

          <div className="group-detail-card">
            <div className="group-detail-info">
              <h1>{group.name}</h1>
              <p>{group.description || 'No description'}</p>
              <div className="group-meta">
                <span><i className="bx bx-group"></i> {group.member_count} members</span>
                <span><i className="bx bx-wallet"></i> {formatCurrency(group.total_expenses)} total</span>
                <span className={group.user_balance >= 0 ? 'positive' : 'negative'}>
                  <i className={`bx ${group.user_balance >= 0 ? 'bx-trending-up' : 'bx-trending-down'}`}></i>
                  {group.user_balance >= 0 ? '+' : ''}{formatCurrency(group.user_balance)}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-tabs">
            {(['overview', 'members', 'balances'] as const).map((tab) => (
              <button
                key={tab}
                className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'members' && (
            <MembersList groupId={parseInt(id!)} userRole={group.user_role} onRefresh={() => loadData(parseInt(id!))} />
          )}

          {activeTab === 'balances' && (
            <div className="balances-list">
              {balances.map((b: any) => (
                <div key={b.user_id} className="balance-item">
                  <div className="balance-user">
                    <div className="balance-avatar">{b.name.charAt(0)}</div>
                    <div>
                      <span className="balance-name">{b.name}</span>
                      <span className="balance-email">{b.email}</span>
                    </div>
                  </div>
                  <div className={`balance-amount ${b.balance >= 0 ? 'positive' : 'negative'}`}>
                    {b.balance >= 0 ? '+' : ''}{formatCurrency(b.balance)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="overview-placeholder">
              <i className="bx bx-receipt"></i>
              <p>Expenses and activity will appear here</p>
            </div>
          )}
        </div>
        <button className="fab-add-expense" onClick={() => setShowExpenseModal(true)}>
          <i className="bx bx-plus"></i>
          <span>Add Expense</span>
        </button>
      </div>

      {showInvite && (
        <InviteModal
          groupId={parseInt(id!)}
          onClose={() => setShowInvite(false)}
          onInvite={() => loadData(parseInt(id!))}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          groupId={parseInt(id!)}
          onClose={() => setShowAddMember(false)}
          onAdded={() => loadData(parseInt(id!))}
        />
      )}

      {showExpenseModal && group && (
        <AddExpenseModal
          groupId={parseInt(id!)}
          members={group.members || []}
          categories={categories}
          onClose={() => setShowExpenseModal(false)}
          onAdd={async (data: any) => {
            await createExpense(parseInt(id!), data)
            setShowExpenseModal(false)
            loadData(parseInt(id!))
          }}
        />
      )}
    </div>
  )
}
