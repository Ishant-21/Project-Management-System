import Card from "./Card";

/**
 * SectionCard — a Card with the standard header strip: title on the left,
 * optional action on the right, hairline divider, then flush body content.
 */
const SectionCard = ({ title, icon: Icon, action, className = "", bodyClassName = "", children }) => (
  <Card className={`overflow-hidden ${className}`}>
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
      <h2 className="flex items-center gap-2 text-[14px] font-bold text-slate-800">
        {Icon && <Icon size={15} className="text-slate-400" strokeWidth={2} />}
        {title}
      </h2>
      {action}
    </div>
    <div className={bodyClassName}>{children}</div>
  </Card>
);

export default SectionCard;
