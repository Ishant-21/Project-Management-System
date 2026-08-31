import { useEffect, useRef } from "react";

/**
 * Shared dialog shell.
 *
 * - the backdrop scrolls and the panel is capped at 90vh, so tall forms (and
 *   their submit buttons) stay reachable on short viewports
 * - Escape and backdrop clicks close it
 * - background scrolling is locked while open
 * - role/aria-modal + initial focus for assistive tech
 */
const Modal = ({
  isOpen,
  onClose,
  labelledBy,
  children,
  panelClassName = "max-w-lg",
}) => {
  const panelRef = useRef(null);

  // Callers pass an inline arrow, so `onClose` is a new function every render.
  // Holding it in a ref keeps the effect below keyed on `isOpen` alone -
  // otherwise it would tear down and re-run on every keystroke, re-focusing the
  // panel and yanking focus out of whatever field the user was typing in.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Lock background scroll, restoring whatever was there before.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog once, when it opens.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center"
      onMouseDown={(event) => {
        // Only close when the press starts on the backdrop itself, so a drag
        // that ends outside the panel does not dismiss the form.
        if (event.target === event.currentTarget) onCloseRef.current?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full my-auto max-h-[90vh] overflow-y-auto text-left outline-none ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
