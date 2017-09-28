import Vue from 'vue'
import Vuex from 'vuex'
import { ENV } from '../configs/index'
import constants from '../constants/'
import storage from '../utils/storage'
import CreateLogger from './middlewares/createLogger'

import post from './stores/post'
import globals from './stores/globals'
import channel from './stores/channel'
import login from './stores/login'
import message from './stores/message'
import user from './stores/user'
import live from './stores/live'

const logger = CreateLogger({
  collapsed: true, // 自动展开输出的 mutations
  transformer (state) {
    return state[storage.get(constants.STORE_MODULE)]
  },
  mutationTransformer (mutation) {
    return mutation.type
  },
  storeTransformer () {
    return storage.get(constants.STORE_MODULE)
  }
})

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    post,
    globals,
    channel,
    login,
    message,
    user,
    live
  },
  middlewares: ENV !== 'pro' ? [logger] : []
})
