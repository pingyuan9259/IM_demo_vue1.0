import moment from 'moment'
import socket from '../../utils/socket'
import storage from '../../utils/storage'
import cookie from '../../utils/cookie'
import { decorator } from './base'
import { SOCKET_URI, USER_INFO_KEY, APP_TOKEN_KEY, TOP_LEVEL_HOST } from '../../configs/'
import constants from '../../constants/'
import request from '../../utils/request'
import queue from 'async/queue'
import * as T from '../mutation-types'

const q = queue((task, callback) => {
  console.log('socket: ' + task.socket)
  callback()
})

const socketM10000Queue = (dispatch, state, data, err) => {
  if (err) {
    console.log(err)
    return
  }

  if (!state.globals.c10008State) {
    return
  }

  let channelId = data.channel_id
  let userInfo = storage.get(USER_INFO_KEY)

  if (!state.channel.channels[channelId]) {
    // if (userInfo.id === data.creator) { // 如果该条消息是自己在手机端发送的
    getChannelById(channelId, (channelItem) => {
      dispatch(T.ADD_NEW_CHANNEL, channelItem) // to channel
    })
    // } else { // 如果 channelList 中没有该 channel
    //   singleChat(data.creator, (channelItem) => {
    //     dispatch(T.ADD_NEW_CHANNEL, channelItem) // to channel
    //   })
    // }
  }

  dispatch(T.CHANGE_RENDER_MESSAGE_SOURCE, constants.RENDER_PUSH)
  dispatch(T.UPDATE_LAST_CUR_MESSAGE, state.channel.curChannelId, data) // 存储推送过来的信息到 curMessage & messages
  dispatch(T.UPDATE_CHANNELS_MESSAGE_NUM, data.channel_id) // update message_number of messages in store
  // dispatch(T.UPDATE_CHANNEL_LAST_MESSAGE, state.channel.curChannelId, data) // 更新 channels 中的 lastMessage & lastMessageCreatedAt

  if (userInfo.id !== data.creator) {
    data.message_type !== constants.MESSAGE_SERVICE && dispatch(T.UPDATE_CHANNELS_UNREAD, data.channel_id) // to channel store, 更新未读数（只针对非当前curChannelId）
  }
  // channel 置顶非自己发的消息
  !!state.channel.channels[channelId] && dispatch(T.CHANGE_CHANNEL_INDEX, data.channel_id)
}

const socketM11000Queue = (dispatch, state, data, err) => {
  if (err) {
    console.log(err)
    return
  }

  if (!state.globals.c10008State) {
    return
  }

  dispatch(T.PUT_IN_MESSAGE_ID, data) // 对m10000存储的信息进行补充ID
}

const socketM20000Queue = (dispatch, state, data, err) => {
  if (err) {
    console.log(err)
    return
  }

  const userId = data.content.user_id
  const channels = state.channel.channels
  let channelId = ''

  for (let item in channels) {
    if (channels[item].type === constants.SINGLE_CHANNEL && channels[item].user_id === userId) {
      channelId = channels[item].id
      break
    }
  }

  if (!channelId) { // 推送的频道不在频道列表中，不处理
    return
  }

  dispatch(T.PUT_IMAGE_TEXT_MESSAGE_IN_LAST_MESSAGE, state.channel.curChannelId, channelId, data.content)
  dispatch(T.SAVE_IMAGE_TEXT_MESSAGE, channelId, data.content)
}

