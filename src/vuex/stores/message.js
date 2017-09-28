import { set } from 'vue'
import * as T from '../mutation-types'
import array from 'lodash/array'

// initial state
const state = {
  messages: {},            // 所有 channel 的 messages 集合，作为存储用
  pushMessages: {},
  curMessage: [],          // 当前 channel 的 messages 集合，作为渲染用
  modifiedMessage: {},
  messageStatus: 0,
  seqMessages: {},         // 所有 channel 的 messages seq 标记
  lastMessages: {},        // 每个 channel 的最后一条 message
  blackBoardMessage: {},   // 小黑板信息
  renderMessageSource: -1, // 渲染的 message 的从哪里来： 0:第一次渲染； 1: 用户输入；2: socket 推送；3: loadMore
  imageTextMessage: {}     // 图文消息存储器
}

var by = (name) => {
  return (o, p) => {
    let a, b
    if (typeof o === 'object' && typeof p === 'object' && o && p) {
      a = o[name]
      b = p[name]
      if (a === b) {
        return 0
      }
      if (typeof a === typeof b) {
        return a < b ? -1 : 1
      }
      return typeof a < typeof b ? -1 : 1
    }
  }
}

const mergeNormalMesAndPushMes = (normalMessages, pushMessages) => {
  if (!pushMessages || pushMessages.length === 0) {
    return normalMessages
  }
  let allMessages = []
  allMessages = array.concat(allMessages, normalMessages, pushMessages)
  allMessages = allMessages.sort(by('tseq'))
  return allMessages
}

// mutations
const mutations = {
  [T.GET_MESSAGES] (state, channelId, normalMessagesInfo, pushMessagesInfo) {
    // 普通消息
    let messages = normalMessagesInfo.messages
    let newSeq = normalMessagesInfo.newSeq
    let curMsg = state.messages[channelId]

    if (!curMsg) { // 首次点开 channel，对应 messages 为空的时候
      state.messages[channelId] = messages
    } else {       // 分页存储数据
      state.messages[channelId] = array.concat(messages, state.messages[channelId])
    }

    state.seqMessages[channelId] = newSeq

    if (newSeq === 1) {
      state.seqMessages[channelId] = 0
    }

    // 全体推送消息
    let curPushMsg = state.pushMessages[channelId]
    let pushMessages = pushMessagesInfo.data || null

    if (!curPushMsg) {
      state.pushMessages[channelId] = pushMessages
    } else {
      state.pushMessages[channelId] = array.concat(pushMessages, state.pushMessages[channelId])
    }

    // 合并消息普通和全体推送消息
    let allMessages = {}
    allMessages = mergeNormalMesAndPushMes(state.messages[channelId], state.pushMessages[channelId])

    state.curMessage = allMessages
  },

  [T.SEND_TEXT_MESSAGE] (state, message) { // 废弃
    set(state.lastMessages, message.channel_id, message)
    state.curMessage.push(message)
  },

  [T.GET_CUR_MESSAGE] (state, channelId) {
    let curMessage = state.messages[channelId]
    if (curMessage) {
      state.curMessage = curMessage
    } else {
      state.curMessage = []
    }
  },

  [T.CLEAR_MESSAGES] (state) {
    state.messages = {}
    state.curMessage = []
    state.pushMessages = {}
  },

  [T.UPDATE_LAST_CUR_MESSAGE] (state, curChannelId, message) {
    set(state.lastMessages, message.channel_id, message)
    if (curChannelId === message.channel_id) {
      state.curMessage.push(message)
    }
  },

  [T.PUT_IN_MESSAGE_ID] (state, message) {
    let channelId = message.channel_id
    let index = array.findIndex(state.messages[channelId], { tseq: message.tseq })
    if (index === -1) {
      return
    }
    state.messages[channelId][index].id = message.id
  },

  [T.GET_LAST_MESSAGE_OF_CHANNELS] (state, lastMessages) {
    state.lastMessages = lastMessages
  },

  [T.SEND_BLACK_BOARD] (state, data) {
    let index = array.findIndex(state.curMessage, {
      id: data.message_id
    })
    state.blackBoardMessage = state.curMessage[index]
  },

  [T.CHANGE_RENDER_MESSAGE_SOURCE] (state, type) {
    state.renderMessageSource = type
  },

  [T.SAVE_IMAGE_TEXT_MESSAGE] (state, channelId, message) {
    if (!state.imageTextMessage[channelId]) {
      state.imageTextMessage[channelId] = {}
    }
    state.imageTextMessage[channelId][message.tseq] = message
  },

  [T.PUT_IMAGE_TEXT_MESSAGE_IN_LAST_MESSAGE] (state, curChannelId, channelId, message) {
    message.creator = message.user_id
    set(state.lastMessages, channelId, message)
    if (curChannelId === channelId) {
      state.curMessage.push(message)
    }
  },

  [T.DELETE_REVOKE_MESSAGE] (state, message, curChannelId) {
    state.modifiedMessage = {}
    if (message.curChannelId === message.channel_id) {
      for (let i = 0, len = state.curMessage.length; i < len; i++) {
        let item = state.curMessage[i]
        if (message.id === item.id) {
          state.curMessage[i] = message
          break
        }
      }
    }
    state.modifiedMessage = message
    if (message._status === -1) {
      message.content = ''
    }
    state.lastMessages[message.channel_id] = message
    state.messageStatus++
  }
}

export default {
  state,
  mutations
}
