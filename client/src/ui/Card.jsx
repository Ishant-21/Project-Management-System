/**
 * Card — the standard surface: white, hairline slate border, soft shadow.
 * `hover` adds the lift used on clickable cards.
 */
const Card = ({ as: Tag = "div", hover = false, className = "", children, ...props }) => (
  <Tag
    className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${
      hover ? "hover:shadow-md hover:border-slate-300 transition-all duration-200" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

export default Card;
