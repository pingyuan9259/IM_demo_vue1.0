import { decorator } from './base'
import storage from '../../utils/storage'
import { USER_INFO_KEY } from '../../configs/'
import request from '../../utils/request'
// import * as T from '../mutation-types'

const _openLive = async (dispatch, state, callback) => {
  const curChannelId = state.channel.curChannelId
  const curChannel = state.channel.channels[curChannelId]

  const res = await request.post({
    url: '/v3/channel/c50002',
    data: {
      channel_id: curChannelId,
      live_schema: curChannel.live_schema || 1
    }
  })

  if (res.code === 1) {
    callback(res.result)
  }
}

const _closeLive = async (dispatch, state, callback) => {
  const curChannelId = state.channel.curChannelId

  const res = await request.post({
    url: '/v3/channel/c50003',
    data: {
      channel_id: curChannelId
    }
  })

  if (res.code === 1) {
    try {
      window.mymedia.stopRecordClicked()
    } catch (err) {
      console && console.log(err)
    }
    callback(res.result)
  }
}

const liveActions = decorator({
  async openLive (dispatch, state, callback) {
    _openLive(dispatch, state, callback)
  },

  async closeLive (dispatch, state, callback) {
    _closeLive(dispatch, state, callback)
  },

  toggleLive (dispatch, state, liveStatus, callback) {
    liveStatus ? _openLive(dispatch, state, callback) : _closeLive(dispatch, state, callback)
  },

  async sendFile (ispatch, state, filePath, url) {
    try {
      window.mymedia.fileSendClicked(filePath, url)
    } catch (err) {
      console && console.log(err)
    }
  },

  async toggleMic (dispatch, state, micStatus, callback, url) {
    const curChannelId = state.channel.curChannelId
    const curChannel = state.channel.channels[curChannelId]
    const userInfo = storage.get(USER_INFO_KEY)

    const res = await request.post({
      url: '/v3/channel/live-mic-status',
      data: {
        channel_id: curChannelId,
        schema: curChannel.live_schema,
        live_mic_status: micStatus ? 1 : 0,
        live_device_id: userInfo.device_id
      }
    })

    if (res.code === 1) {
      try {
        micStatus ? window.mymedia.openMicClicked(url) : window.mymedia.stopRecordClicked()
      } catch (err) {
        console && console.log(err)
      }
      callback(res.result)
    }
  },

  async toggleCanChat (dispatch, state, canChatStatus, callback) {
    const curChannelId = state.channel.curChannelId

    const res = await request.post({
      url: '/v3/channel/c50004',
      data: {
        channel_id: curChannelId,
        type: canChatStatus ? 1 : 0 // 禁言类型 1：开启，0：关闭
      }
    })

    if (res.code === 1) {
      callback(res.result)
    }
  },

  async toggleBlackBoard (dispatch, state, blackBoardStatus, callback) {
    const curChannelId = state.channel.curChannelId

    const res = await request.post({
      url: '/v3/channel/c50001',
      data: {
        channel_id: curChannelId,
        status: blackBoardStatus ? 1 : 0 // 小黑板状态 1：开启，0：关闭
      }
    })

    if (res.code === 1) {
      callback(res.result)
    }
  },

  async sendMesToBlackBoard (dispatch, state, channelId, messageId, callback) {
    const res = await request.post({
      url: '/v3/channel/c50000',
      data: {
        channel_id: channelId,
        message_id: messageId
      }
    })

    if (res.code === 1) {
      callback(res.result)
    }
  }

}, 'live')

export default liveActions
