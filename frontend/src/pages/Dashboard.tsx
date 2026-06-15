import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import SummaryCards from '../components/dashboard/SummaryCards'
import GroupsOverview from '../components/dashboard/GroupsOverview'
import RecentActivity from '../components/dashboard/RecentActivity'
import SpendingChart from '../components/dashboard/SpendingChart'
import CategoryPie from '../components/dashboard/CategoryPie'
import SettlementCard from '../components/dashboard/SettlementCard'
import { fetchSummary, fetchGroupBalances, fetchRecentActivity, fetchMonthlySpending, fetchCategoryBreakdown } from '../api/dashboard'
import './Dashboard.css'

interface SummaryData {
  you_owe: number
  you_are_owed: number
  net_balance: number
  active_groups: number
  total_expenses_this_month: number
  pending_settlements: number
  settlement_completion_rate: number
  monthly_spending_trend: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [groups, setGroups] = useState([])
  const [activities, setActivities] = useState([])
  const [monthlySpending, setMonthlySpending] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, groupsData, activityData, spendingData, categoryData] = await Promise.all([
          fetchSummary(),
          fetchGroupBalances(),
          fetchRecentActivity(),
          fetchMonthlySpending(),
          fetchCategoryBreakdown(),
        ])
        setSummary(summaryData)
        setGroups(groupsData)
        setActivities(activityData)
        setMonthlySpending(spendingData)
        setCategoryBreakdown(categoryData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }
    loadData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getInsight = () => {
    if (!summary) return ''
    if (summary.net_balance > 0) return 'You\'re in a great position — you\'re owed more than you owe.'
    if (summary.net_balance < 0) return 'Focus on settling your dues this week to stay on track.'
    return 'You\'re all squared up. Perfect balance!'
  }

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
          <div className="welcome-section">
            <div>
              <h1>{getGreeting()}, Binusai</h1>
              <p className="welcome-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="welcome-insight">
              <i className="bx bx-bulb"></i>
              <span>{getInsight()}</span>
            </div>
          </div>

          {summary && <SummaryCards data={summary} />}

          <div className="dashboard-grid">
            <div className="dashboard-grid-main">
              <SpendingChart data={monthlySpending} />
              <GroupsOverview groups={groups} />
            </div>
            <div className="dashboard-grid-side">
              <SettlementCard summary={summary} />
              <CategoryPie data={categoryBreakdown} />
            </div>
          </div>

          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}
