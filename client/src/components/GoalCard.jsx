import { statusBadge, statusLabel, fmtDate } from '../utils/helpers'
import { Lock, Trash2, Edit, Calendar } from 'lucide-react'

export default function GoalCard({ goal, onEdit, onDelete, showActions = true }) {
  const canEdit   = goal.status === 'draft' && !goal.locked
  const canDelete = goal.status === 'draft' && !goal.locked

  return (
    <div className="card hover:border-brand-500/30 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={statusBadge(goal.status)}>{statusLabel(goal.status)}</span>
            {goal.locked && <Lock size={12} className="text-purple-400" />}
          </div>
          <h3 className="font-display font-semibold text-white text-sm leading-tight truncate">{goal.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-display font-bold text-brand-400">{goal.weightage}%</div>
          <div className="text-xs text-muted">weight</div>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-muted mb-3 line-clamp-2">{goal.description}</p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-surface rounded-lg p-2 text-center">
          <div className="text-xs text-muted mb-0.5">Area</div>
          <div className="text-xs font-medium text-slate-300 truncate">{goal.thrust_area || '—'}</div>
        </div>
        <div className="bg-surface rounded-lg p-2 text-center">
          <div className="text-xs text-muted mb-0.5">Target</div>
          <div className="text-xs font-mono font-medium text-slate-300">{goal.target}</div>
        </div>
        <div className="bg-surface rounded-lg p-2 text-center">
          <div className="text-xs text-muted mb-0.5">UoM</div>
          <div className="text-xs font-medium text-slate-300 truncate capitalize">{goal.uom_type?.replace('_', ' ')}</div>
        </div>
      </div>

      {goal.deadline && (
        <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
          <Calendar size={11} />
          <span>Deadline: {fmtDate(goal.deadline)}</span>
        </div>
      )}

      {showActions && (canEdit || canDelete) && (
        <div className="flex gap-2 pt-3 border-t border-border">
          {canEdit && (
            <button onClick={() => onEdit?.(goal)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5">
              <Edit size={13} /> Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete?.(goal._id)} className="btn-danger flex-1 flex items-center justify-center gap-1.5 py-1.5">
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
