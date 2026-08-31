// Enum values arrive from Prisma in SCREAMING_SNAKE_CASE ("ON_HOLD", "IN_PROGRESS").
// The `capitalize` utility can't fix those on its own — it only uppercases the
// first letter and leaves the rest shouting — so normalise them here instead.
export const formatEnumLabel = (value) => {
  if (!value) return "";

  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
