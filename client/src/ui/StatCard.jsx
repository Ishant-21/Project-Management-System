/**
 * StatCard — the signature metric tile: uppercase micro-label, tinted icon
 * chip, oversized value, and a decorative blob that blooms on hover.
 */
const TONES = {
  brand: { chip: "bg-sky-50 text-sky-500", hover: "group-hover:bg-sky-500", blob: "bg-sky-50" },
  success: { chip: "bg-emerald-50 text-emerald-500", hover: "group-hover:bg-emerald-500", blob: "bg-emerald-50" },
  violet: { chip: "bg-violet-50 text-violet-500", hover: "group-hover:bg-violet-500", blob: "bg-violet-50" },
  warning: { chip: "bg-amber-50 text-amber-500", hover: "group-hover:bg-amber-500", blob: "bg-amber-50" },
  danger: { chip: "bg-rose-50 text-rose-500", hover: "group-hover:bg-rose-500", blob: "bg-rose-50" },
  slate: { chip: "bg-slate-100 text-slate-500", hover: "group-hover:bg-slate-500", blob: "bg-slate-100" },
};

const StatCard = ({ icon: Icon, label, value, sublabel, tone = "brand" }) => {
  const t = TONES[tone] || TONES.brand;

  return (
    <div className="group relative overflow-hidden min-h-[118px] flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div
        className={`absolute -right-2 -top-2 w-16 h-16 ${t.blob} rounded-full opacity-0 group-hover:opacity-60 group-hover:scale-150 transition-all duration-500`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="label-micro text-slate-500">{label}</span>
          {Icon && (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${t.chip} ${t.hover} group-hover:text-white`}
            >
              <Icon size={17} strokeWidth={2} />
            </div>
          )}
        </div>
        <div>
          <span className="block text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          {sublabel && (
            <span className="mt-1.5 inline-block text-[11px] text-slate-400 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
