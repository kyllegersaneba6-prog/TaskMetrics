const store = {
  openId: null,
  closeFns: {},
};

export function registerCard(id, closeFn) {
  store.closeFns[id] = closeFn;
  return () => {
    delete store.closeFns[id];
  };
}

export function closeAll() {
  if (store.openId && store.closeFns[store.openId]) {
    store.closeFns[store.openId]();
  }
  store.openId = null;
}

export function setOpenId(id) {
  store.openId = id;
}

export function getOpenId() {
  return store.openId;
}
