import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './CategoryPie.css'

interface CategoryData {
  category: string
  total: number
  color: string
  count: number
}

const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B', '#3B82F6']

export default function CategoryPie({ data }: { data: CategoryData[] }) {
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const displayData = data.length > 0 ? data.slice(0, 6) : [{ category: 'No data', total: 1, color: '#E2E8F0', count: 0 }]

  return (
    <div className="pie-card">
      <div className="pie-header">
        <h3>Spending by Category</h3>
      </div>
      <div className="pie-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="total"
            >
              {displayData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '13px',
              }}
              formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pie-legend">
        {displayData.map((item, index) => (
          <div key={item.category} className="pie-legend-item">
            <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }}></span>
            <span className="legend-label">{item.category}</span>
            <span className="legend-value">{total > 0 ? `${Math.round((item.total / total) * 100)}%` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}