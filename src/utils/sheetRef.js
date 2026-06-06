let sheetOpen = false;
const listeners = new Set();

export function setSheetOpen(value) {
  sheetOpen = value;
  listeners.forEach((fn) => fn(value));
}

export function isSheetOpen() {
  return sheetOpen;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
