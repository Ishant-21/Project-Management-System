import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip — dark bubble with an arrow, matching the reference UI.
 *
 * Three details that matter:
 *
 * 1. `width: max-content`. A fixed-position box given only a `left` offset
 *    shrink-to-fits into the *remaining* viewport width, so a tooltip on a
 *    top-right action button collapsed into a narrow, tall, unreadable column
 *    jammed against the edge. max-content makes it size to its text instead,
 *    and the measured position is then clamped back into the viewport.
 *
 * 2. Listeners live on the WRAPPER, not the child, and index.css makes a
 *    disabled child transparent to hit-testing. Chrome retargets hover to the
 *    ancestor, but Firefox and Safari suppress mouse events on disabled form
 *    controls entirely — which is where most of these tooltips live.
 *
 * 3. The bubble is portalled to document.body, so the `overflow-hidden` cards
 *    and scrolling table containers it sits inside cannot clip it.
 *
 * A falsy `title` renders the child untouched, so the
 * `title={allowed ? undefined : reason}` pattern keeps working.
 */
const GAP = 8;
const EDGE = 8;
const MAX_W = 260;

const isVertical = (p) => p === "top" || p === "bottom";

/**
 * Positions itself from its own measured size, then clamps into the viewport.
 * Rendered invisible for the first frame so the correction never flashes.
 */
const Bubble = ({ id, title, placement, anchor }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { width: w, height: h } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let place = placement;
    // Flip if there is no room on the preferred side.
    if (place === "top" && anchor.top - GAP - h < EDGE) place = "bottom";
    else if (place === "bottom" && anchor.bottom + GAP + h > vh - EDGE)
      place = "top";
    else if (place === "left" && anchor.left - GAP - w < EDGE) place = "right";
    else if (place === "right" && anchor.right + GAP + w > vw - EDGE)
      place = "left";

    let left;
    let top;
    if (place === "top") {
      left = anchor.left + anchor.width / 2 - w / 2;
      top = anchor.top - GAP - h;
    } else if (place === "bottom") {
      left = anchor.left + anchor.width / 2 - w / 2;
      top = anchor.bottom + GAP;
    } else if (place === "left") {
      left = anchor.left - GAP - w;
      top = anchor.top + anchor.height / 2 - h / 2;
    } else {
      left = anchor.right + GAP;
      top = anchor.top + anchor.height / 2 - h / 2;
    }

    const clampedLeft = Math.min(Math.max(left, EDGE), Math.max(EDGE, vw - w - EDGE));
    const clampedTop = Math.min(Math.max(top, EDGE), Math.max(EDGE, vh - h - EDGE));

    // Keep the arrow pointing at the anchor even after clamping.
    const arrow = isVertical(place)
      ? {
          left: Math.min(
            Math.max(anchor.left + anchor.width / 2 - clampedLeft, 10),
            w - 10
          ),
        }
      : {
          top: Math.min(
            Math.max(anchor.top + anchor.height / 2 - clampedTop, 10),
            h - 10
          ),
        };

    setPos({ left: clampedLeft, top: clampedTop, place, arrow });
  }, [anchor, placement, title]);

  const place = pos?.place || placement;
  const arrowSide = {
    top: "bottom-[-3px]",
    bottom: "top-[-3px]",
    left: "right-[-3px]",
    right: "left-[-3px]",
  }[place];

  return (
    <span
      ref={ref}
      id={id}
      role="tooltip"
      style={{
        left: pos ? pos.left : (anchor.left ?? 0),
        top: pos ? pos.top : (anchor.top ?? 0),
        // max-content, so the bubble sizes to its text rather than to whatever
        // space is left between `left` and the right edge of the window.
        width: "max-content",
        maxWidth: `min(${MAX_W}px, calc(100vw - ${EDGE * 2}px))`,
        visibility: pos ? "visible" : "hidden",
      }}
      // pointer-events-none so the bubble can never sit between the cursor and
      // the control it describes.
      className="fixed z-[100] pointer-events-none px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-[12px] font-medium leading-snug shadow-lg text-left"
    >
      {title}
      <span
        aria-hidden="true"
        style={pos ? pos.arrow : undefined}
        className={`absolute w-1.5 h-1.5 rotate-45 bg-slate-900 ${arrowSide}`}
      />
    </span>
  );
};

const Tooltip = ({
  title,
  placement = "top",
  className = "",
  children,
  ...props
}) => {
  const [anchor, setAnchor] = useState(null);
  const wrapperRef = useRef(null);
  const id = useId();

  const hide = useCallback(() => setAnchor(null), []);

  const show = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
      width: r.width,
      height: r.height,
    });
  }, []);

  // Fixed coordinates go stale once the page moves, so dismiss rather than
  // leave the bubble floating somewhere wrong.
  useEffect(() => {
    if (!anchor) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchor, hide]);

  // Nothing to say — render the child as-is, no wrapper, no listeners.
  if (!title) return children;

  return (
    <span
      ref={wrapperRef}
      // data-tooltip lets index.css make a disabled child transparent to
      // hit-testing, for the browsers that suppress its mouse events entirely.
      data-tooltip=""
      className={`inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      {...props}
    >
      {children}

      {anchor &&
        createPortal(
          <Bubble id={id} title={title} placement={placement} anchor={anchor} />,
          document.body
        )}
    </span>
  );
};

export default Tooltip;
