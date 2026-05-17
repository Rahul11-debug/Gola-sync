import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  )
}

export function GoalProgressBar({ goals = [], updates = [] }) {
  const data = goals.map(g => {
    const upd = updates.find(u =>
      u.goal_id === g._id || u.goal_id?.toString?.() === g._id?.toString?.()
    )
    return {
      name: g.title.length > 22 ? g.title.slice(0, 20) + '…' : g.title,
      progress: upd?.progress_score || 0,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="progress" name="Progress" fill="#0c89eb" radius={[0, 6, 6, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TeamScoreChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" name="Score" fill="#0c89eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function StatusDonut({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart innerRadius="40%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar minAngle={15} dataKey="value" cornerRadius={4} />
        <Legend iconSize={10} layout="vertical" align="right"
          wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
