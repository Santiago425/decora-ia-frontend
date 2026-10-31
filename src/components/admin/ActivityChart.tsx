import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyPoint } from '../../types/admin';

const SERIES = [
  { key: 'projects', label: 'Proyectos', color: '#2d74a6' },
  { key: 'redesigns', label: 'Rediseños', color: '#c4704f' },
] as const;

const dayLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'short' });

export function ActivityChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="activity-chart" role="img" aria-label="Proyectos y rediseños creados por día">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="var(--sand-200)" />
          <XAxis dataKey="day" tickFormatter={dayLabel} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--sand-100)' }}
            labelFormatter={(day) => dayLabel(String(day))}
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)', color: 'var(--ink)' }}
          />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13 }} formatter={(label) => <span style={{ color: 'var(--ink-soft)' }}>{label}</span>} />
          {SERIES.map((series) => (
            <Bar key={series.key} dataKey={series.key} name={series.label} fill={series.color} radius={[4, 4, 0, 0]} maxBarSize={18} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
