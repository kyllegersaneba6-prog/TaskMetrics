export function formatDate(date) {
  if (!date) return "No deadline";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "No deadline";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isThisWeek(date) {
  if (!date) return false;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  const d = new Date(date);
  return d >= startOfWeek && d < endOfWeek;
}
