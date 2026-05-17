// Live weightage tracker shown during goal creation
export default function WeightMeter({ goals, currentWeight = 0 }) {
  const used = goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0) + Number(currentWeight)
  const remaining = 100 - used
  const isOver  = used > 100
  const isPerfect = used === 100

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted">Weightage used</span>
        <span className={`text-sm font-mono font-bold ${isOver ? 'text-red-400' : isPerfect ? 'text-emerald-400' : 'text-brand-400'}`}>
          {used}% / 100%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-border overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-red-500' : isPerfect ? 'bg-emerald-500' : 'bg-brand-500'}`}
          style={{ width: `${Math.min(used, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className={isOver ? 'text-red-400' : 'text-muted'}>
          {isOver ? `⚠ ${Math.abs(remaining)}% over limit` : `${remaining}% remaining`}
        </span>
        <span className="text-muted">{goals.length}/8 goals</span>
      </div>
    </div>
  )
}
