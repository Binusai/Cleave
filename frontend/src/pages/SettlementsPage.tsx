import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import SettlementRow from '../components/settlements/SettlementRow'
import SettlementProgressRing from '../components/settlements/SettlementProgressRing'
import HygieneScore from '../components/settlements/HygieneScore'
import { fetchSettlements, fetchSettlementSummary, fetchSettlementProgress, completeSettlement, remindSettlement, ignoreSettlement } from '../api/settlements'
import './SettlementsPage.css'

export default function SettlementsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'recent' | 'settled' | 'ignored'>('pending')
  const [settlements, setSettlements] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [groupProgress, setGroupProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [activeTab])

  const loadAll = async () => {
    setLoading(true)
    try {
      const statusMap: Record<string, string> = {
        pending: 'pending',
        recent: 'all',
        settled: 'completed',
        ignored: 'ignored',
      }
      const [settleData, summaryData, progressData] = await Promise.all([
        fetchSettlements(`status=${statusMap[activeTab]}`),
        fetchSettlementSummary(),
        fetchSettlementProgress(),
      ])
      setSettlements(settleData)
      setSummary(summaryData)
      setGroupProgress(progressData)
    } catch (err) {
      console.error('Failed to load settlements:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id: number) => {
    await completeSettlement(id)
    loadAll()
  }

  const handleRemind = async (id: number) => {
    await remindSettlement(id)
    loadAll()
  }

  const handleIgnore = async (id: number) => {
    await ignoreSettlement(id)
    loadAll()
  }

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
        <div className="dashboard-content settlements-page">

          <div className="settlements-header">
            <div>
              <h1 className="settlements-title">Settlements</h1>
              <p className="settlements-subtitle">Keep your balances clean and up to date.</p>
            </div>
          </div>

          {summary && (
            <div className="settlements-summary-row">
              <div className="summary-card card-danger">
                <div className="summary-card-icon danger"><i className="bx bx-trending-down"></i></div>
                <div className="summary-card-content">
                  <span className="summary-card-label">You Owe</span>
                  <span className="summary-card-value danger">{formatCurrency(summary.you_owe)}</span>
                  <span className="summary-card-sub">Across {summary.you_owe_count} people</span>
                </div>
              </div>
              <div className="summary-card card-success">
                <div className="summary-card-icon success"><i className="bx bx-trending-up"></i></div>
                <div className="summary-card-content">
                  <span className="summary-card-label">You Are Owed</span>
                  <span className="summary-card-value success">{formatCurrency(summary.you_are_owed)}</span>
                  <span className="summary-card-sub">Across {summary.you_are_owed_count} people</span>
                </div>
              </div>
              <div className="summary-card card-balance">
                <div className="summary-card-icon balance"><i className="bx bx-wallet"></i></div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Net Balance</span>
                  <span className={`summary-card-value ${summary.net_balance >= 0 ? 'success' : 'danger'}`}>
                    {summary.net_balance >= 0 ? '+' : ''}{formatCurrency(summary.net_balance)}
                  </span>
                  <span className="summary-card-sub">{summary.net_balance >= 0 ? "You're in the green" : "Time to settle"}</span>
                </div>
              </div>
              <div className="summary-card card-rate">
                <div className="summary-card-content center">
                  <span className="summary-card-label">Settlement Rate</span>
                  <SettlementProgressRing progress={summary.settlement_rate} size={80} strokeWidth={6} />
                  <span className="summary-card-sub">Great job! Keep it up</span>
                </div>
              </div>
            </div>
          )}

          <div className="settlements-layout">
            <div className="settlements-main">
              <div className="settlements-tabs">
                {(['pending', 'recent', 'settled', 'ignored'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`settlements-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'pending' ? 'Pending' : tab === 'recent' ? 'Recent' : tab === 'settled' ? 'Settled' : 'Ignored'}
                    {tab === 'pending' && <span className="tab-count">{summary?.total_pending || 0}</span>}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="settlements-empty"><p>Loading...</p></div>
              ) : settlements.length === 0 ? (
                <div className="settlements-empty">
                  <i className="bx bx-check-circle"></i>
                  <h3>{activeTab === 'pending' ? "You're all settled up." : 'Nothing here yet'}</h3>
                  <p>{activeTab === 'pending' ? 'No pending balances at the moment.' : 'Settlements will appear here.'}</p>
                </div>
              ) : (
                <div className="settlements-list">
                  {settlements.map((item) => (
                    <SettlementRow
                      key={item.id}
                      settlement={item}
                      onComplete={handleComplete}
                      onRemind={handleRemind}
                      onIgnore={handleIgnore}
                      currentUserId={0}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="settlements-sidebar">
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">Settlement Progress</h3>
                <div className="progress-list">
                  {groupProgress.map((gp) => (
                    <div key={gp.group_id} className="progress-item">
                      <div className="progress-item-header">
                        <span className="progress-group-name">{gp.group_name}</span>
                        <span className={`progress-percent ${gp.progress === 100 ? 'done' : ''}`}>{gp.progress}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className={`progress-bar-fill ${gp.progress === 100 ? 'done' : ''}`} style={{ width: `${gp.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <HygieneScore score={summary?.settlement_rate || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
