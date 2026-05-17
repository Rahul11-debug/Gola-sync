export default function Empty({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {Icon && <Icon size={40} className="text-muted opacity-40" />}
      <p className="font-display font-semibold text-slate-400">{title}</p>
      {sub && <p className="text-sm text-muted max-w-xs">{sub}</p>}
      {action}
    </div>
  )
}
