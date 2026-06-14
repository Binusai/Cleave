import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import SpendingChart from '../components/analytics/SpendingChart'
import CategoryDonut from '../components/analytics/CategoryDonut'
import TopGroups from '../components/analytics/TopGroups'
import HealthScoreCard from '../components/analytics/HealthScoreCard'
import { fetchOverview, fetchSpendingTrends, fetchCategories, fetchGroupAnalytics, fetchPeopleAnalytics, fetchFinancialHealth } from '../api/analytics'
import { fetchGroups } from '../api/groups'
import './AnalyticsPage.css'

export default function AnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dateRange, setDateRange] = useState(30)
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [overview, setOverview] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [topGroups, setTopGroups] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    loadAll()
  }, [dateRange, selectedGroup, period])

  const loadGroups = async () => {
    try {
      const data = await fetchGroups()
      setGroups(data)
    } catch {}
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const groupParam = selectedGroup !== 'all' ? `&group_id=${selectedGroup}` : ''
      const [overviewData, trendsData, catData, groupData, peopleData, healthData] = await Promise.all([
        fetchOverview(`days=${dateRange}${groupParam}`),
        fetchSpendingTrends(`period=${period}&months=12${groupParam}`),
        fetchCategories(`days=${dateRange}${groupParam}`),
        fetchGroupAnalytics(`days=${dateRange}&limit=5`),
        fetchPeopleAnalytics(`days=${dateRange * 3}&limit=5`),
        fetchFinancialHealth(),
      ])
      setOverview(overviewData)
      setTrends(trendsData)
      setCategories(catData)
      setTopGroups(groupData)
      setPeople(peopleData)
      setHealth(healthData)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val}%`

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar/>
        <div className="dashboard-content analytics-page">

          <div className="analytics-header">
            <div>
              <h1 className="analytics-title">Analytics</h1>
              <p className="analytics-subtitle">Understand your spending, habits and group activity.</p>
            </div>
            <div className="analytics-filters">
              <select value={dateRange} onChange={(e) => setDateRange(parseInt(e.target.value))}>
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 3 Months</option>
                <option value={365}>Last 12 Months</option>
              </select>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                <option value="all">All Groups</option>
                {groups.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          {overview && (
            <div className="analytics-summary-row">
              <div className="analytics-summary-card">
                <span className="analytics-card-label">Total Spent</span>
                <span className="analytics-card-value">{formatCurrency(overview.overview.total_spent)}</span>
                <span className={`analytics-card-change ${overview.overview.spending_change >= 0 ? 'up' : 'down'}`}>
                  {formatPercent(overview.overview.spending_change)} vs previous
                </span>
              </div>
              <div className="analytics-summary-card">
                <span className="analytics-card-label">Average Per Day</span>
                <span className="analytics-card-value">{formatCurrency(overview.overview.avg_per_day)}</span>
                <span className={`analytics-card-change ${overview.overview.avg_change >= 0 ? 'up' : 'down'}`}>
                  {formatPercent(overview.overview.avg_change)} vs previous
                </span>
              </div>
              <div className="analytics-summary-card">
                <span className="analytics-card-label">Total Expenses</span>
                <span className="analytics-card-value">{overview.overview.total_expenses}</span>
                <span className={`analytics-card-change ${overview.overview.count_change >= 0 ? 'up' : 'down'}`}>
                  {overview.overview.count_change >= 0 ? '+' : ''}{overview.overview.count_change} vs previous
                </span>
              </div>
              <div className="analytics-summary-card">
                <span className="analytics-card-label">Active Groups</span>
                <span className="analytics-card-value">{overview.overview.active_groups}</span>
              </div>
              <div className="analytics-summary-card">
                <span className="analytics-card-label">Top Category</span>
                <span className="analytics-card-value" style={{ fontSize: overview.overview.top_category.length > 12 ? 18 : 24 }}>
                  {overview.overview.top_category}
                </span>
                <span className="analytics-card-change">{overview.overview.top_category_percent}% of spending</span>
              </div>
            </div>
          )}

          <div className="analytics-chart-section">
            <div className="analytics-chart-card">
              <div className="chart-card-header">
                <h3>Spending Over Time</h3>
                <div className="chart-period-tabs">
                  {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                    <button
                      key={p}
                      className={`period-tab ${period === p ? 'active' : ''}`}
                      onClick={() => setPeriod(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="chart-loading">Loading chart...</div>
              ) : (
                <SpendingChart data={trends} />
              )}
            </div>
          </div>

          <div className="analytics-grid">
            <div className="analytics-grid-main">
              <TopGroups groups={topGroups} formatCurrency={formatCurrency} />
              
              <div className="analytics-card">
                <h3 className="analytics-card-title">Top Contributors</h3>
                <div className="people-list">
                  {people.map((p: any) => (
                    <div key={p.user_id} className="people-row">
                      <div className="people-avatar">{p.name.charAt(0)}</div>
                      <div className="people-info">
                        <span className="people-name">{p.name}</span>
                        <span className="people-stat">{p.expense_count} expenses</span>
                      </div>
                      <div className="people-amounts">
                        <span className="people-paid">{formatCurrency(p.total_paid)}</span>
                        <span className="people-percent">{p.contribution_percent}%</span>
                      </div>
                    </div>
                  ))}
                  {people.length === 0 && (
                    <div className="empty-list">No data for this period</div>
                  )}
                </div>
              </div>
            </div>

            <div className="analytics-grid-side">
              <CategoryDonut data={categories} total={overview?.overview?.total_spent || 0} formatCurrency={formatCurrency} />
              <HealthScoreCard health={health} />
            </div>
          </div>

          {overview?.patterns && (
            <div className="analytics-patterns-row">
              <div className="pattern-card">
                <i className="bx bx-receipt"></i>
                <div>
                  <span className="pattern-label">Avg Expense</span>
                  <span className="pattern-value">{formatCurrency(overview.patterns.avg_expense_value)}</span>
                </div>
              </div>
              <div className="pattern-card">
                <i className="bx bx-trending-up"></i>
                <div>
                  <span className="pattern-label">Largest Expense</span>
                  <span className="pattern-value">{formatCurrency(overview.patterns.largest_expense)}</span>
                  <span className="pattern-sub">{overview.patterns.largest_expense_title}</span>
                </div>
              </div>
              <div className="pattern-card">
                <i className="bx bx-calendar"></i>
                <div>
                  <span className="pattern-label">Most Expensive Day</span>
                  <span className="pattern-value">{formatCurrency(overview.patterns.most_expensive_day_amount)}</span>
                </div>
              </div>
              <div className="pattern-card">
                <i className="bx bx-check-shield"></i>
                <div>
                  <span className="pattern-label">Expense Streak</span>
                  <span className="pattern-value">{overview.health?.spending_streak_days || 0} days</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}