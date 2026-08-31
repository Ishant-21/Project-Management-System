/**
 * PageHeader — title, optional subtitle, and right-aligned actions.
 */
const PageHeader = ({ title, subtitle, actions, className = "" }) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
  >
    <div className="min-w-0">
      <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
