import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { StyleUsage } from '../../types/dashboard';

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export function StyleUsageChart({ data }: { data: StyleUsage[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <div className="style-chart">
      <div className="style-chart-ring">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell key={item.slug} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} proyecto${value === 1 ? '' : 's'}`, '']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="style-chart-center">
          <strong>{total}</strong>
          <small>proyectos</small>
        </div>
      </div>
      <ul className="style-legend">
        {data.map((item, index) => (
          <li key={item.slug}>
            <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
            <span>{item.name}</span>
            <strong>{Math.round((item.count / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
