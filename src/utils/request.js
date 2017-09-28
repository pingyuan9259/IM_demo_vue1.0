import Vue from 'vue'
import storage from './storage'
import base64 from './base64'
import cookie from './cookie'
import log from './logger'
import { URI_PREFIX, TOKEN, TOP_LEVEL_HOST, USER_INFO_KEY, APP_TOKEN_KEY } from '../configs/'
import { APP_ID } from '../configs/system'

export default {
  _checkToken (token) { // 防止刚登录成功后，token无法更新
    if (!token) {
      let userInfo = storage.get(USER_INFO_KEY)
      if (userInfo) {
        token = userInfo.token
      }
    }
    return token
  },

  _checkLogin (data) {
    if (+data.need_login !== 1 && +data.need_login !== 2) {
      return
    }
    storage.clear()
    cookie.delCookie(APP_TOKEN_KEY, TOP_LEVEL_HOST)
    window.history.go(0)
  },

  _logError (data, url) {
    if (data.code === 0) {
      log.error(`${url}'s request error:`, data)
    }
  },

  _logFail (data, url) {
    log.error(`${url}'s request fail:`, data)
  },

  init (params) {
    if (!params.url) {
      throw new Error('the lack of url of request')
    }
    Vue.http.headers.common['x-access-token'] = this._checkToken(TOKEN)
    Vue.http.headers.common['x-app-id'] = APP_ID
    Vue.http.headers.common['x-device-info'] = base64.encode(JSON.stringify({platform: 'web'}))
    Vue.http.options.emulateJSON = true
  },

  post (params) {
    return new Promise((resolve, reject) => {
      this.init(params)
      Vue.http.post(
        `${URI_PREFIX}${params.url}`,
        params.data || {}
      ).then((res) => {
        let data = res.data
        this._checkLogin(data)
        this._logError(data, params.url)
        resolve(data)
      }, (res) => {
        this._logFail(res.data, params.url)
        reject(res.data)
      })
    })
  },

  get (params) {
    return new Promise((resolve, reject) => {
      this.init(params)
      Vue.http.get(
        `${URI_PREFIX}${params.url}`,
        params.data || {}
      ).then((res) => {
        let data = res.data
        this._checkLogin(data)
        this._logError(data, params.url)
        resolve(data)
      }, (res) => {
        this._logFail(res.data, params.url)
        reject(res.data)
      })
    })
  }
}
