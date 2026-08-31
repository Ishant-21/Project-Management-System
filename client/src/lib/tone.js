// One mapping from domain enums to Badge variants / accent colours, so a status
// looks the same everywhere it appears. Previously each component carried its
// own colour map and they had drifted apart.

export const PROJECT_STATUS_TONE = {
  PLANNING: "default",
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "brand",
  CANCELLED: "danger",
};

export const TASK_STATUS_TONE = {
  TODO: "default",
  IN_PROGRESS: "warning",
  DONE: "success",
};

// Severity ramp: low is calm, high is alarming.
export const PRIORITY_TONE = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export const TASK_TYPE_TONE = {
  TASK: "brand",
  BUG: "danger",
  FEATURE: "violet",
  IMPROVEMENT: "info",
  OTHER: "default",
};

// Solid dot / bar colours for the same scales, where a Badge would be too heavy.
export const PRIORITY_DOT = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-rose-500",
};

export const TASK_STATUS_DOT = {
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-amber-500",
  DONE: "bg-emerald-500",
};

export const PRIORITY_BAR = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-rose-500",
};

export const tone = (map, value, fallback = "default") => map[value] || fallback;
