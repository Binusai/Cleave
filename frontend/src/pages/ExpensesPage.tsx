import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import ExpenseList from '../components/expenses/ExpenseList'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import { fetchGroups } from '../api/groups'
import { fetchGroupExpenses, fetchCategories, createExpense, deleteExpense } from '../api/expenses'
import './ExpensesPage.css'

export default function ExpensesPage() {
  const [searchParams] = useSearchParams()
  const groupIdParam = searchParams.get('group')

  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | null>(
    groupIdParam ? parseInt(groupIdParam) : null
  )
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAllGroups, setShowAllGroups] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768)
  }

  useEffect(() => {
    loadGroups()
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedGroup) loadExpenses(selectedGroup)
  }, [selectedGroup])

  const loadGroups = async () => {
    try {
      const data = await fetchGroups()
      setGroups(data)
      if (!selectedGroup && data.length > 0) {
        setSelectedGroup(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load groups:', err)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadExpenses = async (gId: number) => {
    setLoading(true)
    try {
      const data = await fetchGroupExpenses(gId)
      setExpenses(data)
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (data: any) => {
    if (!selectedGroup) return
    try {
      await createExpense(selectedGroup, data)
      setShowAddModal(false)
      loadExpenses(selectedGroup)
    } catch (err) {
      console.error('Failed to create expense:', err)
      throw err
    }
  }

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Delete this expense? This will recalculate all balances.')) return
    try {
      await deleteExpense(expenseId)
      if (selectedGroup) loadExpenses(selectedGroup)
    } catch (err) {
      console.error('Failed to delete expense:', err)
    }
  }

  const selectedGroupData = groups.find((g) => g.id === selectedGroup)
  const displayedGroups = showAllGroups ? groups : groups.slice(0, isMobile ? 99 : 6)
  const hasMore = groups.length > 6

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

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
          <div className="expenses-header">
            <div>
              <h1>Expenses</h1>
              <p className="expenses-subtitle">
                {selectedGroupData
                  ? `${selectedGroupData.name} — ${formatCurrency(selectedGroupData.total_expenses)} total`
                  : 'Select a group'}
              </p>
            </div>
            <button
              className="btn-create-expense"
              onClick={() => setShowAddModal(true)}
              disabled={!selectedGroup}
            >
              <i className="bx bx-plus"></i> Add Expense
            </button>
          </div>

          {isMobile ? (
            <div className="mobile-group-select">
              <button
                className="mobile-select-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{selectedGroupData?.name || 'Select Group'}</span>
                <i className={`bx ${dropdownOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
              </button>
              {dropdownOpen && (
                <div className="mobile-dropdown">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      className={`mobile-dropdown-item ${selectedGroup === group.id ? 'active' : ''}`}
                      onClick={() => { setSelectedGroup(group.id); setDropdownOpen(false) }}
                    >
                      <span>{group.name}</span>
                      <span className={group.user_balance >= 0 ? 'positive' : 'negative'}>
                        {group.user_balance >= 0 ? '+' : ''}{formatCurrency(group.user_balance)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="expenses-group-tabs-wrapper" ref={tabsRef}>
              <div className="expenses-group-tabs">
                {displayedGroups.map((group) => (
                  <button
                    key={group.id}
                    className={`group-tab ${selectedGroup === group.id ? 'active' : ''}`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <span className="group-tab-name">{group.name}</span>
                    <span className="group-tab-balance">
                      {group.user_balance >= 0 ? '+' : ''}
                      {formatCurrency(group.user_balance)}
                    </span>
                  </button>
                ))}
                {hasMore && !showAllGroups && (
                  <button className="group-tab more-tab" onClick={() => setShowAllGroups(true)}>
                    <span className="group-tab-name">+{groups.length - 6} more</span>
                    <i className="bx bx-chevron-down"></i>
                  </button>
                )}
                {showAllGroups && hasMore && (
                  <button className="group-tab more-tab" onClick={() => setShowAllGroups(false)}>
                    <span className="group-tab-name">Show less</span>
                    <i className="bx bx-chevron-up"></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="expenses-loading">Loading...</div>
          ) : (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
            />
          )}
        </div>
      </div>

      {showAddModal && selectedGroupData && (
        <AddExpenseModal
          groupId={selectedGroup!}
          members={selectedGroupData.members || []}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  )
}
