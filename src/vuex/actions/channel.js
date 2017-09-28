import { decorator } from './base'
import request from '../../utils/request'
import storage from '../../utils/storage'
import { arrToObjByKey } from '../../utils/enhance'
import * as T from '../mutation-types'
import queue from 'async/queue'

const getMessageBySeqChannelId = async (params) => {
  let res = await request.get({
    url: '/v3/message/m10003',
    data: {
      channel_id: params.channelId,
      seq: params.seq,
      limit: 1
    }
  })
  return res.result
}

const q = queue((task, callback) => {
  console.log('dispatch: ' + task.name)
  callback()
})

const channelActions = decorator({
  // 获取聊天列表
  async getChannels (dispatch, state) {
    const res = await request.get({ url: '/v3/channel/c10008' })
    let channels = res.result
    channels = arrToObjByKey('id', channels)

    q.push({name: 'GET_CHANNELS'}, (err) => {
      if (err) {
        console.log(err)
        return
      }

      dispatch(T.GET_CHANNELS, channels)
      dispatch(T.GET_LAST_MESSAGE_OF_CHANNELS, {})
      dispatch(T.END_GET_CHANNELS)
    })

    q.push({name: 'SORT_CHANNELS_INDEX'}, async (err) => {
      if (err) {
        console.log(err)
        return
      }
      // 获取发生消息变化的 channel 最后一条 message 的 tseq
      let lastMes = {}
      let channelsMesNumTseq = storage.get('channelsMesNumTseq') || {}

      for (let key in channels) {
        let item = channels[key]
        let cNum = channelsMesNumTseq[item.id] || {}

        if (cNum.message_number === undefined || +cNum.message_number !== +item.message_number) {
          lastMes = await getMessageBySeqChannelId({
            channelId: item.id,
            seq: item.message_number
          })
          channelsMesNumTseq[item.id] = {
            message_number: item.message_number,
            tseq: lastMes[0] && lastMes[0].tseq
          }
        }
      }

      storage.set('channelsMesNumTseq', channelsMesNumTseq)
      dispatch(T.SORT_CHANNELS_INDEX, channelsMesNumTseq)
    })
  },

  // 切换会话
  switchChannel (dispatch, state, curChannelId) {
    dispatch(T.SET_CUR_CHANNEL, curChannelId)
    dispatch(T.REST_CUR_CHANNEL_FROM)
  },

  // 获取单聊
  async singleChat (dispatch, state, personId) {
    const res = await request.get({
      url: '/v3/channel/c30001',
      data: {
        to: personId
      }
    })
    dispatch(T.SINGLE_CHAT, res.result)
  },

  // 获取单聊用户是否为好友关系
  async getFriendStatus (dispatch, state, userId) {
    const res = await request.post({
      url: '/v3/friends/my-friend',
      data: {
        user_id: userId
      }
    })
    dispatch(T.GET_FRIEND_STATUS, res.result)
  },

  // 初始化好友关系变量状态
  destoryFriendStatus (dispatch, state) {
    dispatch(T.DESTORY_FRIEND_STATUS)
  },

  // 获取 channel 人数
  async getChannelMembersCount (dispatch, state, channelId) {
    const res = await request.get({
      url: '/v3/channel/c10012',
      data: {
        channel_id: channelId
      }
    })
    dispatch(T.GET_CHANNEL_MEMBERS_COUNT, channelId, res.result)
  },

  // 同步本channel最后阅读消息seq
  async setSeqOfChannel (dispatch, state, channelId, tseq) {
    if (tseq) {
      await request.post({
        url: '/v3/channel/c10003',
        data: {
          tseq: tseq,
          channel_id: channelId
        }
      })
    }
    dispatch(T.SET_SEQ_OF_CHANNEL, channelId)
  },

  // 获取每个群的角色信息
  async getRoleInfoOfChannels (dispatch, state, channelIds) {
    const res = await request.post({
      url: '/v3/privilege/pr10003',
      data: {
        channel_ids: channelIds
      }
    })
    dispatch(T.GET_ROLE_INFO_OF_CHANNELS, res.result)
  },

  setChannelForbiddenNow (dispatch) {
    dispatch(T.SET_CHAT_FORBBIDEN_NOW)
  }

}, 'channel')

export default channelActions
