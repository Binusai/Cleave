import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './SpendingChart.css'

interface Props {
  data: { label: string; total: number }[]
}

export default function SpendingChart({ data }: Props) {
  const chartData = data.length > 0 ? data : Array.from({ length: 6 }, (_, i) => ({
    label: `Month ${i + 1}`, total: 0
  }))

  return (
    <div className="spending-chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#1E3A5F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            contentStyle={{
              background: '#FFF', border: '1px solid #E2E8F0',
              borderRadius: '10px', boxShadow: '0 4px 16px rgba(15,23,42,0.08)', fontSize: '13px',
            }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
          />
          <Area type="monotone" dataKey="total" stroke="#1E3A5F" strokeWidth={2.5} fill="url(#spendingGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}