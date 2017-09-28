import { decorator } from './base'
import request from '../../utils/request'
import { APP_ID } from '../../configs/system'
import * as T from '../mutation-types'

const postActions = decorator({
  // 获取所有文章
  async getAllPosts (dispatch, state, limit, page) {
    if (!page) {
      page = 1
    }
    let res = await request.get({
      url: '/v3/official-account/post/list',
      data: {
        id: APP_ID,
        type: 1,
        limit: limit,
        page: page
      }
    })
    dispatch(T.GET_ALL_POSTS, res.result)
  },

  // 获取当前群文章
  async getPostsByChannelId (dispatch, state, channelId, limit, page) {
    if (!page) {
      page = 1
    }
    let res = await request.get({
      url: '/v3/official-account/post/list',
      data: {
        id: channelId,
        type: 2,
        limit: limit,
        page: page
      }
    })
    dispatch(T.GET_CHANNEL_POSTS, res.result)
  },

  // 清空当前群文章
  clearPostsByChannelId (dispatch, state) {
    dispatch(T.CLEAR_POSTS_CHANNEL)
  },

  // 搜索所有文章
  async getSearchPosts (dispatch, state, searchVal, page) {
    if (!page) {
      page = 1
    }
    let res = await request.get({
      url: '/v3/official-account/post/search',
      data: {
        id: APP_ID,
        type: 1,
        q: searchVal,
        page: page
      }
    })
    dispatch(T.SEARCH_POSTS, res.result)
  },

  // 清空搜索的文章
  clearPostsOfSearch (dispatch, state) {
    dispatch(T.CLEAR_POSTS_SEARCH)
  },

  // 获取个人发布的文章
  async getPostsByPersonId (dispatch, state, personId, limit, page) {
    if (!page) {
      page = 1
    }
    let res = await request.get({
      url: '/v3/official-account/post/list',
      data: {
        id: personId,
        type: 3,
        limit: limit,
        page: page
      }
    })
    dispatch(T.GET_PERSON_POSTS, res.result)
  },

  // 清空个人的文章
  clearPostsOfPerson (dispatch, state) {
    dispatch(T.CLEAR_POSTS_PERSON)
  },

  // 获取在关闭postlist以后，再次打开时这个打开的状态
  openPostList (dispatch, state) {
    dispatch(T.OPEN_POST_LIST_STATUS)
  }
}, 'post')

export default postActions
