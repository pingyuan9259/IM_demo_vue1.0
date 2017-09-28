import { decorator } from './base'
import request from '../../utils/request'
import { USERS_LIMIT } from '../../configs/index'

import * as T from '../mutation-types'

const userActions = decorator({

  // 根据用户ids获取用户信息
  async getUserInfoByIds (dispatch, state, ids) {
    if (ids.length === 0) {
      return
    }
    let res = await request.post({
      url: '/v3/user/u10001',
      data: {
        user_ids: ids
      }
    })
    dispatch(T.GET_USER_INFO, res.result)
  },

  // 获取频道成员
  async getUsersOfChannel (dispatch, state, channelId, page) {
    let d = new Date()
    let res = await request.get({
      url: '/v3/user/u10003',
      data: {
        channel_id: channelId,
        page: page,
        limit: USERS_LIMIT,
        timestamp: d.getTime()
      }
    })
    dispatch(T.GET_MEMBERS_OF_CHANNEL, channelId, res.result)
  },

  // 搜索频道里面的群成员
  async searchUsersOfChannel (dispatch, state, channelId, searchVal, page) {
    let res = await request.get({
      url: '/v3/user/u10002',
      data: {
        channel_id: channelId,
        page: page,
        limit: USERS_LIMIT,
        search_text: searchVal
      }
    })
    dispatch(T.SEARCH_MEMBERS_OF_CHANNEL, channelId, res.result)
  },

  // 获取用户详情
  async getUserDetail (dispatch, state, userId) {
    let userData = state.user.userDetail
    if (userData && userData[userId]) {
      return dispatch(T.GET_USER_DETAIL, userData[userId])
    }
    let res = await request.get({
      url: '/v3/user/detail',
      data: {
        user_id: userId
      }
    })
    dispatch(T.GET_USER_DETAIL, res.result)
  }
}, 'user')

export default userActions
