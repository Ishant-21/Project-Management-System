/**
 * EmptyState — centred icon medallion, headline, hint, optional action.
 */
const EmptyState = ({ icon: Icon, title, hint, action, className = "" }) => (
  <div className={`text-center px-6 py-14 ${className}`}>
    {Icon && (
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <Icon size={24} strokeWidth={1.8} />
      </div>
    )}
    <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
    {hint && <p className="mt-1 text-[13px] text-slate-500">{hint}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