const socketP10000Queue = (dispatch, state, data, err) => {
  if (err) {
    console.log(err)
    return
  }

  if (!state.globals.c10008State) {
    return
  }

  let curChannelId = state.channel.curChannelId
  switch (data.action) {
    case 5:  // 离开(主动退出和被动踢出) 向离开者推送
      break
    case 6:  // 有人离开频道 向频道中其他人推送离开者id
      break
    case 7:  // 有人加入频道 向频道中其他人推送加入者id
      break
    case 8:  // 小黑板上面发送消息
      if (curChannelId === data.channel_id) {
        dispatch(T.SEND_BLACK_BOARD, data)
      }
      break
    case 9:  // 小黑板状态推送
      if (curChannelId !== data.channel_id) {
        dispatch(T.UPDATE_CHANNEL_BLACKBOARD_STATUS, data)
        return
      }
      dispatch(T.TOGGLE_BLACKBOARD, data)
      break
    case 10: // 设置群成员角色
      dispatch(T.CHANGE_ROLE_INFO_OF_CHANNELS, data)
      break
    case 11: // 开启直播
      dispatch(T.OPEN_LIVE, data)
      break
    case 12: // 设置全体禁言
      dispatch(T.SET_CHAT_FORBBIDEN, data)
      break
    case 14: // 关闭直播
      dispatch(T.CLOSE_LIVE, data)
      break
    case 18: // app 添加好友，web 及时同步
      if (curChannelId && state.channel.channels[curChannelId].user_id === data.user.user_id) {
        dispatch(T.GET_FRIEND_STATUS, { type: constants.IS_FRIEND })
      }
      break
    case 19: // app 删除好友，web 及时同步
      if (curChannelId && state.channel.channels[curChannelId].user_id === data.user_id) {
        dispatch(T.GET_FRIEND_STATUS, { type: constants.DELETED_FRIEND })
      }
      break
    case 20: // 麦克风状态推送
      if (curChannelId !== data.channel_id) {
        dispatch(T.UPDATE_CHANNEL_MIC_STATUS, data)
        return
      }
      dispatch(T.TOGGLE_MIC, data)
      break
    case 25: // 删除撤回某条消息
      dispatch(T.DELETE_REVOKE_MESSAGE, data, curChannelId)
      break
    case 26: // 被其他设备挤出登录
      const loginDatetime = moment(data.login_date).format('YYYY-MM-DD HH:mm:ss')
      window.alert(`你的新生大学账号于 ${loginDatetime} 在其他设备上登录。如果这不是你的操作，你的账号密码可能已经泄露。请尽快通过APP登录新生大学账号进行密码修改，或者通过APP直接重设密码。`)
      storage.clear()
      cookie.delCookie(APP_TOKEN_KEY, TOP_LEVEL_HOST)
      window.history.go(0)
  }
}

const getChannelById = async (channelId, callback) => {
  let res = await request.get({
    url: '/v3/channel/c10009',
    data: {
      channel_id: channelId
    }
  })
  callback(res.result)
}

const globalsActions = decorator({

  // 获取 device id
  getDeviceId (dispatch, state) {
    dispatch(T.GET_DEVICE_ID)
  },

  // 清除已存储的 device id
  deleteDeviceId (dispatch, state) {
    dispatch(T.DELETE_DEVICE_ID)
  },

  // 存储登录用户个人信息
  saveUserInfo (dispatch, state, userInfo) {
    dispatch(T.SAVE_USER_INFO, userInfo)
  },

  // 初始化Socket
  socketInit (dispatch, state, userInfo) {
    socket.init({
      deviceId: userInfo.device_id,
      token: userInfo.token,
      uri: SOCKET_URI,
      userId: userInfo.id
    })
  },

  // 监听获取 message 的 Socket
  async socketListener (dispatch, state) {
    socket.on('PING', (data) => { // 创建初始单聊，需要自己通过PING事件去获取信息
      socket.emit('PING', data, () => {})
    })

    socket.on('M10000', (data) => {
      q.push({socket: 'M10000'}, (err) => {
        socketM10000Queue(dispatch, state, data, err)
      })
    })

    socket.on('M11000', (data) => {
      q.push({socket: 'M11000'}, (err) => {
        socketM11000Queue(dispatch, state, data, err)
      })
    })

    socket.on('M20000', (data) => {
      q.push({socket: 'M20000'}, (err) => {
        socketM20000Queue(dispatch, state, data, err)
      })
    })

    socket.on('P10000', (data) => {
      q.push({socket: 'P10000'}, (err) => {
        socketP10000Queue(dispatch, state, data, err)
      })
    })
  }
}, 'globals')

export default globalsActions
