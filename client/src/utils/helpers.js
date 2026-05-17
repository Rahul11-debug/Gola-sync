export const QUARTERS = ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025', 'Q1-2026']
export const CURRENT_QUARTER = 'Q1-2025'

export const THRUST_AREAS = [
  'Technical', 'Leadership', 'Sales', 'Process Improvement',
  'Academic', 'Quality', 'Customer Success', 'Innovation'
]

export const UOM_TYPES = [
  { value: 'numeric',    label: 'Numeric (higher is better)' },
  { value: 'percentage', label: 'Percentage (higher is better)' },
  { value: 'max_type',   label: 'Max Type (lower is better)' },
  { value: 'timeline',   label: 'Timeline (before deadline)' },
  { value: 'zero_based', label: 'Zero-based (target = 0)' },
]

export function statusBadge(status) {
  const map = {
    draft:        'badge-draft',
    submitted:    'badge-submitted',
    under_review: 'badge-review',
    approved:     'badge-approved',
    rejected:     'badge-rejected',
    locked:       'badge-locked',
  }
  return map[status] || 'badge-draft'
}

export function statusLabel(status) {
  return {
    draft:        'Draft',
    submitted:    'Submitted',
    under_review: 'Under Review',
    approved:     'Approved',
    rejected:     'Rejected',
    locked:       'Locked',
  }[status] || status
}

export function progressColor(score) {
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
