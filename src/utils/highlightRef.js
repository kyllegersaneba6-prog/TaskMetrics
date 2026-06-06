let _id = null;

export function setHighlightId(id) {
  _id = id;
}

export function consumeHighlight() {
  const id = _id;
  _id = null;
  return id;
}
