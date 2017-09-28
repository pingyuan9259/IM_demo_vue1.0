// sotre - globals: 存储 channel 的状态
import { set } from 'vue'
import * as T from '../mutation-types'
import { arrToObjByKey } from '../../utils/enhance'
import storage from '../../utils/storage'
import array from 'lodash/array'
import constants from '../../constants/'

// initial state
const state = {
  channels: {},                // 所有聊天列表数据
  channelsIndex: [],
  channelIndexActive: 0,
  channelsMembersCount: {},    // 群组人数数据
  curChannelId: '',            // 当前选中的 channel 的 id
  curChannelIdFromSingleChat: false,
  channelRoleInfo: {},
  chatForbiddenStatus: 0,      // 利用简单数据结构计数器来做变监听
  channelsLive: {},
  channelsLiveStatus: 0,
  curChannelFriendStatus: null,
  topChannels: [],             // 置顶会话
  normalChannelsWithMes: [],   // 普通会话（有最后一条消息的）
  normalChannelsWithoutMes: [], // 普通会话（没有最后一条消息的）
  handlerStatus: 0,
  channelsGroupPr: null
}

let sortArrayObject = (name) => {
  return (o, p) => {
    let a, b
    if (typeof o === 'object' && typeof p === 'object' && o && p) {
      a = o[name]
      b = p[name]
      if (a === b) {
        return 0
      }
      if (typeof a === typeof b) {
        return a < b ? 1 : -1
      }
      return typeof a < typeof b ? 1 : -1
    } else {
      throw new Error('sortArrayObject error')
    }
  }
}

const sortTopChannel = (channels) => {
  channels.sort(sortArrayObject('sort_time'))
  return channels
}

const sortNormalChannelWithMes = (channels, channelsMesNumTseq) => {
  for (let item of channels) {
    item.lastMessageCreatedAt = (channelsMesNumTseq && +channelsMesNumTseq[item.id].tseq) || 0 // new Date(item.lastMessage.created_at).getTime()
  }
  channels.sort(sortArrayObject('lastMessageCreatedAt'))
  return channels
}

const updateRoleInfo = (roleNew, roleInfo, isPermanent) => {
  let flag = false
  let roleRes = isPermanent ? roleInfo.permanent : roleInfo.temporary

  for (let item of roleRes) {
    if (roleNew.user_id !== item.user_id) {
      continue
    }
    flag = true
    item.role_code = roleNew.role_code
    item.unUsed = roleNew.type === 0 // 0: 去掉角色, 1: 设置角色
  }

  if (!flag) {
    roleRes.push({
      user_id: roleNew.user_id,
      role_code: roleNew.role_code,
      unUsed: roleNew.type === 0
    })
  }
}

const unUsedReporter = (info) => {
  for (let role of info) {
    if (role.role_code === constants.ROLE_SPEAKER_MASTER ||
      role.role_code === constants.ROLE_SPEAKER_DEFAULT ||
      role.role_code === constants.ROLE_SPEAKER) {
      role.unUsed = true
    }
  }
  return info
}

