import * as T from '../mutation-types'

const state = {
  qr: '',
  identifyingCode: '',
  qrStatus: false,
  isLogin: false,
  checkSubmitLogin: {
    code: ''
  },
  checkSublimeStatus: 0     // 轮询请求状态，若发生变化怎做出相应的改动
}

const mutations = {

  [T.GET_QR] (state, data) {
    if (data.code !== 1) {
      state.qrStatus = false
    } else {
      state.qrStatus = true
      state.qr = data.result
    }
  },

  [T.CHECK_CLIENT_SUBMIT_LOGIN] (state, data) {
    state.checkSubmitLogin = data
    state.checkSublimeStatus++
  },

  [T.LOGIN_SUCCESS] (state) {
    state.isLogin = true
  },

  [T.GET_IDENTIFYING_CODE] (state, data) {
    state.identifyingCode = data.result.key
  },

  [T.GET_VOICE] (state, data) {
    state.identifyingCode = data.result.key
  }
}

export default {
  state,
  mutations
}
