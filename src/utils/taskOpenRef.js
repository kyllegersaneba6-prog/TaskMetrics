let _pendingId = null;
const listeners = new Set();

export function emitTaskOpen(taskId) {
  _pendingId = taskId;
  listeners.forEach((fn) => fn(taskId));
}

export function consumePendingTaskId() {
  const id = _pendingId;
  _pendingId = null;
  return id;
}

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