// mutations
const mutations = {
  [T.GET_CHANNELS] (state, channels) {
    let storedChannelLives = []
    let channelsMessagesNum = {}
    let channelsMesNumTseq = storage.get('channelsMesNumTseq') || {}

    for (let key in channels) {
      let item = channels[key]
      item.unRead = 0 // web端初始下，不再统计未读数 item.message_number - item.latest_read
      channelsMessagesNum[item.id] = item.message_number

      if (item.is_top === 1) {
        state.topChannels.push(item)
      } else if (channelsMesNumTseq[item.id]) {
        state.normalChannelsWithMes.push(item)
      } else {
        state.normalChannelsWithoutMes.push(item)
      }

      if (item.live_play_url) { // 正在直播的
        storedChannelLives.push(item)
      }
    }

    state.topChannels = sortTopChannel(state.topChannels)
    state.normalChannelsWithMes = sortNormalChannelWithMes(state.normalChannelsWithMes, channelsMesNumTseq)

    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channels = arrToObjByKey('id', sortedChannels)
    state.channelsLive = arrToObjByKey('id', storedChannelLives)
    state.channelsIndex = array.uniq(channelsIndex)
  },

  [T.SORT_CHANNELS_INDEX] (state, channelsMesNumTseq) {
    let storedChannelLives = []
    let channelsMessagesNum = {}
    let channels = state.channels

    for (let key in channels) {
      let item = channels[key]
      item.unRead = 0 // web端初始下，不再统计未读数 item.message_number - item.latest_read
      channelsMessagesNum[item.id] = item.message_number

      if (item.is_top === 1) {
        state.topChannels.push(item)
      } else if (channelsMesNumTseq[item.id]) {
        state.normalChannelsWithMes.push(item)
      } else {
        state.normalChannelsWithoutMes.push(item)
      }

      if (item.live_play_url) { // 正在直播的
        storedChannelLives.push(item)
      }
    }

    state.topChannels = sortTopChannel(state.topChannels)
    state.normalChannelsWithMes = sortNormalChannelWithMes(state.normalChannelsWithMes, channelsMesNumTseq)
    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channelsIndex = array.uniq(channelsIndex)
  },

  [T.SET_CUR_CHANNEL] (state, curChannelId) {
    state.curChannelId = curChannelId
  },

  [T.UPDATE_CHANNELS_MESSAGE_NUM] (state, channelId) {
    if (state.channels && state.channels[channelId]) {
      state.channels[channelId].message_number += 1
    }
  },

  [T.SINGLE_CHAT] (state, singleChat) {
    let channel = singleChat
    let curChannelId = channel.id
    let channelsMesNumTseq = storage.get('channelsMesNumTseq') || {}

    if (channel.is_top === 1) {
      // array.remove(state.topChannels, (o) => o.id === curChannelId)
      // state.topChannels.unshift(channel)
    } else if (channelsMesNumTseq[curChannelId]) {
      array.remove(state.normalChannelsWithMes, (o) => o.id === curChannelId)
      state.normalChannelsWithMes.unshift(channel)
    } else {
      array.remove(state.normalChannelsWithoutMes, (o) => o.id === curChannelId)
      state.normalChannelsWithoutMes.unshift(channel)
    }

    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channelsIndex = array.uniq(channelsIndex)

    state.channels = arrToObjByKey('id', sortedChannels)
    state.curChannelId = channel.id
    state.curChannelIdFromSingleChat = true
    state.channelIndexActive++
  },

  [T.REST_CUR_CHANNEL_FROM] () {
    state.curChannelIdFromSingleChat = false
  },

  [T.GET_CHANNEL_MEMBERS_COUNT] (state, channelId, count) {
    set(state.channelsMembersCount, channelId, count)
  },

  [T.UPDATE_CHANNELS_UNREAD] (state, channelId) {
    for (let item in state.channels) {
      let channel = state.channels[item]
      if (channelId === channel.id && state.curChannelId !== channelId) {
        state.channels[item].unRead++
        set(state.channels, channelId, state.channels[item])
        break
      }
    }
  },

  [T.SET_CHAT_FORBBIDEN] (state, data) {
    const channelId = data.channel_id
    let curChannel = state.channels[channelId]

    curChannel.mute_anything = data.type
    set(state.channels, channelId, curChannel)
    if (!state.channelsLive[channelId]) {
      state.channelsLive[channelId] = {}
    }
    state.channelsLive[channelId].mute_anything = data.type
    state.chatForbiddenStatus++
  },

  [T.SET_CHAT_FORBBIDEN_NOW] (state) {
    const curChannelId = state.curChannelId
    let curChannel = state.channels[curChannelId]
    curChannel.mute_anything = 1
    set(state.channels, curChannelId, curChannel)

    if (!state.channelsLive[curChannelId]) {
      state.channelsLive[curChannelId] = {}
    }
    state.channelsLive[curChannelId].mute_anything = 1
    state.chatForbiddenStatus++
  },

  [T.GET_ROLE_INFO_OF_CHANNELS] (state, data) {
    state.channelRoleInfo = data

    let result = {}
    for (let key in data) { // channles
      let item = data[key].permanent
      result[key] = {}
      for (let role of item) { // for roles
        result[key][role.user_id] = role.role_code
      }
    }
    state.channelsGroupPr = result
  },

  [T.CHANGE_ROLE_INFO_OF_CHANNELS] (state, data) {
    for (let roleNew of data.role_change) {
      let channelId = roleNew.channel_id
      let roleInfo = state.channelRoleInfo[channelId]

      if (!roleInfo) {
        roleInfo = {
          permanent: [],
          temporary: []
        }
      }

      // role_type 1：永久的操作, 0：临时的操作
      updateRoleInfo(roleNew, roleInfo, roleNew.role_type === 1)
    }
    state.handlerStatus++
  },

  [T.OPEN_LIVE] (state, data) {
    state.channelsLiveStatus++
    set(state.channelsLive, data.channel_id, data)
  },

  [T.CLOSE_LIVE] (state, data) {
    set(state.channelsLive, data.channel_id, data)

    // 关掉直播，需要清除所有演讲者信息
    unUsedReporter(state.channelRoleInfo[data.channel_id].permanent)
    unUsedReporter(state.channelRoleInfo[data.channel_id].temporary)
    state.channelsLiveStatus++
  },

  [T.TOGGLE_MIC] (state, data) {
    state.channelsLiveStatus++
    if (!state.channelsLive[data.channel_id]) {
      state.channelsLive[data.channel_id] = state.channels[data.channel_id]
    }
    state.channelsLive[data.channel_id].live_mic_status = data.live_mic_status
    state.channelsLive[data.channel_id].live_device_id = data.live_device_id
  },

  [T.UPDATE_CHANNEL_MIC_STATUS] (state, data) {
    state.channels[data.channel_id].live_mic_status = data.live_mic_status
  },

  [T.TOGGLE_BLACKBOARD] (state, data) {
    state.channelsLiveStatus++
    if (!state.channelsLive[data.channel_id]) {
      state.channelsLive[data.channel_id] = state.channels[data.channel_id]
    }
    state.channelsLive[data.channel_id].blackboard_status = data.status
  },

  [T.UPDATE_CHANNEL_BLACKBOARD_STATUS] (state, data) {
    if (state.channels[data.channel_id]) {
      state.channels[data.channel_id].blackboard_status = data.status
    }
  },

  [T.CHANGE_CHANNEL_INDEX] (state, curChannelId) {
    let channel = state.channels[curChannelId]
    let channelsMesNumTseq = storage.get('channelsMesNumTseq') || {}
    if (channel.is_top === 1) {
      // array.remove(state.topChannels, (o) => o.id === curChannelId)
      // state.topChannels.unshift(channel)
    } else if (channelsMesNumTseq[curChannelId]) {
      array.remove(state.normalChannelsWithMes, (o) => o.id === curChannelId)
      state.normalChannelsWithMes.unshift(channel)
    } else {
      array.remove(state.normalChannelsWithoutMes, (o) => o.id === curChannelId)
      state.normalChannelsWithoutMes.unshift(channel)
    }

    let sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)
    let channelsIndex = []

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channels = arrToObjByKey('id', sortedChannels)
    state.channelsIndex = array.uniq(channelsIndex)
    state.channelIndexActive++
  },

  [T.CHANNEL_INDEX_ACTIVE] (state) {
    state.channelIndexActive++
  },

  [T.SET_SEQ_OF_CHANNEL] (state, channelId) {
    state.channels[channelId].latest_read = state.channels[channelId].message_number
    state.channels[channelId].unRead = 0
  },

  [T.GET_FRIEND_STATUS] (state, isPublic) {
    state.curChannelFriendStatus = isPublic.type // 0 不是好友 1 好友  2 正在申请中 3 对方向我发送邀请 我还未接受 5 我已经被删除
  },

  [T.DESTORY_FRIEND_STATUS] (state) {
    state.curChannelFriendStatus = null
  },

  [T.ADD_NEW_CHANNEL] (state, channelItem) {
    let channel = channelItem
    let curChannelId = channel.id
    let channelsMesNumTseq = storage.get('channelsMesNumTseq') || {}
    let channelsIndex = []
    let sortedChannels = []

    if (channel.is_top === 1) {
      state.topChannels.push(channel)
    } else if (channelsMesNumTseq[curChannelId]) {
      state.normalChannelsWithMes.unshift(channel)
    } else {
      state.normalChannelsWithoutMes.unshift(channel)
    }

    channel.unRead = 1
    set(state.channels, curChannelId, channel)
    state.topChannels = sortTopChannel(state.topChannels)
    sortedChannels = array.concat(state.topChannels, state.normalChannelsWithMes, state.normalChannelsWithoutMes)

    for (let item of sortedChannels) {
      channelsIndex.push(item.id)
    }

    state.channels = arrToObjByKey('id', sortedChannels)
    state.channelsIndex = array.sortedUniq(channelsIndex)
  },

  [T.UPDATE_CHANNEL_LAST_MESSAGE] (state, curChannelId, message) {
    if (message) {
      state.channels[curChannelId].lastMessage = message
      state.channels[curChannelId].lastMessageCreatedAt = new Date(message.created_at).getTime()
    }
  }
}

export default {
  state,
  mutations
}
