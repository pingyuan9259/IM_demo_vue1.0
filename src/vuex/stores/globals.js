// sotre - globals: 存储全局公用的状态
import cookie from '../../utils/cookie'
import { TOP_LEVEL_HOST, DEVICE_ID_KEY, USER_INFO_KEY, APP_TOKEN_KEY, APP_USERID_KEY } from '../../configs/'
import UUID from 'node-uuid'
import storage from '../../utils/storage'
import * as T from '../mutation-types'

// initial state
const state = {
  deviceId: '',
  userInfo: null,
  c10008State: false
}

// mutations
const mutations = {

  [T.GET_DEVICE_ID] (state) {
    let deviceId = storage.get(DEVICE_ID_KEY) || storage.get('_device_id')
    if (!deviceId) {
      deviceId = UUID.v4()
      cookie.setCookie(DEVICE_ID_KEY, deviceId, TOP_LEVEL_HOST, 30)
      cookie.setCookie('_device_id', deviceId, TOP_LEVEL_HOST, 30)
      storage.set(DEVICE_ID_KEY, deviceId)
      storage.set('_device_id', deviceId)
    }
    state.deviceId = deviceId
  },

  [T.END_GET_CHANNELS] (state) {
    state.c10008State = true
  },

  [T.DELETE_DEVICE_ID] (state) {
    storage.remove(DEVICE_ID_KEY)
    state.deviceId = ''
  },

  [T.SAVE_USER_INFO] (state, userInfo) {
    storage.set(USER_INFO_KEY, userInfo)
    cookie.setCookie(APP_TOKEN_KEY, userInfo.token, TOP_LEVEL_HOST, 30)
    cookie.setCookie('_app_token', userInfo.token, TOP_LEVEL_HOST, 30)
    cookie.setCookie(APP_USERID_KEY, userInfo.id, TOP_LEVEL_HOST, 30)
    cookie.setCookie('_app_userid', userInfo.id, TOP_LEVEL_HOST, 30)
    state.userInfo = userInfo
  }
}

export default {
  state,
  mutations
}
