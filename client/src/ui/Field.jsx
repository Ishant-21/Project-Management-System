/**
 * Field / inputClass — one definition of form control styling so every input,
 * select and textarea in the app matches.
 *
 * Size and width live in the exported variants rather than in the shared base.
 * Appending an override at a call site (`${inputClass} w-auto`) does NOT work:
 * Tailwind decides the winner by the order utilities appear in the generated
 * stylesheet, not by the order in the className string — and `w-full` is emitted
 * after `w-auto`, so the override silently loses. Pick a variant instead.
 */
const CONTROL_BASE =
  "rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400";

/** Full-width control for stacked forms. */
export const inputClass = `w-full px-3 py-2 text-[13px] ${CONTROL_BASE}`;

/** Compact, content-width control for inline filter/toolbar rows. */
export const filterClass = `w-auto px-3 py-1.5 text-[12px] ${CONTROL_BASE}`;

export const labelClass =
  "block text-[12px] font-semibold text-slate-600 mb-1.5";

const Field = ({ label, htmlFor, hint, className = "", children }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
    )}
    {children}
    {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
  </div>
);

export default Field;
