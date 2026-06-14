import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './SpendingChart.css'

interface SpendingData {
  month: string
  total: number
}

export default function SpendingChart({ data }: { data: SpendingData[] }) {
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', total: 0 },
    { month: 'Feb', total: 0 },
    { month: 'Mar', total: 0 },
    { month: 'Apr', total: 0 },
    { month: 'May', total: 0 },
    { month: 'Jun', total: 0 },
  ]

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Monthly Spending</h3>
        <span className="chart-subtitle">Last 12 months</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
                fontSize: '13px',
              }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spending']}
            />
            <Area type="monotone" dataKey="total" stroke="#1E3A8A" strokeWidth={2.5} fill="url(#spendingGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}