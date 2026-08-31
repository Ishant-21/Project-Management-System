/**
 * Badge — small status pill. Tinted background + saturated text, no heavy fills.
 */
const VARIANTS = {
  default: "bg-slate-100 text-slate-600",
  brand: "bg-sky-50 text-sky-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
  info: "bg-indigo-50 text-indigo-600",
  violet: "bg-violet-50 text-violet-600",
};

const SIZES = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-[11px] px-2.5 py-1",
};

const Badge = ({ variant = "default", size = "md", className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1 font-semibold rounded-md tracking-wide whitespace-nowrap ${
      VARIANTS[variant] || VARIANTS.default
    } ${SIZES[size] || SIZES.md} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
