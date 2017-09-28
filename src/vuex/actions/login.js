import { decorator } from './base'
import log from '../../utils/logger'
import request from '../../utils/request'
import { TOP_LEVEL_HOST, ENV } from '../../configs/'

import {
  GET_QR,
  GET_IDENTIFYING_CODE,
  GET_VOICE,
  CHECK_CLIENT_SUBMIT_LOGIN,
  LOGIN_SUCCESS
} from '../mutation-types'

const isDev = ENV.indexOf('dev') !== -1 ? '-dev' : ''
const loginActions = decorator({

  // 获取 qr
  getQr (dispatch, state) {
    let deviceId = state.globals.deviceId
    request.post({
      url: '/v3/l',
      data: {
        device_id: deviceId
      }
    }).then(
      (data) => {
        dispatch(GET_QR, data)
      },
      (err) => {
        log.error('getQr:', err)
      }
    )
  },

  // 检查客户端是否确认扫码登录
  checkClientSubmitLogin (dispatch, state) {
    let deviceId = state.globals.deviceId
    let qr = state.login.qr

    request.get({
      url: `/v3/l?qr=${qr}&device_id=${deviceId}`
    }).then(
      (data) => {
        dispatch(CHECK_CLIENT_SUBMIT_LOGIN, data)
      },
      (err) => {
        log.error('checkClientSubmitLogin:', err)
      }
    )
  },

  // 获取登录手机验证码
  getIdentifyingCode (dispatch, state, phone, fn) {
    let type = state.type || 0
    request.get({
      url: `/v3/passport/send-code?phone=${phone}&type=${type}&country_code=CN`
    }).then(
      (data) => {
        if (data.code !== 0) {
          dispatch(GET_IDENTIFYING_CODE, data)
          fn && fn()
        } else {
          window.alert(data.message)
        }
      },
      (err) => {
        log.error('getIdentifyingCode:', err)
      }
    )
  },

  // 获取语音验证码
  getVoice (dispatch, state, phone) {
    request.get({
      url: '/v3/passport/code/voice?phone=' + phone
    }).then(
      (data) => {
        dispatch(GET_VOICE, data)
      },
      (err) => {
        log.error('getVoice:', err)
      }
    )
  },

  // 登录成功，进入系统
  loginSuccess (dispatch, state) {
    window.location.href = `//post${isDev}.${TOP_LEVEL_HOST}`
    dispatch(LOGIN_SUCCESS)
  },

  // 手机号码登录验证，进入系统
  phoneLogin (dispatch, state, data, fn) {
    request.post({
      url: '/v3/passport/sign-in',
      data: data
    }).then(
      (data) => {
        if (data.code === 0 || data.code === 220000074) { // 未注册或出错
          window.alert(data.message)
          return false
        }
        window.location.href = `//post${isDev}.${TOP_LEVEL_HOST}`
        dispatch(LOGIN_SUCCESS)
        dispatch(CHECK_CLIENT_SUBMIT_LOGIN, data)
        fn && fn()
      },
      (err) => {
        log.error('loginSuccess2:', err)
      }
    )
  }
}, 'login')

export default loginActions
