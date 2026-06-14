import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './CategoryDonut.css'

interface Props {
  data: { category: string; total: number; color: string; percent: number }[]
  total: number
  formatCurrency: (val: number) => string
}

const COLORS = ['#1E3A5F', '#16A34A', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B', '#3B82F6', '#06B6D4']

export default function CategoryDonut({ data, total, formatCurrency }: Props) {
  const displayData = data.length > 0 ? data.slice(0, 6) : [{ category: 'No data', total: 1, color: '#E2E8F0', percent: 100 }]

  return (
    <div className="donut-card">
      <h3 className="donut-title">Spending by Category</h3>
      <div className="donut-container">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={displayData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={2} dataKey="total">
              {displayData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px' }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span className="donut-center-value">{formatCurrency(total)}</span>
          <span className="donut-center-label">Total</span>
        </div>
      </div>
      <div className="donut-legend">
        {displayData.map((item, i) => (
          <div key={item.category} className="donut-legend-item">
            <span className="donut-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
            <span className="donut-legend-label">{item.category}</span>
            <span className="donut-legend-percent">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}