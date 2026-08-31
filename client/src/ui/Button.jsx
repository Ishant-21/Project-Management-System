/**
 * Button — single place the app's button styling lives.
 *
 * `disabled` deliberately keeps a readable, muted look rather than only
 * dropping opacity: most disabled buttons here mean "you lack permission",
 * and they carry a title explaining why.
 */
const VARIANTS = {
  primary:
    "bg-sky-500 text-white shadow-sm shadow-sky-500/20 hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400 disabled:hover:bg-transparent",
  danger:
    "bg-rose-500 text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:text-slate-400",
};

const SIZES = {
  sm: "text-[12px] px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-[13px] px-4 py-2 gap-2 rounded-xl",
  lg: "text-sm px-5 py-2.5 gap-2 rounded-xl",
  icon: "p-2 rounded-xl",
};

const Button = ({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => (
  <Tag
    className={`inline-flex items-center justify-center font-semibold transition-all duration-150 ${
      VARIANTS[variant] || VARIANTS.primary
    } ${SIZES[size] || SIZES.md} ${className}`}
    {...(Tag === "button" ? { type: props.type || "button" } : {})}
    {...props}
  >
    {children}
  </Tag>
);

export default Button;
