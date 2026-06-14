import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { fetchInsights } from '../api/ai'
import './AIInsightsPage.css'

export default function AIInsightsPage() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const insights = await fetchInsights()
      setData(insights)
    } catch (err) {
      console.error('Failed to load AI insights:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const severityColors: Record<string, string> = {
    positive: '#DCFCE7',
    warning: '#FEF3C7',
    info: '#DBEAFE',
  }
  const severityIcons: Record<string, string> = {
    positive: '#16A34A',
    warning: '#F59E0B',
    info: '#1E3A5F',
  }

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar />
        <div className="dashboard-content ai-insights-page">

          <div className="ai-sub-nav">
            <Link to="/ai/insights" className={`ai-nav-link ${location.pathname === '/ai/insights' ? 'active' : ''}`}>
              <i className="bx bx-bulb"></i> AI Insights
            </Link>
            <Link to="/ai/chat" className={`ai-nav-link ${location.pathname === '/ai/chat' ? 'active' : ''}`}>
              <i className="bx bx-bot"></i> Cleave AI
            </Link>
          </div>

          <div className="ai-header">
            <div>
              <h1 className="ai-title">AI Insights</h1>
              <p className="ai-subtitle">Personalized financial intelligence powered by your Cleave activity.</p>
            </div>
          </div>

          {data && (
            <div className="ai-summary-cards">
              <div className="ai-summary-card">
                <div className="ai-summary-ring">
                  <svg width="80" height="80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#16A34A" strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - data.health_score / 100)}
                      strokeLinecap="round" transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                    />
                  </svg>
                  <span className="ring-text">{data.health_score}</span>
                </div>
                <span className="ai-card-label">Financial Health</span>
              </div>
              <div className="ai-summary-card">
                <span className="ai-card-value green">{formatCurrency(data.potential_savings)}</span>
                <span className="ai-card-label">Potential Savings</span>
              </div>
              <div className="ai-summary-card">
                <span className="ai-card-value amber">{formatCurrency(data.pending_owed)}</span>
                <span className="ai-card-label">Pending Collections</span>
              </div>
              <div className="ai-summary-card">
                <span className="ai-card-value">{data.top_category}</span>
                <span className="ai-card-label">Top Category</span>
              </div>
            </div>
          )}

          {data?.insights && (
            <div className="ai-section">
              <h3>Today's Insights</h3>
              <div className="insights-grid">
                {data.insights.map((insight: any, i: number) => (
                  <div key={i} className="insight-card"
                    style={{ borderLeft: `4px solid ${severityIcons[insight.severity] || '#1E3A5F'}` }}>
                    <div className="insight-icon" style={{ background: severityColors[insight.severity] || '#DBEAFE' }}>
                      <i className={`bx ${insight.icon || 'bx-bulb'}`} style={{ color: severityIcons[insight.severity] || '#1E3A5F' }}></i>
                    </div>
                    <div className="insight-content">
                      <span className="insight-title">{insight.title}</span>
                      <p className="insight-message">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.recommendations && (
            <div className="ai-section">
              <h3>Recommendations</h3>
              <div className="recommendations-grid">
                {data.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="recommendation-card">
                    <div className="rec-header">
                      <i className="bx bx-target-lock"></i>
                      <span>{rec.title}</span>
                    </div>
                    <p className="rec-message">{rec.message}</p>
                    {rec.potential_savings > 0 && (
                      <span className="rec-savings">Save up to {formatCurrency(rec.potential_savings)}/mo</span>
                    )}
                    <button className="rec-action">{rec.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <div className="ai-loading">Analyzing your finances...</div>}
        </div>
      </div>
    </div>
  )
}