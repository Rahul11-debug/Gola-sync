import { progressColor } from '../utils/helpers'

export default function ProgressBar({ score = 0, showLabel = true, height = 6 }) {
  const color = progressColor(score)
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted">Progress</span>
          <span className="text-xs font-mono font-medium" style={{ color }}>{score}%</span>
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: '#1e2636' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}
