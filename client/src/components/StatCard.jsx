export default function StatCard({ label, value, sub, icon: Icon, color = 'brand' }) {
  const colors = {
    brand:   'bg-brand-500/10 border-brand-500/20 text-brand-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
    red:     'bg-red-500/10 border-red-500/20 text-red-400',
    purple:  'bg-purple-500/10 border-purple-500/20 text-purple-400',
  }
  return (
    <div className="card flex items-center gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}>
          <Icon size={18} />
        </div>
      )}
      <div>
        <div className="text-2xl font-display font-bold text-white">{value}</div>
        <div className="text-xs text-muted">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}
