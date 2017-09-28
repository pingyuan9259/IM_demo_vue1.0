import storage from '../../utils/storage'

const F = (storeName, action) => {
  return ({ dispatch, state }, a, b, c, d, e) => {
    storage.set('store_module', storeName)
    action(dispatch, state, a, b, c, d, e)
  }
}

const decorator = (actions, storeName) => {
  for (let action in actions) {
    let fn = actions[action]
    const newFn = F(storeName, fn)
    actions[action] = newFn
  }
  return actions
}

export { decorator }
